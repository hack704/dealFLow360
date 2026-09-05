// Calculation and formatting helpers for DealFlow360

const generateQuotationNumber = () => {
  const prefix = 'QT-';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${timestamp}-${random}`;
};

const roundTwoDecimals = (num) => {
  return Math.round((Number(num) + Number.EPSILON) * 100) / 100;
};

const calculateMarginPercent = (revenue, cost) => {
  if (!revenue || revenue <= 0) return 0;
  const marginAmount = revenue - cost;
  return roundTwoDecimals((marginAmount / revenue) * 100);
};

module.exports = {
  generateQuotationNumber,
  roundTwoDecimals,
  calculateMarginPercent
};
