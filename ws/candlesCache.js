const config = require('../config/config');

const candlesCache = {}; // { SYMBOL: [ {open, high, low, close, volume, time}, ... ] }

function addCandle(symbol, candle) {
  if (!candlesCache[symbol]) {
    candlesCache[symbol] = [];
  }

  candlesCache[symbol].push(candle);

  if (candlesCache[symbol].length > config.MAX_CACHE_LENGTH) {
    candlesCache[symbol].shift();
  }
}

function getCandles(symbol) {
  return candlesCache[symbol] || [];
}

function clearAllCandles() {
  for (const symbol in candlesCache) {
    candlesCache[symbol] = [];
  }
}

function getCachedSymbols() {
  return Object.keys(candlesCache);
}

module.exports = {
  addCandle,
  getCandles,
  clearAllCandles,
  getCachedSymbols
};
