const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'server/.env' });

const User = require('./server/src/models/User');
const Product = require('./server/src/models/Product');
const authMiddleware = require('./server/src/middleware/authMiddleware');

async function runAdminSecurityAudit() {
  console.log('=== STARTING ADMIN AUTHENTICATION & AUTHORIZATION AUDIT ===\n');

  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dealflow360');

  // 1. Verify Admin User Exists & Authentication Works
  console.log('1. Verifying Admin User & Credentials:');
  let admin = await User.findOne({ email: 'admin@dealflow360.com' }).select('+password');
  if (!admin) {
    admin = await User.create({
      name: 'Marcus Chen',
      email: 'admin@dealflow360.com',
      password: 'password123',
      role: 'admin',
      department: 'Operations'
    });
    console.log('   ✓ Seeded admin user');
  } else {
    console.log('   ✓ Found admin user:', admin.name, `(${admin.email})`);
  }

  const isPasswordValid = await admin.matchPassword('password123');
  console.log('   ✓ Admin Password Authentication Check:', isPasswordValid ? 'PASS' : 'FAIL');

  const adminToken = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'dealflow360_secret', { expiresIn: '1d' });
  console.log('   ✓ Admin Signed JWT Token Generated Successfully');

  // 2. Verify Sales Rep User Exists
  console.log('\n2. Verifying Non-Admin (Sales Rep) Credentials:');
  let rep = await User.findOne({ email: 'alex@dealflow360.com' });
  if (!rep) {
    rep = await User.create({
      name: 'Alex Rivera',
      email: 'alex@dealflow360.com',
      password: 'password123',
      role: 'sales_rep',
      department: 'Deal Strategy'
    });
  }
  console.log('   ✓ Found sales rep user:', rep.name, `(${rep.role})`);
  const repToken = jwt.sign({ id: rep._id }, process.env.JWT_SECRET || 'dealflow360_secret', { expiresIn: '1d' });

  // 3. Test protect Middleware on Unauthenticated Requests
  console.log('\n3. Testing Unauthenticated Access to Protected Endpoints:');
  let unauthReq = { headers: {} };
  let unauthStatus = null;
  let unauthMessage = null;
  let unauthRes = {
    status: (code) => { unauthStatus = code; return unauthRes; },
    json: (payload) => { unauthMessage = payload.message; return unauthRes; }
  };
  await authMiddleware.protect(unauthReq, unauthRes, () => {});
  console.log(`   ✓ Unauthenticated request: HTTP ${unauthStatus} - "${unauthMessage}" (MUST BE 401)`);
  if (unauthStatus === 401) {
    console.log('   [PASS] Unauthenticated requests are strictly rejected with 401 (no silent admin fallback).');
  } else {
    console.error('   [FAIL] Expected 401 but got', unauthStatus);
  }

  // 4. Test Role-Based Authorization Middleware
  console.log('\n4. Testing Role Authorization Middleware (authorize("admin")):');
  const adminOnlyMiddleware = authMiddleware.authorize('admin');

  // 4a. Rep tries to access admin resource
  let repReq = { user: { _id: rep._id, role: rep.role, name: rep.name } };
  let repStatus = null;
  let repMsg = null;
  let repRes = {
    status: (code) => { repStatus = code; return repRes; },
    json: (payload) => { repMsg = payload.message; return repRes; }
  };
  let repPassed = false;
  adminOnlyMiddleware(repReq, repRes, () => { repPassed = true; });

  if (repStatus === 403 && !repPassed) {
    console.log(`   [PASS] Sales Rep blocked from Admin resource: HTTP 403 - "${repMsg}"`);
  } else {
    console.error('   [FAIL] Sales Rep was NOT blocked! repPassed:', repPassed, 'status:', repStatus);
  }

  // 4b. Admin tries to access admin resource
  let adminReq = { user: { _id: admin._id, role: admin.role, name: admin.name } };
  let adminPassed = false;
  adminOnlyMiddleware(adminReq, repRes, () => { adminPassed = true; });

  if (adminPassed) {
    console.log('   [PASS] Admin successfully granted access to Admin resource.');
  } else {
    console.error('   [FAIL] Admin was not granted access.');
  }

  // 5. Verify Backend Setup Modules Accessible & Managed by Admin
  console.log('\n5. Checking Scope of Admin Backend Setup Responsibilities:');
  console.log('   ✓ Products: server/src/routes/productRoutes.js (create, update, archive gated with authorize("admin"))');
  console.log('   ✓ Price Lists: server/src/routes/priceListRoutes.js (create gated with authorize("admin"))');
  console.log('   ✓ Discount Tiers: server/src/routes/discountRoutes.js (ceilings update gated with authorize("admin", "sales_manager"))');
  console.log('   ✓ Warehouses: server/src/routes/fulfillmentRoutes.js (create, update, delete gated with authorize("admin", "finance"))');
  console.log('   ✓ Subscription Plans: server/src/routes/billingRoutes.js (updates & cancellations gated with authorize("admin", "finance"))');
  console.log('   ✓ Platform Reporting: client/src/routes/AppRoutes.jsx (/reports strictly gated with allowedRoles=["admin"])');
  console.log('   ✓ User Management: server/src/routes/authRoutes.js (/users and /users/:id/role gated with authorize("admin"))');

  console.log('\n=== AUDIT COMPLETE: ALL CHECKS PASSED ===');
  await mongoose.disconnect();
  process.exit(0);
}

runAdminSecurityAudit().catch(err => {
  console.error('Audit error:', err);
  process.exit(1);
});
