const WebSocket = require('ws');
const config = require('../config/config');
const { applyStrategies } = require('../strategies/strategyManager');
const { getTopPairs } = require('../core/volatilitySelector');
const { sendWebhook } = require('../webhook/webhookSender');

let ws = null;
let currentPairs = [];
let candleCache = {}; // { symbol: [ ...candles ] }

function buildStreamURL(pairs) {
  const streams = pairs.map(p => `${p.toLowerCase()}@kline_${config.INTERVAL}`).join('/');
  return `wss://stream.binance.com:9443/stream?streams=${streams}`;
}

function connectWS(pairs) {
  if (ws) ws.terminate();

  const url = buildStreamURL(pairs);
  ws = new WebSocket(url);
  candleCache = {}; // сбросим кэш

  ws.on('open', () => {
    console.log('[WS] Connected to Binance for pairs:', pairs.join(', '));
    if (config.DEBUG_LOGGING) {
  console.log(`[WS] Подключились к ${pairs.length} парам: ${pairs.slice(0, 5).join(', ')} ...`);
  }
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

    if (kline.x) {
      candleCache[symbol].push(candle);
      if (candleCache[symbol].length > config.MAX_CACHE_LENGTH) {
        candleCache[symbol].shift();
        if (config.DEBUG_LOGGING) {
      console.log(`[CANDLE] ${symbol} close=${candle.close}`);
      }
      }

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

          sendWebhook(signal);
        }
      }
    }
  });

  ws.on('error', (err) => {
    console.error('[WS] Error:', err.message);
  });

  ws.on('close', () => {
    console.log('[WS] Disconnected. Reconnecting in 5s...');
    setTimeout(() => connectWS(currentPairs), 5000);
  });
}

function monitorPairs() {
  setInterval(() => {
    const newPairs = getTopPairs();
    const changed = JSON.stringify(newPairs) !== JSON.stringify(currentPairs);
    if (newPairs.length > 0 && changed) {
      currentPairs = [...newPairs];
      connectWS(currentPairs);
    }
  }, 60000); // проверка раз в минуту
}

function initWebSocket() {
  monitorPairs();
}

module.exports = {
  initWebSocket
};
