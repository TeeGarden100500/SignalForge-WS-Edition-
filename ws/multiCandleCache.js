// 📁 src/multiCandleCache.js
const config = require('../config/config');
const logger = require('../config/logger');

const multiCandleCache = {}; // { symbol: { interval: [candles] } }

function initSymbol(symbol) {
  if (!multiCandleCache[symbol]) {
    multiCandleCache[symbol] = {
      '5m': [],
      '15m': [],
      '1h': []
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

  logger.debug(`📥 [CACHE] Добавлена свеча: ${symbol} ${interval} (всего: ${cache.length})`);
}

function getCandles(symbol, interval) {
  const candles = multiCandleCache[symbol]?.[interval] || [];
  if (candles.length < 10) {
    logger.debug(`🕒 [CACHE] Недостаточно свечей: ${symbol} ${interval} — ${candles.length}/10`);
  }
  return candles;
}

function clearCandles(symbol, interval) {
  if (multiCandleCache[symbol]) {
    multiCandleCache[symbol][interval] = [];
    logger.warn(`🧹 [CACHE] Очищены свечи для ${symbol} ${interval}`);
  }
}

function clearAll() {
  for (const symbol in multiCandleCache) {
    multiCandleCache[symbol]['5m'] = [];
    multiCandleCache[symbol]['15m'] = [];
    multiCandleCache[symbol]['1h'] = [];
  }
  logger.warn('[CACHE] Полная очистка всех свечей');
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
