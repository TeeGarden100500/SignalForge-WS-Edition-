const WebSocket = require('ws');
const config = require('../config/config');
const logger = require('../config/logger');

let topPairs = [];
const snapshot = {}; // { symbol: { o, h, l } }

function calculateVolatility(symbol) {
  const data = snapshot[symbol];
  if (!data) return 0;

  const open = parseFloat(data.o);
  const high = parseFloat(data.h);
  const low = parseFloat(data.l);

  if (!open || !high || !low) return 0;

  const result = ((high - low) / open) * 100;
  logger.debug(`[VOLATILITY] ${symbol}: high=${high}, low=${low}, open=${open} → vol=${result.toFixed(2)}%`);
  return result;
}

function getTopVolatilePairs() {
  const volMap = {};

  for (const symbol of Object.keys(snapshot)) {
    volMap[symbol] = calculateVolatility(symbol);
  }

  const sorted = Object.entries(volMap)
    .filter(([_, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, config.VOLATILITY_TOP_COUNT)
    .map(([symbol]) => symbol);

  topPairs = sorted;

  logger.log(`[VOLATILITY] Топ-${config.VOLATILITY_TOP_COUNT} по суточной волатильности: ${topPairs.join(', ')}`);
}

function initVolatilityWatcher() {
  const ws = new WebSocket('wss://stream.binance.com:9443/ws/!ticker@arr');

  ws.on('open', () => {
    logger.log('[VOLATILITY] Подключено к потоку !ticker@arr');

    setTimeout(() => {
      getTopVolatilePairs();
      setInterval(getTopVolatilePairs, config.VOLATILITY_REFRESH_INTERVAL_SEC * 1000);
    }, 10000);
  });

  ws.on('message', (msg) => {
    const data = JSON.parse(msg);
    if (!Array.isArray(data)) return;

    for (const ticker of data) {
      const symbol = ticker.s;
      if (!symbol.endsWith('USDT')) continue;

      snapshot[symbol] = {
        o: ticker.o,
        h: ticker.h,
        l: ticker.l
      };
    }
    logger.debug(`[VOLATILITY] Обновлены данные по ${data.length} монетам`);
  });

  ws.on('error', (err) => {
    logger.error('[VOLATILITY] Ошибка WebSocket:', err.message);
  });

  ws.on('close', () => {
    logger.warn('[VOLATILITY] Отключение от потока. Переподключение через 5 сек...');
    setTimeout(initVolatilityWatcher, 5000);
  });
}

function getTopPairs() {
  return topPairs;
}

module.exports = {
  initVolatilityWatcher,
  getTopPairs
};
