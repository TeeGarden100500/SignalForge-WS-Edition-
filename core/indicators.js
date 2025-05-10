const config = require('../config/config');
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
  return ATR.calculate({
    period: config.ATR_PERIOD,
    high: highs,
    low: lows,
    close: closes
  }).at(-1);
}

function calculateADX(highs, lows, closes) {
  return ADX.calculate({
    period: config.ADX_PERIOD,
    high: highs,
    low: lows,
    close: closes
  }).at(-1)?.adx;
}

function calculateMeanReversion(closes) {
  const maPeriod = config.MEAN_REVERSION_MA_PERIOD;
  if (closes.length < maPeriod) return null;

  const ma = closes.slice(-maPeriod).reduce((a, b) => a + b, 0) / maPeriod;
  const lastClose = closes.at(-1);
  const diffPercent = ((lastClose - ma) / ma) * 100;

  return {
    ma,
    lastClose,
    diffPercent,
    isDiverged: Math.abs(diffPercent) >= config.MEAN_REVERSION_THRESHOLD
  };
}

function calculateVolumeSpike(volumes) {
  const recentVolume = volumes.at(-1);
  const avgVolume = volumes.slice(-config.VOLUME_LOOKBACK).reduce((a, b) => a + b, 0) / config.VOLUME_LOOKBACK;
  return {
    recentVolume,
    avgVolume,
    spike: recentVolume / avgVolume,
    isSpike: recentVolume / avgVolume >= config.VOLUME_SPIKE_MULTIPLIER
  };
}

module.exports = {
  calculateRSI,
  calculateEMA,
  calculateEMACrossover,
  calculateMACD,
  calculateATR,
  calculateADX,
  calculateMeanReversion,
  calculateVolumeSpike
};
