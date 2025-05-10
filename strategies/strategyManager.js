
const config = require('../config/config');
const {
  calculateRSI,
  calculateEMA,
  calculateEMACrossover,
  calculateMACD,
  calculateATR,
  calculateADX,
  calculateMeanReversion,
  calculateVolumeSpike
} = require('../core/indicators');

function applyStrategies(symbol, candles) {
  const triggers = [];

  if (candles.length < 10) return triggers;

  const closes = candles.map(c => c.close);
  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);
  const volumes = candles.map(c => c.volume);
  const c = closes.at(-1);

  // === RSI ===
  const rsi = calculateRSI(closes);
  if (rsi !== undefined) {
    if (rsi <= config.RSI_LOW) triggers.push(`RSI Oversold ➜ ${rsi.toFixed(2)} ≤ ${config.RSI_LOW}`);
    if (rsi >= config.RSI_HIGH) triggers.push(`RSI Overbought ➜ ${rsi.toFixed(2)} ≥ ${config.RSI_HIGH}`);
  }

  // === EMA Crossover ===
  const emaX = calculateEMACrossover(closes);
  if (emaX) {
    if (emaX.crossover) triggers.push(`EMA Crossover ➜ Fast↑ over Slow`);
    if (emaX.crossunder) triggers.push(`EMA Crossunder ➜ Fast↓ under Slow`);
  }

  // === MACD ===
  const macd = calculateMACD(closes);
  if (macd) {
    const cross = macd.MACD - macd.signal;
    if (cross > 0 && macd.histogram > 0) {
      triggers.push(`MACD Bullish ➜ MACD=${macd.MACD.toFixed(4)} > Signal=${macd.signal.toFixed(4)}`);
    }
    if (cross < 0 && macd.histogram < 0) {
      triggers.push(`MACD Bearish ➜ MACD=${macd.MACD.toFixed(4)} < Signal=${macd.signal.toFixed(4)}`);
    }
  }

  // === ATR ===
  const atr = calculateATR(highs, lows, closes);
  if (atr && (atr / c * 100 >= config.MIN_ATR_PERCENT)) {
    triggers.push(`ATR High ➜ ${atr.toFixed(4)} ≥ ${config.MIN_ATR_PERCENT}% of price`);
  }

  // === ADX ===
  const adx = calculateADX(highs, lows, closes);
  if (adx && adx >= config.MIN_ADX) {
    triggers.push(`ADX Strong ➜ ${adx.toFixed(2)} ≥ ${config.MIN_ADX}`);
  }

  // === Mean Reversion ===
  const mean = calculateMeanReversion(closes);
  if (mean?.isDiverged) {
    triggers.push(`Mean Reversion ➜ Price=${c.toFixed(4)} | MA=${mean.ma.toFixed(4)} | Δ=${mean.diffPercent.toFixed(2)}% ≥ ${config.MEAN_REVERSION_THRESHOLD}%`);
  }

  // === Volume Spike ===
  const v = calculateVolumeSpike(volumes);
  if (v.isSpike) {
    triggers.push(`Volume Spike ➜ ${v.recentVolume.toFixed(0)} > Avg=${v.avgVolume.toFixed(0)} ×${(v.spike).toFixed(2)}`);
  }

  return triggers;
}

module.exports = {
  applyStrategies
};
