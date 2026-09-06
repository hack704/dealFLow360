const DiscountRule = require('../models/DiscountRule');
const ApprovalRule = require('../models/ApprovalRule');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get all discount rules and approval rules
// @route   GET /api/discounts/rules
const getDiscountRules = async (req, res, next) => {
  try {
    const discountRules = await DiscountRule.find().sort({ createdAt: -1 });
    const approvalRules = await ApprovalRule.find({ isActive: true }).sort({ maxDiscountCeiling: 1 });
    return sendSuccess(res, { discountRules, approvalRules }, 'Discount governance rules retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Update discount ceilings (admin governance)
// @route   PUT /api/discounts/ceilings
const updateDiscountCeilings = async (req, res, next) => {
  try {
    const { rules } = req.body;

    if (!Array.isArray(rules) || rules.length === 0) {
      return sendError(res, 'rules array is required', 400);
    }

    const updated = [];
    for (const rule of rules) {
      const { tier, category, maxDiscountCeiling, minMarginFloor, requiredApproverRole } = rule;

      // DATA INTEGRITY RULE: Discount ceilings & margin floors must be valid percentages (0-100)
      if (maxDiscountCeiling !== undefined && (Number(maxDiscountCeiling) < 0 || Number(maxDiscountCeiling) > 100)) {
        return sendError(res, 'Data Integrity Violation: Discount ceiling must be a valid percentage between 0 and 100.', 400);
      }
      if (minMarginFloor !== undefined && (Number(minMarginFloor) < 0 || Number(minMarginFloor) > 100)) {
        return sendError(res, 'Data Integrity Violation: Margin floor must be a valid percentage between 0 and 100.', 400);
      }

      const filter = {};
      if (tier) filter.tier = tier;
      if (category) filter.category = category;

      let approvalRule = await ApprovalRule.findOne(filter);
      const updaterName = req.user ? req.user.name : 'Admin';

      if (approvalRule) {
        if (maxDiscountCeiling !== undefined) approvalRule.maxDiscountCeiling = maxDiscountCeiling;
        if (minMarginFloor !== undefined) approvalRule.minMarginFloor = minMarginFloor;
        if (requiredApproverRole) approvalRule.requiredApproverRole = requiredApproverRole;
        approvalRule.version = (approvalRule.version || 1) + 1;
        approvalRule.lastUpdatedBy = updaterName;
        await approvalRule.save();
      } else {
        approvalRule = await ApprovalRule.create({
          name: `${tier || 'All'} - ${category || 'All'} Rule`,
          tier: tier || 'All',
          category: category || 'All',
          maxDiscountCeiling: maxDiscountCeiling || 15,
          minMarginFloor: minMarginFloor || 20,
          requiredApproverRole: requiredApproverRole || 'sales_manager',
          version: 1,
          lastUpdatedBy: updaterName
        });
      }
      updated.push(approvalRule);
    }

    return sendSuccess(res, updated, 'Discount ceilings updated successfully with version stamping');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDiscountRules,
  updateDiscountCeilings
};
