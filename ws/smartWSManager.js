const WebSocket = require('ws');
const { getTopPairs } = require('../core/volatilitySelector');
const { addCandle } = require('./multiCandleCache');
const { applyStrategies } = require('../strategies/strategyManager');
const { sendWebhook } = require('../webhook/webhookSender');
const config = require('../config/config');

const MAX_STREAMS = 50;
const connections = new Map(); // symbol → WebSocket
let currentSymbols = [];

function subscribeToSymbol(symbol) {
  if (connections.has(symbol)) return;
  if (connections.size >= MAX_STREAMS) return;

  const stream = `${symbol.toLowerCase()}@kline_${config.INTERVAL}`;
  const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${stream}`);

  ws.on('open', () => {
//    if (config.DEBUG_LOGGING) console.log(`[WS] Подписка на ${symbol}`);
  });

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      const k = msg.k;
      if (!k || !k.x) return; // закрытая свеча

      const candle = {
        time: k.t,
        open: parseFloat(k.o),
        high: parseFloat(k.h),
        low: parseFloat(k.l),
        close: parseFloat(k.c),
        volume: parseFloat(k.v)
      };

      addCandle(symbol, candle);

        const { applyStrategies } = require('../strategies/strategyManager');
        const triggers = applyStrategies(symbol);

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
          }

          const score = signal.triggers.length;
          const emoji = score >= 5 ? '🟢' : score >= 3 ? '🟡' : '🔴';
          if (config.DEBUG_LOGGING) {
            console.log(`⚡ [SIGNAL • ${emoji} ${score}/7] ${signal.pair}:\n  ` + signal.triggers.join('\n  '));
          }
        }
      }
    } catch (err) {
      console.error(`[${symbol}] Ошибка в сообщении:`, err.message);
    }
  });

  ws.on('error', (err) => {
    console.error(`[WS] Ошибка ${symbol}:`, err.message);
    ws.close();
  });

  ws.on('close', () => {
    console.log(`[WS] Отключено от ${symbol}`);
    connections.delete(symbol);
  });

  connections.set(symbol, ws);
}

function updateSubscriptions(symbols) {
  const allowed = symbols.slice(0, MAX_STREAMS);
  const current = Array.from(connections.keys());

  // Новые подписки
  for (const s of allowed) {
    if (!current.includes(s)) subscribeToSymbol(s);
  }

  // Удаление лишних
  for (const s of current) {
    if (!allowed.includes(s)) {
      const ws = connections.get(s);
      if (ws) ws.close();
    }
  }

  currentSymbols = allowed;
  if (config.DEBUG_LOGGING) {
  console.log(`[WS] Подписка завершена. Всего подключено пар: ${connections.size}`);
}
}

function monitorTopPairs() {
  setInterval(() => {
    const latest = getTopPairs();
    if (!latest || latest.length === 0) return;

    const changed = JSON.stringify(latest.slice(0, MAX_STREAMS)) !== JSON.stringify(currentSymbols);
    if (changed) updateSubscriptions(latest);
  }, 60000); // обновление раз в минуту
}

function startWSManager() {
  monitorTopPairs();
}

module.exports = {
  startWSManager
};


const WebSocket = require('ws');
const { addCandle, getCandles } = require('./multiCandleCache');
const { applyStrategies } = require('../strategies/strategyManager');
const { getTopPairs } = require('../core/volatilitySelector');
const config = require('../config/config');

let activeConnections = new Map();

function subscribeToSymbol(symbol) {
  const streams = [
    `${symbol.toLowerCase()}@kline_1m`,
    `${symbol.toLowerCase()}@kline_5m`,
    `${symbol.toLowerCase()}@kline_10m`
  ];
  const streamUrl = `wss://stream.binance.com:9443/stream?streams=${streams.join('/')}`;
  const ws = new WebSocket(streamUrl);

  ws.on('open', () => {
    if (config.DEBUG_LOGGING) console.log(`[WS] Подписка на ${symbol}`);
  });

  ws.on('message', (raw) => {
    try {
      const data = JSON.parse(raw);
      const { e, k } = data.data || {};

      if (e === 'kline' && k && k.x) {
        const candle = {
          time: k.t,
          open: parseFloat(k.o),
          high: parseFloat(k.h),
          low: parseFloat(k.l),
          close: parseFloat(k.c),
          volume: parseFloat(k.v)
        };

        addCandle(k.s, k.i, candle);
        const candles5m = getCandles(k.s, '5m');
        const candles1m = getCandles(k.s, '1m');
        if (candles5m.length < 10 || candles1m.length < 10) return;

        const triggers = applyStrategies(k.s);
        if (triggers.length >= config.SIGNAL_CONFIRMATION_COUNT) {
          console.log(`\n⚡ [SIGNAL] ${k.s} @ ${new Date().toISOString()}\n` + triggers.join('\n') + '\n');
        }
      }
    } catch (err) {
      console.error(`[WS] Ошибка при обработке сообщения:`, err.message);
    }
  });

  ws.on('error', (err) => {
    console.error(`[WS] Ошибка подключения к ${symbol}:`, err.message);
  });

  activeConnections.set(symbol, ws);
}

function updateSubscriptions(newSymbols) {
  for (const [symbol, socket] of activeConnections.entries()) {
    if (!newSymbols.includes(symbol)) {
      socket.close();
      activeConnections.delete(symbol);
    }
  }

  for (const symbol of newSymbols) {
    if (!activeConnections.has(symbol)) {
      subscribeToSymbol(symbol);
    }
  }

  if (config.DEBUG_LOGGING) {
    console.log(`[WS] Подписка завершена. Всего подключено пар: ${activeConnections.size}`);
  }
}

function monitorTopPairs() {
  setInterval(() => {
    const latest = getTopPairs();
    if (!latest || latest.length === 0) return;

    const changed = JSON.stringify(latest.slice(0, config.VOLATILITY_TOP_COUNT)) !== JSON.stringify([...activeConnections.keys()]);
    if (changed) updateSubscriptions(latest);
  }, 60000);
}

function startWSManager() {
  updateSubscriptions(getTopPairs());
  monitorTopPairs();
}

// ⏱️ Лог для контроля накопления свечей каждые 5 минут
setInterval(() => {
  const allSymbols = Object.keys(require('./multiCandleCache').cache || {});
  if (allSymbols.length === 0) return;

  console.log('\n[CACHE STATUS] Готовность к сигналам:');
  for (const symbol of allSymbols) {
    const c1 = getCandles(symbol, '1m').length;
    const c5 = getCandles(symbol, '5m').length;
    const c10 = getCandles(symbol, '10m').length;
    console.log(`${symbol} — 1m: ${c1}/10, 5m: ${c5}/10, 10m: ${c10}/10`);
  }
  console.log('');
}, 5 * 60 * 1000);

module.exports = { startWSManager };
