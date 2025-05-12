
const config = require('../config/config');
const { EMA, RSI, MACD, ATR, ADX } = require('technicalindicators');

function getCandleCount(minutes) {
  const interval = parseInt(config.INTERVAL); // '5m' => 5
  return Math.max(1, Math.floor(minutes / interval));
}

function calculateRSI(closes) {
  return RSI.calculate({
    period: getCandleCount(config.RSI_PERIOD),
    values: closes
  }).at(-1);
}

function calculateEMA(closes, periodMinutes) {
  return EMA.calculate({
    period: getCandleCount(periodMinutes),
    values: closes
  }).at(-1);
}

function calculateEMAChange(closes, periodMinutes, stepsBack) {
  const period = getCandleCount(periodMinutes);
  const emaSeries = EMA.calculate({ period, values: closes });
  if (emaSeries.length <= stepsBack) return 0;
  return emaSeries.at(-1) - emaSeries.at(-1 - stepsBack);
}

function calculateEMACrossover(closes) {
  const fast = EMA.calculate({ period: getCandleCount(config.EMA_FAST), values: closes });
  const slow = EMA.calculate({ period: getCandleCount(config.EMA_SLOW), values: closes });
  if (fast.length < 2 || slow.length < 2) return null;
  const crossover = fast.at(-2) < slow.at(-2) && fast.at(-1) > slow.at(-1);
  const crossunder = fast.at(-2) > slow.at(-2) && fast.at(-1) < slow.at(-1);
  return { crossover, crossunder };
}

function calculateMACD(closes) {
  const res = MACD.calculate({
    fastPeriod: getCandleCount(config.MACD_FAST),
    slowPeriod: getCandleCount(config.MACD_SLOW),
    signalPeriod: getCandleCount(config.MACD_SIGNAL),
    SimpleMAOscillator: false,
    SimpleMASignal: false,
    values: closes
  });
  return res.at(-1);
}

function calculateATR(highs, lows, closes) {
  return ATR.calculate({
    period: getCandleCount(config.ATR_PERIOD),
    high: highs,
    low: lows,
    close: closes
  }).at(-1);
}

function calculateADX(highs, lows, closes) {
  return ADX.calculate({
    period: getCandleCount(config.ADX_PERIOD),
    high: highs,
    low: lows,
    close: closes
  }).at(-1)?.adx;
}

function calculateMeanReversion(closes) {
  const maPeriod = getCandleCount(config.MEAN_REVERSION_MA_PERIOD);
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
  const lookbackCandles = getCandleCount(config.VOLUME_LOOKBACK);
  if (volumes.length < lookbackCandles) return { recentVolume: 0, avgVolume: 0, spike: 0, isSpike: false };

  const recentVolume = volumes.at(-1);
  const avgVolume = volumes.slice(-lookbackCandles).reduce((a, b) => a + b, 0) / lookbackCandles;

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
  calculateEMAChange,
  calculateEMACrossover,
  calculateMACD,
  calculateATR,
  calculateADX,
  calculateMeanReversion,
  calculateVolumeSpike
};
