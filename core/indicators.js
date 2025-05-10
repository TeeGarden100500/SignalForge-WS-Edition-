const config = require('../config/config');

// Индикаторы
const { EMA, RSI, MACD, ATR, ADX } = require('technicalindicators');

function calculateRSI(closes) {
  return RSI.calculate({
    period: config.RSI_PERIOD,
    values: closes
  }).at(-1);
}

function calculateEMA(closes, period) {
  return EMA.calculate({
    period,
    values: closes
  }).at(-1);
}

function calculateEMACrossover(closes) {
  const fast = EMA.calculate({ period: config.EMA_FAST, values: closes });
  const slow = EMA.calculate({ period: config.EMA_SLOW, values: closes });
  if (fast.length < 2 || slow.length < 2) return null;
  const crossover = fast.at(-2) < slow.at(-2) && fast.at(-1) > slow.at(-1);
  const crossunder = fast.at(-2) > slow.at(-2) && fast.at(-1) < slow.at(-1);
  return { crossover, crossunder };
}

function calculateMACD(closes) {
  const res = MACD.calculate({
    fastPeriod: config.MACD_FAST,
    slowPeriod: config.MACD_SLOW,
    signalPeriod: config.MACD_SIGNAL,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
    values: closes
  });
  return res.at(-1);
}

function calculateATR(highs, lows, closes) {
  return
