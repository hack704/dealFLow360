const { RISK_LEVELS } = require('../../config/constants');

/**
 * Assesses blended deal health, calculates risk score (0-100), and outputs key risk factors.
 * @param {Object} dealData - { blendedMarginPercent, totalDiscountPercent, customer, grandTotal }
 * @returns {Object} { riskScore, riskLevel, riskFactors, winProbability, marginHealth }
 */
const assessDealHealth = ({ blendedMarginPercent = 0, totalDiscountPercent = 0, customer = {}, grandTotal = 0 }) => {
  let riskScore = 10; // Baseline low risk
  const riskFactors = [];

  // Factor 1: Margin Erosion
  if (blendedMarginPercent < 15) {
    riskScore += 40;
    riskFactors.push('Critical margin compression (< 15%) threatens deal profitability');
  } else if (blendedMarginPercent < 25) {
    riskScore += 25;
    riskFactors.push('Sub-optimal margin profile (< 25%)');
  } else if (blendedMarginPercent < 35) {
    riskScore += 10;
  }

  // Factor 2: Deep Discounting
  if (totalDiscountPercent > 30) {
    riskScore += 30;
    riskFactors.push(`Aggressive discounting (${totalDiscountPercent}%) may trigger price realization resistance`);
  } else if (totalDiscountPercent > 20) {
    riskScore += 15;
    riskFactors.push(`High discount depth (${totalDiscountPercent}%) requires VP approval`);
  }

  // Factor 3: Customer Credit & Payment Risk
  const creditRating = (customer && customer.creditRating) || 'A';
  if (['B', 'BB'].includes(creditRating)) {
    riskScore += 25;
    riskFactors.push(`Elevated customer credit risk (Rating: ${creditRating})`);
  } else if (creditRating === 'BBB') {
    riskScore += 10;
    riskFactors.push(`Moderate payment default probability (Rating: ${creditRating})`);
  }

  // Factor 4: Deal Size Exposure
  if (grandTotal > 250000) {
    riskScore += 10;
    riskFactors.push('High financial exposure (Deal value > $250k)');
  }

  // Normalization
  riskScore = Math.min(100, Math.max(5, riskScore));

  let riskLevel = RISK_LEVELS.LOW;
  if (riskScore >= 70) riskLevel = RISK_LEVELS.CRITICAL;
  else if (riskScore >= 50) riskLevel = RISK_LEVELS.HIGH;
  else if (riskScore >= 30) riskLevel = RISK_LEVELS.MODERATE;

  // Win Probability calculation based on discount sweetness vs customer tier
  let winProbability = 65;
  if (totalDiscountPercent >= 10 && totalDiscountPercent <= 25) winProbability += 15;
  if (totalDiscountPercent > 25) winProbability += 10; // diminishing returns
  if (['Enterprise', 'Mid-Market'].includes(customer.tier)) winProbability += 5;
  if (riskScore > 60) winProbability -= 15;
  winProbability = Math.min(95, Math.max(20, winProbability));

  const marginHealth = blendedMarginPercent >= 40 ? 'Healthy' : blendedMarginPercent >= 25 ? 'Fair' : 'At Risk';

  return {
    riskScore,
    riskLevel,
    riskFactors,
    winProbability,
    marginHealth
  };
};

module.exports = {
  assessDealHealth
};
