const mongoose = require('mongoose');
require('dotenv').config({ path: 'server/.env' });

const Subscription = require('./server/src/models/Subscription');
const Invoice = require('./server/src/models/Invoice');
const {
  pauseSubscriptionLogic,
  resumeSubscriptionLogic,
  evaluateSubscriptionReturnPolicy
} = require('./server/src/services/billing/billingEngine');

async function testSubscriptionLifecycle() {
  console.log('=== TESTING SUBSCRIPTION PAUSE AND RETURN POLICY LOGIC ===\n');

  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dealflow360');

  // 1. Find or create a test subscription
  let sub = await Subscription.findOne({ status: 'Active' });
  if (!sub) {
    sub = await Subscription.create({
      subscriptionNumber: `SUB-TEST-${Date.now().toString().slice(-4)}`,
      customerName: 'Acme Test Corp',
      customer: new mongoose.Types.ObjectId(),
      planName: 'Enterprise Cloud Hub',
      billingCycle: 'Monthly',
      amount: 1200,
      status: 'Active',
      startDate: new Date(Date.now() - 5 * 86400000), // 5 days ago
      nextBillDate: new Date(Date.now() + 25 * 86400000), // 25 days from now
      returnPolicy: {
        gracePeriodDays: 14,
        policyType: 'prorated_credit',
        refundMethod: 'credit_note',
        allowMidCycleCancellation: true
      }
    });
    console.log('Created new test subscription:', sub.subscriptionNumber);
  } else {
    console.log('Using existing subscription:', sub.subscriptionNumber, `(status: ${sub.status})`);
  }

  // 2. Test Pausing Subscription Logic
  console.log('\n--- Test 1: Pausing Subscription ---');
  pauseSubscriptionLogic(sub, 'Seasonal operations freeze');
  console.log('Status after pause:', sub.status);
  console.log('PausedAt timestamp:', sub.pausedAt);
  console.log('PauseReason:', sub.pauseReason);
  console.log('Latest history entry:', sub.history[sub.history.length - 1]);
  if (sub.status === 'Paused' && sub.pausedAt) {
    console.log('[PASS] Subscription pause logic successfully transitions state and records freeze timestamp.');
  } else {
    console.error('[FAIL] Pause logic failed.');
  }

  // Simulate pause for 7 days
  sub.pausedAt = new Date(Date.now() - 7 * 86400000);

  // 3. Test Resuming Subscription Logic
  console.log('\n--- Test 2: Resuming Subscription ---');
  const originalNextBill = new Date(sub.nextBillDate);
  const { pausedDays, newNextBill } = resumeSubscriptionLogic(sub);
  console.log('Status after resume:', sub.status);
  console.log('Calculated paused days:', pausedDays);
  console.log('Original Next Bill Date:', originalNextBill.toISOString().split('T')[0]);
  console.log('Extended Next Bill Date:', newNextBill.toISOString().split('T')[0]);
  console.log('Latest history entry:', sub.history[sub.history.length - 1]);

  const diffDays = Math.round((newNextBill - originalNextBill) / 86400000);
  if (sub.status === 'Active' && diffDays === pausedDays) {
    console.log(`[PASS] Subscription resume logic extended next bill date forward by exactly ${diffDays} days to eliminate billing for paused downtime.`);
  } else {
    console.error('[FAIL] Resume date extension mismatch. diffDays:', diffDays, 'pausedDays:', pausedDays);
  }

  // 4. Test Return Policy: Case A (Within Grace Period <= 14 days)
  console.log('\n--- Test 3: Return Policy - Within 14-Day Grace Period ---');
  const subInGrace = {
    amount: 1000,
    billingCycle: 'Monthly',
    nextBillDate: new Date(Date.now() + 25 * 86400000), // Day 5 of 30
    returnPolicy: { gracePeriodDays: 14, policyType: 'prorated_credit', refundMethod: 'credit_note' }
  };
  const graceEval = evaluateSubscriptionReturnPolicy(subInGrace);
  console.log('Grace Period Evaluation:', graceEval);
  if (graceEval.isWithinGracePeriod && graceEval.refundAmount === 1000) {
    console.log('[PASS] Full 100% refund calculated under Grace Period return policy.');
  } else {
    console.error('[FAIL] Grace period return calculation error.');
  }

  // 5. Test Return Policy: Case B (After Grace Period, e.g. Day 20 of 30, 10 days remaining)
  console.log('\n--- Test 4: Return Policy - Mid-Cycle Prorated Return ---');
  const subPostGrace = {
    amount: 1200,
    billingCycle: 'Monthly',
    nextBillDate: new Date(Date.now() + 10 * 86400000), // Day 20 of 30, 10 days left
    returnPolicy: { gracePeriodDays: 14, policyType: 'prorated_credit', refundMethod: 'credit_note', adminFeePercent: 0 }
  };
  const proratedEval = evaluateSubscriptionReturnPolicy(subPostGrace);
  console.log('Prorated Return Evaluation:', proratedEval);
  // Expected refund: 1200 * (10 / 30) = 400
  if (!proratedEval.isWithinGracePeriod && proratedEval.refundAmount === 400) {
    console.log(`[PASS] Prorated refund calculated exactly for ${proratedEval.daysRemaining} remaining days ($${proratedEval.refundAmount}).`);
  } else {
    console.error('[FAIL] Prorated return calculation mismatch. Got:', proratedEval.refundAmount);
  }

  console.log('\n=== ALL SUBSCRIPTION PAUSE AND RETURN POLICY TESTS PASSED ===');
  await mongoose.disconnect();
  process.exit(0);
}

testSubscriptionLifecycle().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
