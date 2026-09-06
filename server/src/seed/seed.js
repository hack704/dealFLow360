const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('../config/db');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const DiscountRule = require('../models/DiscountRule');
const Quotation = require('../models/Quotation');
const ApprovalRequest = require('../models/ApprovalRequest');
const ApprovalRule = require('../models/ApprovalRule');
const Inventory = require('../models/Inventory');
const Subscription = require('../models/Subscription');
const Invoice = require('../models/Invoice');
const DealHealth = require('../models/DealHealth');
const PriceList = require('../models/PriceList');
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
    await ApprovalRequest.deleteMany();
    await ApprovalRule.deleteMany();
    await Inventory.deleteMany();
    await Subscription.deleteMany();
    await Invoice.deleteMany();
    await DealHealth.deleteMany();
    await PriceList.deleteMany();

    // 1. Seed Users
    const users = await User.create([
      {
        _id: '660000000000000000000001',
        name: 'Alex Rivera',
        email: 'alex@dealflow360.com',
        password: 'password123',
        role: ROLES.SALES_REP,
        department: 'Enterprise Sales'
      },
      {
        _id: '660000000000000000000002',
        name: 'Sarah Vance',
        email: 'sarah@dealflow360.com',
        password: 'password123',
        role: ROLES.SALES_MANAGER,
        department: 'Sales Leadership'
      },
      {
        _id: '660000000000000000000003',
        name: 'Marcus Chen',
        email: 'admin@dealflow360.com',
        password: 'password123',
        role: ROLES.ADMIN,
        department: 'Operations'
      },
      {
        _id: '660000000000000000000004',
        name: 'David Sterling',
        email: 'finance@dealflow360.com',
        password: 'password123',
        role: ROLES.FINANCE,
        department: 'Finance & Operations'
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

    // 4. Seed Discount & Approval Rules
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

    await ApprovalRule.create([
      {
        name: 'Hardware Ceiling Rule',
        category: 'Hardware',
        maxDiscountCeiling: 15,
        minMarginFloor: 20,
        requiredApproverRole: 'sales_manager'
      },
      {
        name: 'Software Ceiling Rule',
        category: 'Software',
        maxDiscountCeiling: 25,
        minMarginFloor: 40,
        requiredApproverRole: 'finance'
      }
    ]);

    // 5. Seed Inventory across Warehouses
    await Inventory.create([
      {
        product: products[0]._id,
        sku: products[0].sku,
        warehouse: 'Main Warehouse',
        quantityOnHand: 45,
        quantityReserved: 12
      },
      {
        product: products[0]._id,
        sku: products[0].sku,
        warehouse: 'East Depot',
        quantityOnHand: 18,
        quantityReserved: 4
      }
    ]);

    // 6. Seed Quotations
    const quote1 = await Quotation.create({
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

    const quote2 = await Quotation.create({
      quotationNumber: 'Q-1042',
      title: 'Acme Corp Fleet Refresh',
      customer: customers[0]._id,
      customerName: customers[0].name,
      items: [
        {
          product: products[0]._id,
          productName: 'Laptop Pro 14 (Hardware)',
          sku: 'HW-LPT-14',
          category: 'Hardware',
          quantity: 18,
          listPrice: 1200,
          unitCost: 800,
          discountPercent: 12,
          discountAmount: 2592,
          netUnitPrice: 1056,
          lineTotal: 19008,
          marginAmount: 4608,
          marginPercent: 24.2
        },
        {
          product: products[4]._id,
          productName: 'Onsite Setup Service',
          sku: 'SV-SETUP',
          category: 'Services',
          quantity: 1,
          listPrice: 450,
          unitCost: 150,
          discountPercent: 18,
          discountAmount: 81,
          netUnitPrice: 369,
          lineTotal: 369,
          marginAmount: 219,
          marginPercent: 59.3
        }
      ],
      subtotal: 22050,
      totalCost: 14550,
      totalDiscountAmount: 2673,
      totalDiscountPercent: 12.1,
      grandTotal: 19377,
      blendedMarginPercent: 24.9,
      riskScore: 54,
      riskLevel: 'moderate',
      requiresApproval: true,
      approvalReason: 'Onsite Setup Service: 18% discount exceeds standard 10% limit',
      status: 'pending_approval',
      paymentTermsDays: 30,
      createdBy: users[0]._id
    });

    // 7. Seed Approval Request
    await ApprovalRequest.create({
      quotation: quote2._id,
      quotationNumber: quote2.quotationNumber,
      customerName: quote2.customerName,
      submittedBy: users[0]._id,
      submitterName: users[0].name,
      dealValue: quote2.grandTotal,
      blendedMarginPercent: quote2.blendedMarginPercent,
      maxDiscountPercent: 18,
      riskScore: quote2.riskScore,
      currentStage: 'Sales Manager',
      flaggedLines: [
        {
          productName: 'Laptop Pro 14',
          discountGiven: 12,
          limitAllowed: 15,
          isOver: false
        },
        {
          productName: 'Onsite Setup Service',
          discountGiven: 18,
          limitAllowed: 10,
          isOver: true
        }
      ],
      status: 'pending',
      auditTrail: [
        {
          user: users[0].name,
          action: 'Submitted',
          note: 'Submitted 18% discount exception for Acme competitive bid.'
        }
      ]
    });

    // 8. Seed Subscriptions
    await Subscription.create([
      {
        subscriptionNumber: 'SUB-1042',
        quotation: quote1._id,
        customer: customers[0]._id,
        customerName: customers[0].name,
        planName: 'Care Plan 2yr',
        billingCycle: 'Monthly',
        amount: 46,
        status: 'Active',
        startDate: new Date(),
        nextBillDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      },
      {
        subscriptionNumber: 'SUB-1043',
        quotation: quote1._id,
        customer: customers[1]._id,
        customerName: customers[1].name,
        planName: 'Support SLA Platinum',
        billingCycle: 'Quarterly',
        amount: 300,
        status: 'Active',
        startDate: new Date(),
        nextBillDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
      }
    ]);

    // 9. Seed Invoices
    await Invoice.create([
      {
        invoiceNumber: 'INV-1042',
        quotation: quote2._id,
        customer: customers[0]._id,
        customerName: customers[0].name,
        type: 'One-Time Order',
        items: [
          { item: 'Laptop Pro 14 (Hardware)', quantity: 2, unitPrice: 1200, discountPercent: 10, total: 2160 },
          { item: 'Onsite Setup Service', quantity: 1, unitPrice: 450, discountPercent: 0, total: 450 }
        ],
        subtotal: 2610,
        taxAmount: 120,
        grandTotal: 2730,
        status: 'Unpaid',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
      },
      {
        invoiceNumber: 'INV-1043',
        quotation: quote1._id,
        customer: customers[0]._id,
        customerName: customers[0].name,
        type: 'Recurring Monthly',
        items: [
          { item: 'Care Plan 2yr (Cycle 1 of 24)', quantity: 1, unitPrice: 46, discountPercent: 0, total: 46 }
        ],
        subtotal: 46,
        taxAmount: 0,
        grandTotal: 46,
        status: 'Paid',
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        paidAt: new Date()
      }
    ]);

    // 10. Seed Deal Health
    await DealHealth.create([
      {
        quotation: quote2._id,
        quotationNumber: 'Q-1042',
        customerName: 'Acme Corp',
        salesRepName: 'J. Rao',
        dealValue: 28400,
        issue: 'Split delivery delayed +4 days',
        issueType: 'slippage',
        riskScore: 54,
        actionTaken: 'Warehouse notice sent',
        actionStatus: 'pending'
      },
      {
        quotationNumber: 'Q-1030',
        customerName: 'Zenith Co',
        salesRepName: 'J. Rao',
        dealValue: 18300,
        issue: 'Idle 9 days without customer activity',
        issueType: 'stalled',
        riskScore: 68,
        actionTaken: 'Nudge sent',
        actionStatus: 'done'
      },
      {
        quotationNumber: 'Q-1025',
        customerName: 'Delta LLC',
        salesRepName: 'M. Chen',
        dealValue: 34900,
        issue: 'Discount 22% vs avg 8%',
        issueType: 'discount',
        riskScore: 84,
        actionTaken: 'Escalated to Manager',
        actionStatus: 'pending'
      }
    ]);

    // 11. Seed Price Lists
    await PriceList.create([
      { name: 'Standard Bronze Tier', tier: 'Bronze', currency: 'USD', priceRule: 'Price, no adjustment' },
      { name: 'Preferred Gold Tier', tier: 'Gold', currency: 'USD', priceRule: 'Price minus 10 percent base', discountModifierPercent: 10 },
      { name: 'Enterprise Partner Tier', tier: 'Enterprise Partner', currency: 'USD', priceRule: 'Price minus 18 percent base', discountModifierPercent: 18 }
    ]);

    console.log('[SEED] Demo data seeded successfully across all modules! 🚀');
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
