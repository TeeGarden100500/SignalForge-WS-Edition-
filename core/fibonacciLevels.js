// 📁 core/fibonacciLevels.js
const yearHighLow = require('../data/yearHighLow.json');
const { getCandles } = require('../ws/multiCandleCache');

const FIBO_LEVELS = [0.236, 0.382, 0.5, 0.618, 0.786];
const TOLERANCE = 0.015; // 1.5% отклонение допустимо

function getFibonacciProximity(symbol) {
  const { high, low } = yearHighLow[symbol] || {};
  const lastCandle = getCandles(symbol, '1m')?.slice(-1)[0];
  if (!high || !low || !lastCandle) return null;

  const close = lastCandle.close;
  const range = high - low;
  const fiboLevels = FIBO_LEVELS.map(f => low + range * f);

  for (let i = 0; i < fiboLevels.length; i++) {
    const level = fiboLevels[i];
    const delta = Math.abs((close - level) / level);
    if (delta <= TOLERANCE) {
      return {
        match: true,
        level: level.toFixed(2),
        ratio: FIBO_LEVELS[i],
        diffPercent: (delta * 100).toFixed(2)
      };
    }
  }
  return null;
}

module.exports = {
  getFibonacciProximity
};
