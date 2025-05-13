// 📁 core/dailyHighLowScanner.js
const { getCandles } = require('../ws/multiCandleCache');
const config = require('../config/config');
const yearHighLow = require('../data/yearHighLow.json');
const logger = require('../config/logger');

function checkProximityToExtremes() {
  const results = {
    nearHigh: [],
    nearLow: []
  };

  for (const symbol in yearHighLow) {
    const latestCandles = getCandles(symbol, '1m');
    if (!latestCandles || latestCandles.length === 0) continue;

    const latestClose = latestCandles[latestCandles.length - 1].close;
    const yearly = yearHighLow[symbol];

    if (yearly.high && yearly.low && latestClose) {
      const distanceToHigh = ((yearly.high - latestClose) / yearly.high) * 100;
      const distanceToLow = ((latestClose - yearly.low) / yearly.low) * 100;

      if (distanceToHigh <= config.PERCENT_TO_HIGH) {
        results.nearHigh.push({ symbol, close: latestClose, high: yearly.high, dist: distanceToHigh.toFixed(2) });
      }

      if (distanceToLow <= config.PERCENT_TO_LOW) {
        results.nearLow.push({ symbol, close: latestClose, low: yearly.low, dist: distanceToLow.toFixed(2) });
      }
    }
  }

  logger.log('\n📈 [NEAR YEAR HIGH]');
  results.nearHigh.forEach(({ symbol, close, high, dist }) => {
    logger.log(`${symbol}: close=${close}, high=${high}, ➜ ${dist}% от HIGH`);
  });

  logger.log('\n📉 [NEAR YEAR LOW]');
  results.nearLow.forEach(({ symbol, close, low, dist }) => {
    logger.log(`${symbol}: close=${close}, low=${low}, ➜ ${dist}% от LOW`);
  });
}

module.exports = { checkProximityToExtremes };
