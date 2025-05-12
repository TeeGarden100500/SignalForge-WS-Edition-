
const WebSocket = require('ws');
const config = require('../config/config');

let topPairs = [];
const snapshot = {}; // { symbol: { o, h, l } }

function calculateVolatility(symbol) {
  const data = snapshot[symbol];
  if (!data) return 0;

  const open = parseFloat(data.o);
  const high = parseFloat(data.h);
  const low = parseFloat(data.l);

  if (!open || !high || !low) return 0;

  return ((high - low) / open) * 100;
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

  if (config.DEBUG_LOGGING) {
    console.log(`[VOLATILITY] Top pairs (24h volatility): ${topPairs.slice(0, 10).join(', ')} ...`);
  }
}

function initVolatilityWatcher() {
  const ws = new WebSocket('wss://stream.binance.com:9443/ws/!ticker@arr');

  ws.on('open', () => {
    console.log('[VOLATILITY] Connected to !ticker@arr stream');

    // Обновлять topPairs раз в 6 часов (или из config)
    setInterval(getTopVolatilePairs, config.VOLATILITY_REFRESH_INTERVAL_SEC * 1000);
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
  });

  ws.on('error', (err) => {
    console.error('[VOLATILITY] Error:', err.message);
  });

  ws.on('close', () => {
    console.log('[VOLATILITY] Disconnected. Reconnecting...');
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
