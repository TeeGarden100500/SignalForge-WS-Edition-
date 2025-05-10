const WebSocket = require('ws');
const config = require('../config/config');
const { applyStrategies } = require('../strategies/strategyManager');

const candleCache = {}; // { BTCUSDT: [ {open, high, low, close, volume, time}, ... ] }

function initWebSocket() {
  const streams = config.PAIRS.map(p => `${p.toLowerCase()}@kline_${config.INTERVAL}`).join('/');
  const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

  ws.on('open', () => {
    console.log(`[WS] Connected to Binance WebSocket`);
  });

  ws.on('message', (data) => {
    const parsed = JSON.parse(data);
    const kline = parsed.data.k;
    const symbol = parsed.data.s;

    if (!candleCache[symbol]) {
      candleCache[symbol] = [];
    }

    const candle = {
      open: parseFloat(kline.o),
      high: parseFloat(kline.h),
      low: parseFloat(kline.l),
      close: parseFloat(kline.c),
      volume: parseFloat(kline.v),
      time: kline.t
    };

    if (kline.x) { // если свеча закрыта
      candleCache[symbol].push(candle);

      // Ограничим размер кэша
      if (candleCache[symbol].length > config.MAX_CACHE_LENGTH) {
        candleCache[symbol].shift();
      }

      // Проверяем стратегию
      const triggers = applyStrategies(symbol, candleCache[symbol]);

      if (triggers.length >= config.SIGNAL_CONFIRMATION_COUNT) {
        const nowUTC = new Date().toISOString().slice(11, 16);
        const withinTime =
          nowUTC >= config.SIGNAL_TIME_WINDOW_UTC.start &&
          nowUTC <= config.SIGNAL_TIME_WINDOW_UTC.end;

        if (withinTime) {
          const signal = {
            time: new Date().toISOString(),
            pair: symbol,
            triggers,
            price: candle.close
          };

          if (config.DEBUG_LOGGING) {
            console.log('[SIGNAL]', JSON.stringify(signal, null, 2));
          }

          // TODO: В будущем — отправка через webhookSender.js
        }
      }
    }
  });

  ws.on('error', (err) => {
    console.error('[WS] Error:', err.message);
  });

  ws.on('close', () => {
    console.log('[WS] Disconnected. Reconnecting in 5s...');
    setTimeout(initWebSocket, 5000);
  });
}

module.exports = {
  initWebSocket
};
