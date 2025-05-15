const WebSocket = require('ws');
const { addCandle, getCandles } = require('./multiCandleCache');
const { applyStrategies } = require('../strategies/strategyManager');
const { getTopPairs } = require('../core/volatilitySelector');
const config = require('../config/config');
const logger = require('../config/logger');
const yearHighLow = require('../data/yearHighLow.json');

let activeConnections = new Map();

function subscribeToSymbol(symbol) {
  const streams = [
    `${symbol.toLowerCase()}@kline_5m`,
    `${symbol.toLowerCase()}@kline_15m`,
    `${symbol.toLowerCase()}@kline_1h`
  ];
  const streamUrl = `wss://stream.binance.com:9443/stream?streams=${streams.join('/')}`;
  const ws = new WebSocket(streamUrl);

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

        const candles5m = getCandles(k.s, '15m');
        const candles1m = getCandles(k.s, '5m');
        if (candles5m.length < 10 || candles1m.length < 10) {
          logger.debug(`[SKIP] ${k.s}: мало свечей (5m=${candles5m.length}, 15m=${candles15m.length})`);
          return;
        }

        logger.debug(`[STRATEGY] Проверка ${k.s} (интервал: ${k.i})`);

        const yearly = yearHighLow[k.s] || null;
        const triggers = applyStrategies(k.s, yearly);

        logger.debug(`[TRIGGERS] ${k.s}:`, triggers);

        if (triggers.length >= config.SIGNAL_CONFIRMATION_COUNT) {
          const score = triggers.length;
          const mark = score >= 4 ? '🟢' : score >= 2 ? '🟡' : '🔴';
          console.log(`\n${mark} [SIGNAL] ${k.s} @ ${new Date().toISOString()} (score: ${score})\n` + triggers.join('\n') + '\n');
        }
      }
    } catch (err) {
      logger.error(`[WS] Ошибка обработки сообщения:`, err.message);
    }
  });

  ws.on('error', (err) => {
    logger.error(`[WS] Ошибка подключения к ${symbol}:`, err.message);
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

  logger.log(`[WS] Подписка завершена. Всего пар: ${activeConnections.size}`);
}

function monitorTopPairs() {
  setInterval(() => {
    const latest = getTopPairs();
    if (!latest || latest.length === 0) return;

    const newList = latest.slice(0, config.VOLATILITY_TOP_COUNT);
    const changed = JSON.stringify(newList) !== JSON.stringify([...activeConnections.keys()]);
    if (changed) updateSubscriptions(newList);
  }, config.SUBSCRIPTION_REFRESH_INTERVAL_MS);
}

function startWSManager() {
  updateSubscriptions(getTopPairs());
  monitorTopPairs();
}

setInterval(() => {
  const allSymbols = Object.keys(require('./multiCandleCache').cache || {});
  if (allSymbols.length === 0) return;

  logger.log('\n[CACHE STATUS] Готовность к сигналам:');
  for (const symbol of allSymbols) {
    const c1 = getCandles(symbol, '5m').length;
    const c5 = getCandles(symbol, '15m').length;
    const c10 = getCandles(symbol, '1h').length;
    logger.log(`${symbol} — 5m: ${c5}/10, 15m: ${c15}/10, 1h: ${c60}/10`);
  }
  logger.log('');
}, 5 * 60 * 1000);
const { checkProximityToExtremes } = require('../core/dailyHighLowScanner');

// Ежедневный запуск отбора монет, близких к HIGH/LOW
setInterval(() => {
  logger.log('\n[DAILY CHECK] Проверка пар, близких к максимуму и минимуму...');
  checkProximityToExtremes();
}, 24 * 60 * 60 * 1000);

module.exports = { startWSManager };
