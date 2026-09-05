const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const customerRoutes = require('./customerRoutes');
const productRoutes = require('./productRoutes');
const quotationRoutes = require('./quotationRoutes');
const approvalRoutes = require('./approvalRoutes');
const fulfillmentRoutes = require('./fulfillmentRoutes');
const billingRoutes = require('./billingRoutes');
const dealHealthRoutes = require('./dealHealthRoutes');
const discountRoutes = require('./discountRoutes');
const negotiationRoutes = require('./negotiationRoutes');
const priceListRoutes = require('./priceListRoutes');

router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/products', productRoutes);
router.use('/quotations', quotationRoutes);
router.use('/approvals', approvalRoutes);
router.use('/fulfillment', fulfillmentRoutes);
router.use('/billing', billingRoutes);
router.use('/deal-health', dealHealthRoutes);
router.use('/discounts', discountRoutes);
router.use('/negotiations', negotiationRoutes);
router.use('/price-lists', priceListRoutes);

module.exports = router;
