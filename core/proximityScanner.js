// 📁 core/proximityScanner.js
const config = require('../config/config');
const yearHighLow = require('../data/yearHighLow.json');
const { getCandles } = require('../ws/multiCandleCache');

function getDistanceToExtremes(symbol) {
  const lastCandle = getCandles(symbol, '1m')?.slice(-1)[0];
  const yearly = yearHighLow[symbol];
  if (!lastCandle || !yearly) return null;

  const close = lastCandle.close;
  const distToHigh = ((yearly.high - close) / yearly.high) * 100;
  const distToLow = ((close - yearly.low) / yearly.low) * 100;

  const nearHigh = distToHigh <= config.PERCENT_TO_HIGH;
  const nearLow = distToLow <= config.PERCENT_TO_LOW;

  return {
    close,
    nearHigh,
    nearLow,
    distToHigh: distToHigh.toFixed(2),
    distToLow: distToLow.toFixed(2),
    high: yearly.high,
    low: yearly.low
  };
}

module.exports = {
  getDistanceToExtremes
};
