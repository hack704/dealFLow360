const { roundTwoDecimals, calculateMarginPercent } = require('../../utils/helpers');
const { APPROVAL_THRESHOLDS } = require('../../config/constants');

/**
 * Calculates volume and tier discounts for quotation items.
 * @param {Array} items - Array of { product, quantity, customDiscountPercent, listPrice, unitCost }
 * @param {Object} customer - Customer object with tier and credit rating
 * @returns {Object} Calculated line items and discount aggregates
 */
const calculateDiscounts = (items = [], customer = {}) => {
  let subtotal = 0;
  let totalCost = 0;
  let totalDiscountAmount = 0;
  let requiresApproval = false;
  let approvalReasons = [];
  let cumulativeExcessPoints = 0;

  const processedItems = items.map((item) => {
    const listPrice = Number(item.listPrice || (item.product && item.product.basePrice) || 0);
    const unitCost = Number(item.unitCost || (item.product && item.product.unitCost) || 0);
    const quantity = Math.max(1, Number(item.quantity) || 1);

    // Dynamic volume discount curve
    let volumeDiscountPercent = 0;
    if (quantity >= 100) volumeDiscountPercent = 12;
    else if (quantity >= 50) volumeDiscountPercent = 8;
    else if (quantity >= 20) volumeDiscountPercent = 5;
    else if (quantity >= 10) volumeDiscountPercent = 3;

    // Customer tier bonus discount
    let tierDiscountPercent = 0;
    if (customer.tier === 'Enterprise') tierDiscountPercent = 5;
    else if (customer.tier === 'Mid-Market') tierDiscountPercent = 2;

    // Rep custom discount request (if any)
    const customDiscountPercent = Number(item.discountPercent) || 0;

    // Final discount is either the custom discount or the auto-applied volume+tier discount
    const effectiveDiscountPercent = Math.min(
      70, // max safety cap
      Math.max(customDiscountPercent, volumeDiscountPercent + tierDiscountPercent)
    );

    const grossLineTotal = listPrice * quantity;
    const discountAmount = roundTwoDecimals(grossLineTotal * (effectiveDiscountPercent / 100));
    const netLineTotal = roundTwoDecimals(grossLineTotal - discountAmount);
    const netUnitPrice = roundTwoDecimals(netLineTotal / quantity);
    const lineCost = unitCost * quantity;
    const marginAmount = roundTwoDecimals(netLineTotal - lineCost);
    const marginPercent = calculateMarginPercent(netLineTotal, lineCost);

    // Category-specific discount ceilings (Concept 10: Blended Discount Risk)
    const category = (item.category || (item.product && item.product.category) || '').toLowerCase();
    let categoryCeiling = APPROVAL_THRESHOLDS.MAX_REP_DISCOUNT_PERCENT; // default 15%
    if (category.includes('service')) {
      categoryCeiling = 10; // Thin margin services ceiling: 10%
    } else if (category.includes('hardware')) {
      categoryCeiling = 15; // Healthy margin hardware ceiling: 15%
    } else if (category.includes('software')) {
      categoryCeiling = 25; // High margin software ceiling: 25%
    }

    subtotal += grossLineTotal;
    totalCost += lineCost;
    totalDiscountAmount += discountAmount;

    // Line-level category ceiling violation check
    if (effectiveDiscountPercent > categoryCeiling) {
      requiresApproval = true;
      approvalReasons.push(
        `${item.productName || 'Product'} (${item.category || 'Item'}): ${effectiveDiscountPercent}% discount exceeds strict ${categoryCeiling}% category ceiling`
      );
    } else if (effectiveDiscountPercent > APPROVAL_THRESHOLDS.MAX_REP_DISCOUNT_PERCENT) {
      requiresApproval = true;
      approvalReasons.push(
        `${item.productName || 'Product'}: ${effectiveDiscountPercent}% discount exceeds standard ${APPROVAL_THRESHOLDS.MAX_REP_DISCOUNT_PERCENT}% rep limit`
      );
    }

    // Cumulative excess tracking for blended pattern recognition
    const lineExcess = Math.max(0, effectiveDiscountPercent - categoryCeiling);
    cumulativeExcessPoints += lineExcess;

    if (marginPercent < APPROVAL_THRESHOLDS.MIN_ACCEPTABLE_MARGIN_PERCENT) {
      requiresApproval = true;
      approvalReasons.push(
        `${item.productName || 'Product'}: ${marginPercent}% margin is below minimum threshold of ${APPROVAL_THRESHOLDS.MIN_ACCEPTABLE_MARGIN_PERCENT}%`
      );
    }

    return {
      ...item,
      listPrice,
      unitCost,
      quantity,
      discountPercent: roundTwoDecimals(effectiveDiscountPercent),
      discountAmount,
      netUnitPrice,
      lineTotal: netLineTotal,
      marginAmount,
      marginPercent
    };
  });

  // Concept 10: Blended multi-line pattern check (cumulative minor overages)
  if (cumulativeExcessPoints >= 5 && !requiresApproval) {
    requiresApproval = true;
    approvalReasons.push(
      `Blended discount pattern: Cumulative excess across multiple lines (${roundTwoDecimals(cumulativeExcessPoints)} pts) triggers governance review`
    );
  }

  const grandTotal = roundTwoDecimals(subtotal - totalDiscountAmount);
  const overallDiscountPercent = subtotal > 0 ? roundTwoDecimals((totalDiscountAmount / subtotal) * 100) : 0;
  const blendedMarginPercent = calculateMarginPercent(grandTotal, totalCost);

  return {
    items: processedItems,
    subtotal: roundTwoDecimals(subtotal),
    totalCost: roundTwoDecimals(totalCost),
    totalDiscountAmount: roundTwoDecimals(totalDiscountAmount),
    totalDiscountPercent: overallDiscountPercent,
    grandTotal,
    blendedMarginPercent,
    requiresApproval,
    approvalReasons
  };
};

module.exports = {
  calculateDiscounts
};
