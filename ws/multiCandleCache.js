
const config = require('../config/config');

const multiCandleCache = {}; // { symbol: { interval: [candles] } }

function initSymbol(symbol) {
  if (!multiCandleCache[symbol]) {
    multiCandleCache[symbol] = {
      '1m': [],
      '5m': [],
      '10m': []
    };
  }
}

function addCandle(symbol, interval, candle) {
  initSymbol(symbol);

  const cache = multiCandleCache[symbol][interval];
  if (!cache) return;

  cache.push(candle);

  if (cache.length > config.MAX_CACHE_LENGTH) {
    cache.shift();
  }
}

function getCandles(symbol, interval) {
  return multiCandleCache[symbol]?.[interval] || [];
}

function clearCandles(symbol, interval) {
  if (multiCandleCache[symbol]) {
    multiCandleCache[symbol][interval] = [];
  }
}

function clearAll() {
  for (const symbol in multiCandleCache) {
    multiCandleCache[symbol]['1m'] = [];
    multiCandleCache[symbol]['5m'] = [];
    multiCandleCache[symbol]['10m'] = [];
  }
}

function getAllSymbols() {
  return Object.keys(multiCandleCache);
}

module.exports = {
  addCandle,
  getCandles,
  clearCandles,
  clearAll,
  getAllSymbols
};
