const PriceList = require('../models/PriceList');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get all price lists
// @route   GET /api/price-lists
const getPriceLists = async (req, res, next) => {
  try {
    const { tier } = req.query;
    const filter = { isActive: true };
    if (tier) filter.tier = tier;

    const priceLists = await PriceList.find(filter).sort({ tier: 1 });
    return sendSuccess(res, priceLists, 'Price lists retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Create a price list tier entry
// @route   POST /api/price-lists
const createPriceList = async (req, res, next) => {
  try {
    const { name, tier, currency, priceRule, discountModifierPercent } = req.body;

    if (!name || !tier) {
      return sendError(res, 'name and tier are required', 400);
    }

    const priceList = await PriceList.create({
      name,
      tier,
      currency: currency || 'USD',
      priceRule: priceRule || 'Price, no adjustment',
      discountModifierPercent: discountModifierPercent || 0
    });

    return sendSuccess(res, priceList, 'Price list created successfully', 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPriceLists,
  createPriceList
};
