const Product = require('../../models/Product');
const Customer = require('../../models/Customer');
const { calculateDiscounts } = require('../discount/discountEngine');
const { assessDealHealth } = require('../dealHealth/dealHealthEngine');
const { getUpsellRecommendations } = require('../upsell/upsellEngine');

/**
 * Executes end-to-end CPQ pricing calculation, risk analysis, and upsell generation.
 * @param {Object} input - { customerId, items: [{ productId, quantity, discountPercent }] }
 * @returns {Object} Complete pricing breakdown, deal health, and recommendations
 */
const processQuotationCalculation = async ({ customerId, items = [] }) => {
  let customer = null;
  if (customerId) {
    customer = await Customer.findById(customerId);
  }

  // Hydrate product details for all items
  const hydratedItems = [];
  const productIds = [];

  for (const item of items) {
    const product = await Product.findById(item.productId || item.product);
    if (product) {
      productIds.push(product._id);
      hydratedItems.push({
        product: product._id,
        productName: product.name,
        sku: product.sku,
        category: product.category,
        listPrice: product.basePrice,
        unitCost: product.unitCost,
        quantity: item.quantity || 1,
        discountPercent: item.discountPercent || 0
      });
    }
  }

  // 1. Calculate line items, discounts, and margins
  const discountResult = calculateDiscounts(hydratedItems, customer || {});

  // 2. Assess blended deal health & risk
  const dealHealth = assessDealHealth({
    blendedMarginPercent: discountResult.blendedMarginPercent,
    totalDiscountPercent: discountResult.totalDiscountPercent,
    customer: customer || {},
    grandTotal: discountResult.grandTotal
  });

  // 3. Generate smart upsells
  const upsellRecommendations = await getUpsellRecommendations(productIds);

  return {
    customer,
    ...discountResult,
    dealHealth,
    upsellRecommendations,
    requiresApproval: discountResult.requiresApproval || dealHealth.riskScore >= 50,
    approvalReason: [
      ...discountResult.approvalReasons,
      ...(dealHealth.riskScore >= 50 ? [`High deal risk score (${dealHealth.riskScore}/100)`] : [])
    ].join('; ')
  };
};

module.exports = {
  processQuotationCalculation
};
