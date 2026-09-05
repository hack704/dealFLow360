const PriceList = require('../models/PriceList');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get all price lists
// @route   GET /api/price-lists
const getPriceLists = async (req, res, next) => {
  try {
    let lists = await PriceList.find({ isActive: true });

    if (lists.length === 0) {
      lists = [
        { id: 1, tier: 'Bronze', currency: 'USD', priceRule: 'Price, no adjustment' },
        { id: 2, tier: 'Gold', currency: 'USD/EUR', priceRule: 'Price minus 10 percent base' },
        { id: 3, tier: 'Enterprise Partner', currency: 'USD', priceRule: 'Price minus 18 percent base' }
      ];
    }

    return sendSuccess(res, lists, 'Price lists retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new price list
// @route   POST /api/price-lists
const createPriceList = async (req, res, next) => {
  try {
    const { name, tier, currency, priceRule, discountModifierPercent } = req.body;
    const newList = await PriceList.create({
      name,
      tier,
      currency: currency || 'USD',
      priceRule: priceRule || 'Price, no adjustment',
      discountModifierPercent: discountModifierPercent || 0
    });

    return sendSuccess(res, newList, 'Price list created', 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPriceLists,
  createPriceList
};
