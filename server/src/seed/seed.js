const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('../config/db');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const DiscountRule = require('../models/DiscountRule');
const Quotation = require('../models/Quotation');
const { ROLES } = require('../config/constants');

const seedData = async () => {
  try {
    await connectDB();
    console.log('[SEED] Connected to DB, clearing existing collections...');

    await User.deleteMany();
    await Customer.deleteMany();
    await Product.deleteMany();
    await DiscountRule.deleteMany();
    await Quotation.deleteMany();

    // 1. Seed Users
    const users = await User.create([
      {
        name: 'Alex Rivera',
        email: 'alex@dealflow360.com',
        password: 'password123',
        role: ROLES.SALES_REP,
        department: 'Enterprise Sales'
      },
      {
        name: 'Sarah Vance',
        email: 'sarah@dealflow360.com',
        password: 'password123',
        role: ROLES.SALES_MANAGER,
        department: 'Sales Leadership'
      },
      {
        name: 'Marcus Chen',
        email: 'admin@dealflow360.com',
        password: 'password123',
        role: ROLES.ADMIN,
        department: 'Operations'
      }
    ]);
    console.log(`[SEED] Created ${users.length} demo users`);

    // 2. Seed Customers
    const customers = await Customer.create([
      {
        name: 'Acme Global Enterprises',
        industry: 'Logistics & Supply Chain',
        tier: 'Enterprise',
        creditRating: 'AAA',
        paymentTermsDays: 45,
        contactEmail: 'procurement@acme.com',
        annualRevenue: 500000000
      },
      {
        name: 'Stark Dynamics',
        industry: 'Defense & Aerospace',
        tier: 'Enterprise',
        creditRating: 'AA',
        paymentTermsDays: 30,
        contactEmail: 'deals@starkdynamics.io',
        annualRevenue: 250000000
      },
      {
        name: 'Cyberdyne Systems',
        industry: 'Robotics & AI',
        tier: 'Mid-Market',
        creditRating: 'A',
        paymentTermsDays: 30,
        contactEmail: 'purchasing@cyberdyne.ai',
        annualRevenue: 45000000
      },
      {
        name: 'Initech Software',
        industry: 'FinTech',
        tier: 'SMB',
        creditRating: 'BBB',
        paymentTermsDays: 15,
        contactEmail: 'billing@initech.net',
        annualRevenue: 8000000
      }
    ]);
    console.log(`[SEED] Created ${customers.length} demo customers`);

    // 3. Seed Products
    const products = await Product.create([
      {
        name: 'DealFlow360 Enterprise Core',
        sku: 'DF-CORE-001',
        category: 'Software',
        pricingType: 'recurring_annual',
        basePrice: 48000,
        unitCost: 8000,
        description: 'Core deal lifecycle platform with workflow automations and RBAC'
      },
      {
        name: 'AI Deal Health & Risk Scoring Module',
        sku: 'DF-AI-RISK',
        category: 'Software',
        pricingType: 'recurring_annual',
        basePrice: 18000,
        unitCost: 3000,
        description: 'Predictive win scoring, blended margin guards, and anomaly detection'
      },
      {
        name: 'Dynamic Pricing & Advanced CPQ Engine',
        sku: 'DF-CPQ-PRO',
        category: 'Software',
        pricingType: 'recurring_annual',
        basePrice: 24000,
        unitCost: 4000,
        description: 'Tiered volume matrices, currency normalization, and discount rules'
      },
      {
        name: '24/7 Dedicated Support & VIP SLA',
        sku: 'DF-SUP-VIP',
        category: 'Support',
        pricingType: 'recurring_annual',
        basePrice: 12000,
        unitCost: 4000,
        isAddon: true,
        description: '15-minute response SLA, designated solutions architect, and phone line'
      },
      {
        name: 'Enterprise Onboarding & Migration Service',
        sku: 'DF-PS-MIG',
        category: 'Professional Services',
        pricingType: 'one_time',
        basePrice: 15000,
        unitCost: 7500,
        isAddon: true,
        description: 'Turnkey ERP/CRM integration, legacy quotation migration, and training'
      },
      {
        name: 'Advanced Billing & Proration Suite',
        sku: 'DF-BILL-PRO',
        category: 'Software',
        pricingType: 'recurring_annual',
        basePrice: 14000,
        unitCost: 2500,
        description: 'Automated invoice generation, mid-cycle prorations, and subscription renewals'
      }
    ]);
    console.log(`[SEED] Created ${products.length} demo products`);

    // 4. Seed Discount Rules
    await DiscountRule.create([
      {
        name: 'High Volume Enterprise Bracket',
        tier: 'Enterprise',
        minQuantity: 50,
        discountPercent: 15,
        requiresApprovalAbove: 20
      },
      {
        name: 'Standard Volume Discount',
        tier: 'All',
        minQuantity: 10,
        discountPercent: 5,
        requiresApprovalAbove: 15
      }
    ]);

    // 5. Seed an initial Quotation for instant demoing
    await Quotation.create({
      quotationNumber: 'QT-DEMO-2026',
      title: 'Acme Global Q1 Expansion Deal',
      customer: customers[0]._id,
      customerName: customers[0].name,
      items: [
        {
          product: products[0]._id,
          productName: products[0].name,
          sku: products[0].sku,
          category: products[0].category,
          quantity: 2,
          listPrice: products[0].basePrice,
          unitCost: products[0].unitCost,
          discountPercent: 10,
          discountAmount: 9600,
          netUnitPrice: 43200,
          lineTotal: 86400,
          marginAmount: 70400,
          marginPercent: 81.48
        },
        {
          product: products[1]._id,
          productName: products[1].name,
          sku: products[1].sku,
          category: products[1].category,
          quantity: 1,
          listPrice: products[1].basePrice,
          unitCost: products[1].unitCost,
          discountPercent: 5,
          discountAmount: 900,
          netUnitPrice: 17100,
          lineTotal: 17100,
          marginAmount: 14100,
          marginPercent: 82.46
        }
      ],
      subtotal: 114000,
      totalCost: 19000,
      totalDiscountAmount: 10500,
      totalDiscountPercent: 9.21,
      grandTotal: 103500,
      blendedMarginPercent: 81.64,
      riskScore: 15,
      riskLevel: 'low',
      requiresApproval: false,
      status: 'approved',
      paymentTermsDays: 45,
      notes: 'Strategic multi-year engagement with key tier 1 customer',
      createdBy: users[0]._id
    });

    console.log('[SEED] Demo data seeded successfully! 🚀');
    if (require.main === module) {
      process.exit(0);
    }
  } catch (err) {
    console.error('[SEED ERROR]', err);
    if (require.main === module) {
      process.exit(1);
    }
    throw err;
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;
