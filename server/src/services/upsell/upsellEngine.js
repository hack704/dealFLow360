const Product = require('../../models/Product');

/**
 * Generates intelligent upsell and cross-sell suggestions based on items in the quotation.
 * @param {Array} currentItemProductIds - IDs of products already added
 * @returns {Array} List of suggested addon products with rationale
 */
const getUpsellRecommendations = async (currentItemProductIds = []) => {
  try {
    const existingIds = currentItemProductIds.map((id) => id.toString());

    // Find addons or complementary products not yet in the quote
    const candidates = await Product.find({
      _id: { $nin: existingIds },
      isActive: true
    }).limit(6);

    const recommendations = candidates.map((prod) => {
      let rationale = 'Frequently bundled with enterprise configurations';
      let projectedRevenueLift = Math.round(prod.basePrice * 0.9);

      if (prod.category === 'Support') {
        rationale = 'Guarantees SLA response time and reduces deal churn risk';
      } else if (prod.category === 'Professional Services') {
        rationale = 'Accelerates time-to-value by 40% with dedicated onboarding';
      } else if (prod.category === 'Cloud Service') {
        rationale = 'Ensures zero-downtime high-availability infrastructure';
      }

      return {
        product: prod,
        rationale,
        projectedRevenueLift,
        recommendedDiscountPercent: 10
      };
    });

    return recommendations;
  } catch (error) {
    console.error('Error in upsellEngine:', error);
    return [];
  }
};

module.exports = {
  getUpsellRecommendations
};
