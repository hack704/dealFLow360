const http = require('http');

const request = (method, path, data = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path: `/api${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

async function runTests() {
  console.log('================================================================');
  console.log('   DEALFLOW360 — 5 ROLES & DATA INTEGRITY VERIFICATION SUITE   ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, title) {
    if (condition) {
      console.log(`✅ PASS: ${title}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${title}`);
      failed++;
    }
  }

  try {
    // 1. Authenticate users
    const repEmail = `alex.rep.${Date.now()}@dealflow360.com`;
    const repReg = await request('POST', '/auth/register', {
      name: 'Alex Rivera',
      email: repEmail,
      password: 'password123',
      role: 'sales_rep',
      department: 'Enterprise Sales'
    });
    const repToken = repReg.data.data.token;
    const repUser = repReg.data.data;
    assert(repToken, 'Rep login returns token');

    const mgrLogin = await request('POST', '/auth/login', { email: 'sarah@dealflow360.com', password: 'password123' });
    const mgrToken = mgrLogin.data.data.token;
    assert(mgrToken, 'Manager login returns token');

    const adminLogin = await request('POST', '/auth/login', { email: 'admin@dealflow360.com', password: 'password123' });
    const adminToken = adminLogin.data.data.token;
    assert(adminToken, 'Admin login returns token');

    // Fetch customers and products
    const custRes = await request('GET', '/customers');
    const customers = custRes.data.data;
    const prodRes = await request('GET', '/products');
    const products = prodRes.data.data;
    assert(customers.length > 0 && products.length > 0, 'Catalog data loaded');

    // -------------------------------------------------------------------------
    // TEST ROLE 1: SALES REP
    // -------------------------------------------------------------------------
    console.log('\n--- 1. SALES REP TESTS ---');

    // 1.1 Rep creates quotation with 20% discount (exceeds rep 15% threshold -> requires approval)
    const quoteRes = await request('POST', '/quotations', {
      customerId: customers[0]._id,
      title: 'Enterprise ERP Suite Deal',
      submitForApproval: true,
      items: [
        {
          productId: products[0]._id,
          quantity: 25,
          discountPercent: 20
        }
      ]
    }, { Authorization: `Bearer ${repToken}` });

    const quote = quoteRes.data.data;
    assert(quoteRes.status === 201 && quote.requiresApproval === true, 'Rep quote with 20% discount triggers requiresApproval = true');
    assert(quote.status === 'pending_approval', 'Quote status set to pending_approval');

    // 1.2 Sales Rep Self-Approval Ban: Rep attempts to approve their own quotation
    const appReqRes = await request('GET', '/approvals');
    const pendingReq = appReqRes.data.data.find(r => r.quotationNumber === quote.quotationNumber || r.quotation?._id === quote._id);
    assert(pendingReq, 'Approval request created for quote in governance queue');

    const selfApproveRes = await request('POST', `/approvals/${pendingReq._id}/action`, {
      action: 'approve',
      note: 'Self approving as rep'
    }, { Authorization: `Bearer ${repToken}` });

    assert(selfApproveRes.status !== 200, 'Integrity Rule: Sales Rep self-approval is strictly blocked by server');

    // 1.3 Line edits blocked after leaving draft status
    const lineEditRes = await request('PUT', `/quotations/${quote._id}`, {
      items: [{ productId: products[0]._id, quantity: 50, discountPercent: 10 }]
    }, { Authorization: `Bearer ${repToken}` });

    if (lineEditRes.status !== 400) {
      console.log('lineEditRes failure:', lineEditRes);
    }
    assert(lineEditRes.status === 400, 'Integrity Rule: Rep line mutations blocked once quote leaves draft status');

    // 1.4 Sales Rep responds to customer negotiation requests
    const counterSubRes = await request('POST', `/negotiations/${quote._id}/counter`, {
      counterDiscountPercent: 22,
      requestedDate: '2026-10-30',
      customerComment: 'Customer requests 22% discount for expedited sign-off.'
    });
    assert(counterSubRes.status === 200, 'Customer successfully submits counter-offer on quote');

    // Rep accepts counter-terms
    const repAcceptRes = await request('POST', `/negotiations/${quote._id}/respond`, {
      action: 'accept',
      responseComment: 'Sales Rep accepts 22% counter terms on account.'
    }, { Authorization: `Bearer ${repToken}` });

    assert(repAcceptRes.status === 200, 'Sales Rep responds to negotiation: accepts customer counter terms');
    assert(repAcceptRes.data.data?.negotiation?.status === 'Accepted by Sales', 'Negotiation status updated to Accepted by Sales');
    assert(repAcceptRes.data.data?.quotation?.requiresApproval === true, 'Discount > 15% properly routes quote to manager approval queue');

    // Rep submits revised compromise counter
    const repCompromiseRes = await request('POST', `/negotiations/${quote._id}/respond`, {
      action: 'counter',
      revisedDiscountPercent: 14,
      responseComment: 'Sales Rep offers revised compromise of 14% with free priority dispatch.'
    }, { Authorization: `Bearer ${repToken}` });

    assert(repCompromiseRes.status === 200, 'Sales Rep responds to negotiation: submits revised compromise offer');
    assert(repCompromiseRes.data.data?.negotiation?.requestedDiscountPercent === 14, 'Revised discount of 14% recorded in negotiation');
    assert(repCompromiseRes.data.data?.negotiation?.status === 'Counter-Offered', 'Negotiation status reset to Counter-Offered for customer review');

    // -------------------------------------------------------------------------
    // TEST ROLE 2: SALES MANAGER
    // -------------------------------------------------------------------------
    console.log('\n--- 2. SALES MANAGER TESTS ---');

    // 2.1 Rejection without reason is rejected
    const rejectNoReason = await request('POST', `/approvals/${pendingReq._id}/action`, {
      action: 'reject',
      note: ''
    }, { Authorization: `Bearer ${mgrToken}` });
    assert(rejectNoReason.status !== 200, 'Integrity Rule: Governance rejection requires mandatory reason');

    // 2.2 Manager approval writes immutable audit row and advances/approves
    const approveWithNote = await request('POST', `/approvals/${pendingReq._id}/action`, {
      action: 'approve',
      note: 'Approved 20% discount under strategic enterprise quarter promotion'
    }, { Authorization: `Bearer ${mgrToken}` });

    if (approveWithNote.status !== 200) {
      console.log('approveWithNote error:', approveWithNote);
    }
    assert(approveWithNote.status === 200, 'Manager approves quotation successfully');
    const updatedReq = approveWithNote.data?.data;
    const lastAudit = updatedReq?.auditTrail?.[updatedReq.auditTrail.length - 1];
    assert(lastAudit && lastAudit.user.includes('Sarah Vance'), 'Integrity Rule: Decision appends immutable audit row with approver name');

    // 2.3 Deal Health corrective action logs who triggered it and when
    const dhRes = await request('POST', `/deal-health/${quote.quotationNumber}/action`, {
      actionType: 'Manager Rep Nudge',
      note: 'Follow up on customer signature'
    }, { Authorization: `Bearer ${mgrToken}` });
    assert(dhRes.status === 200 && dhRes.data.data.triggeredBy === 'Sarah Vance', 'Integrity Rule: Deal health nudge logged with manager name and timestamp');

    // -------------------------------------------------------------------------
    // TEST ROLE 3: FINANCE / OPERATIONS
    // -------------------------------------------------------------------------
    console.log('\n--- 3. FINANCE / OPERATIONS TESTS ---');

    // 3.1 Idempotent Payment Recording
    const invList = await request('GET', '/billing/invoices');
    const invoices = invList.data.data;
    assert(invoices.length > 0, 'Auto-billing generated invoices on approval');
    const testInvoice = invoices[0];

    const pay1 = await request('POST', `/billing/invoices/${testInvoice._id}/pay`, {
      method: 'ACH Transfer',
      transactionId: 'TXN-001'
    }, { Authorization: `Bearer ${adminToken}` });
    assert(pay1.status === 200 && pay1.data.data.status === 'Paid', 'Payment recorded on invoice');

    const pay2 = await request('POST', `/billing/invoices/${testInvoice._id}/pay`, {
      method: 'ACH Transfer',
      transactionId: 'TXN-001'
    }, { Authorization: `Bearer ${adminToken}` });
    assert(pay2.status === 200 && pay2.data.message.includes('idempotent no-op'), 'Integrity Rule: Duplicate payment is idempotent no-op without balance corruption');

    // 3.2 Subscription cancellation creates separate Credit Note ledger entry
    const subList = await request('GET', '/billing/subscriptions');
    const subs = subList.data.data;
    assert(subs.length > 0, 'Active subscriptions list available');
    const testSub = subs[0];

    const cancelSubRes = await request('POST', `/billing/subscriptions/${testSub._id}/cancel`, {
      reason: 'Customer downsizing licenses mid-cycle',
      refundPercent: 40
    }, { Authorization: `Bearer ${adminToken}` });

    assert(cancelSubRes.status === 200 && cancelSubRes.data.data.creditNote, 'Integrity Rule: Subscription cancellation creates separate Credit Note ledger invoice');
    assert(cancelSubRes.data.data.creditNote.type === 'Credit Note', 'Credit Note invoice has type Credit Note');

    // 3.3 Warehouse Split Overrides cannot exceed depot availability
    const invalidSplitRes = await request('POST', `/fulfillment/${quote.quotationNumber}/confirm-split`, {
      splits: [
        {
          warehouse: 'Main Warehouse',
          qty: 999999 // Exceeds inventory on hand
        }
      ]
    }, { Authorization: `Bearer ${adminToken}` });
    // 3.4 Finance Approval Stage Sequencing Integrity: Finance cannot approve quote at Sales Manager stage
    const financeLogin = await request('POST', '/auth/register', {
      name: 'Elena Rostova',
      email: `elena.${Date.now()}@dealflow360.com`,
      password: 'password123',
      role: 'finance',
      department: 'Finance & Operations'
    });
    const financeToken = financeLogin.data?.data?.token;

    // Create fresh quote that requires Sales Manager approval first
    const stagedQuoteRes = await request('POST', '/quotations', {
      customerId: customers[0]._id,
      title: 'Staged Approval Integrity Quote',
      submitForApproval: true,
      items: [{ productId: products[0]._id, quantity: 10, discountPercent: 18 }]
    }, { Authorization: `Bearer ${repToken}` });
    const stagedAppReqRes = await request('GET', '/approvals');
    const stagedReq = stagedAppReqRes.data.data.find(r => r.quotationNumber === stagedQuoteRes.data.data.quotationNumber);

    if (stagedReq && financeToken) {
      const financePrematureApprove = await request('POST', `/approvals/${stagedReq._id}/action`, {
        action: 'approve',
        note: 'Premature finance sign-off'
      }, { Authorization: `Bearer ${financeToken}` });
      assert(financePrematureApprove.status !== 200, 'Integrity Rule: Finance approval is structurally unreachable before Sales Manager approval');
    }

    // -------------------------------------------------------------------------
    // TEST ROLE 4: CUSTOMER PORTAL
    // -------------------------------------------------------------------------
    console.log('\n--- 4. CUSTOMER PORTAL TESTS ---');

    // 4.1 Confirm gate checks approval status: cannot confirm rejected deal
    const rejectedQuoteRes = await request('POST', '/quotations', {
      customerId: customers[0]._id,
      title: 'Rejected Deal Test',
      items: [{ productId: products[0]._id, quantity: 1, discountPercent: 0 }]
    }, { Authorization: `Bearer ${repToken}` });
    const rejQuote = rejectedQuoteRes.data.data;

    await request('PATCH', `/quotations/${rejQuote._id}/status`, { status: 'rejected' }, { Authorization: `Bearer ${adminToken}` });

    const confirmRejected = await request('PATCH', `/quotations/${rejQuote._id}/status`, { status: 'confirmed' });
    assert(confirmRejected.status === 400, 'Integrity Rule: Final confirmation gate rejects confirmation on rejected deals');

    // 4.2 Customer Counter-Offer recomputes risk score with same CPQ engine
    const counterRes = await request('POST', `/negotiations/${quote._id}/counter`, {
      counterDiscountPercent: 28,
      customerComment: 'We request 28% discount for volume enterprise commitment'
    });
    assert(counterRes.status === 200 && counterRes.data.data.requiresEscalation === true, 'Integrity Rule: Customer counter-discount re-evaluates risk and triggers governance escalation');

    // -------------------------------------------------------------------------
    // TEST ROLE 5: ADMIN
    // -------------------------------------------------------------------------
    console.log('\n--- 5. ADMIN TESTS ---');

    // 5.1 Discount ceiling validation: 0-100%
    const invalidCeiling = await request('PUT', '/discounts/ceilings', {
      rules: [{ tier: 'Gold', category: 'Hardware', maxDiscountCeiling: 150 }]
    }, { Authorization: `Bearer ${adminToken}` });
    assert(invalidCeiling.status === 400, 'Integrity Rule: Admin discount ceiling > 100% rejected');

    // 5.2 Product Archival performs soft-delete, never hard-delete
    const newProdRes = await request('POST', '/products', {
      name: `Disposable Hardware Module ${Date.now()}`,
      sku: `DHW-${Date.now().toString().slice(-5)}`,
      category: 'Hardware',
      basePrice: 500,
      unitCost: 200,
      description: 'Test product for soft-delete verification'
    }, { Authorization: `Bearer ${adminToken}` });
    const prodToArchive = newProdRes.data?.data;

    const archiveRes = await request('PATCH', `/products/${prodToArchive._id}/archive`, {}, { Authorization: `Bearer ${adminToken}` });
    assert(archiveRes.status === 200 && archiveRes.data.data.isActive === false, 'Integrity Rule: Product archival performs soft-delete (isActive: false) to preserve quote/invoice references');

    // 5.3 Warehouse deletion blocked if active reserved stock exists
    const delWarehouseRes = await request('DELETE', `/fulfillment/warehouses/${encodeURIComponent('Main Warehouse')}`, null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(delWarehouseRes.status === 400, 'Integrity Rule: Warehouse with active reserved stock cannot be deleted');

    // 5.4 User Role Change is audit logged
    const promoCandidate = await request('POST', '/auth/register', {
      name: 'Taylor Swift',
      email: `taylor.${Date.now()}@dealflow360.com`,
      password: 'password123',
      role: 'sales_rep',
      department: 'Sales Team'
    });
    const candidateId = promoCandidate.data?.data?._id;
    if (candidateId) {
      const roleChangeRes = await request('PATCH', `/auth/users/${candidateId}/role`, {
        role: 'sales_manager',
        reason: 'Promoted to Sales Manager after closing major Q3 enterprise target'
      }, { Authorization: `Bearer ${adminToken}` });
      assert(roleChangeRes.status === 200, 'Admin updates user role');
      assert(roleChangeRes.data.data.roleAuditTrail.length > 0, 'Integrity Rule: Role promotion recorded in user roleAuditTrail');
      assert(roleChangeRes.data.data.roleAuditTrail[0].changedBy === 'Marcus Chen', 'Integrity Rule: Audit trail records admin name who changed role');
    }

    console.log('\n================================================================');
    console.log(`   TEST RESULTS: ${passed} PASSED, ${failed} FAILED               `);
    console.log('================================================================\n');

  } catch (err) {
    console.error('Test suite error:', err);
  }
}

runTests();
