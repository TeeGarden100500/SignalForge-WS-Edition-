
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

        console.log(`[DEBUG] Проверяем стратегию для ${k.s} (интервал: ${k.i})`);
        const triggers = applyStrategies(k.s);
        console.log(`[DEBUG] Триггеры:`, triggers);
        if (triggers.length >= config.SIGNAL_CONFIRMATION_COUNT) {
          console.log(`\n⚡ [SIGNAL] ${k.s} @ ${new Date().toISOString()}\n` + triggers.join('\n') + '\n');
        }
      }
    } catch (err) {
      if (config.DEBUG_LOGGING) {
        console.error(`[WS] Ошибка при обработке сообщения:`, err.message);
      }
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

  console.log(`[WS] Подписка завершена. Всего подключено пар: ${activeConnections.size}`);
}

function monitorTopPairs() {
  setInterval(() => {
    const latest = getTopPairs();
    if (!latest || latest.length === 0) return;

    const newList = latest.slice(0, config.VOLATILITY_TOP_COUNT);
    const changed = JSON.stringify(newList) !== JSON.stringify([...activeConnections.keys()]);
    if (changed) updateSubscriptions(newList);
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
