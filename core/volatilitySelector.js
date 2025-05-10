const WebSocket = require('ws');
const config = require('../config/config');

let topPairs = [];
const candles = {}; // { symbol: [ {open, high, low}, ... ] }

function calculateVolatility(symbol) {
  const data = candles[symbol];
  if (!data || data.length < config.VOLATILITY_LOOKBACK) return 0;

  const vols = data.map(c => (c.high - c.low) / c.open * 100);
  const avgVol = vols.reduce((a, b) => a + b, 0) / vols.length;
  return avgVol;
}

function getTopVolatilePairs() {
  const volMap = {};
  for (const symbol of Object.keys(candles)) {
    volMap[symbol] = calculateVolatility(symbol);
  }
  }

  const sorted = Object.entries(volMap)
    .filter(([_, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, config.VOLATILITY_TOP_COUNT)
    .map(([symbol]) => symbol);

  topPairs = sorted;
  if (config.DEBUG_LOGGING) {
    console.log('[VOLATILITY] Updated top pairs:', topPairs.join(', '));
  }

function initVolatilityWatcher() {
  const tf = config.VOLATILITY_TIMEFRAME;
  const ws = new WebSocket('wss://stream.binance.com:9443/ws/!ticker@arr');

  // На старте — запросим список всех USDT пар
  ws.on('open', () => {
    console.log('[VOLATILITY] Ticker stream connected');

    // Каждые N секунд — обновляем topPairs
    setInterval(() => getTopVolatilePairs(), config.VOLATILITY_REFRESH_INTERVAL_SEC * 1000);
  });

  ws.on('message', (msg) => {
    const data = JSON.parse(msg);

    if (!Array.isArray(data)) return;

    for (const ticker of data) {
      const symbol = ticker.s;
      if (!symbol.endsWith('USDT')) continue;

      const price = parseFloat(ticker.c);
      const high = parseFloat(ticker.h);
      const low = parseFloat(ticker.l);
      const open = parseFloat(ticker.o);

      if (!candles[symbol]) candles[symbol] = [];

      candles[symbol].push({ open, high, low });

      if (candles[symbol].length > config.VOLATILITY_LOOKBACK) {
        candles[symbol].shift();
      }
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
