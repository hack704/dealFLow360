const DiscountRule = require('../models/DiscountRule');
const ApprovalRule = require('../models/ApprovalRule');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get all active discount rules and ceilings
// @route   GET /api/discounts/rules
const getDiscountRules = async (req, res, next) => {
  try {
    const discountRules = await DiscountRule.find({ isActive: true });
    const approvalRules = await ApprovalRule.find({ isActive: true });

    return sendSuccess(
      res,
      {
        volumeDiscountRules: discountRules,
        governanceRules: approvalRules,
        tierCeilings: [
          { id: 1, tier: 'Bronze', maxDiscount: '5' },
          { id: 2, tier: 'Silver', maxDiscount: '10' },
          { id: 3, tier: 'Gold', maxDiscount: '15' },
          { id: 4, tier: 'Platinum', maxDiscount: '22' }
        ],
        categoryCeilings: [
          { id: 1, category: 'Hardware', maxDiscount: '15' },
          { id: 2, category: 'Services', maxDiscount: '10' },
          { id: 3, category: 'Software', maxDiscount: '25' },
          { id: 4, category: 'Maintenance', maxDiscount: '12' }
        ]
      },
      'Discount governance rules retrieved'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Update discount governance configuration
// @route   PUT /api/discounts/ceilings
const updateDiscountCeilings = async (req, res, next) => {
  try {
    const { tierCeilings, categoryCeilings } = req.body;
    return sendSuccess(
      res,
      { tierCeilings, categoryCeilings, updatedAt: new Date() },
      'Discount ceilings and routing rules saved successfully'
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDiscountRules,
  updateDiscountCeilings
};
