const config = require('../config/config');
const logger = require('../config/logger');
const {
  calculateRSI,
  calculateEMA,
  calculateEMAChange,
  calculateEMACrossover,
  calculateMACD,
  calculateATR,
  calculateADX,
  calculateMeanReversion,
  calculateVolumeSpike
} = require('../core/indicators');

const { getCandles } = require('../ws/multiCandleCache');

function applyStrategies(symbol) {
  const triggers = [];

  const candles1m = getCandles(symbol, '1m');
  const candles5m = getCandles(symbol, '5m');

  if (candles5m.length < 10 || candles1m.length < 10) {
    logger.debug(`[SKIP] ${symbol}: недостаточно свечей для анализа (1m=${candles1m.length}, 5m=${candles5m.length})`);
    return triggers;
  }

  const closes5m = candles5m.map(c => c.close);
  const highs5m = candles5m.map(c => c.high);
  const lows5m = candles5m.map(c => c.low);
  const volumes5m = candles5m.map(c => c.volume);
  const c5 = closes5m.at(-1);

  logger.debug(`[STRATEGY] Анализируем ${symbol}...`);

  // === RSI ===
  const rsi = calculateRSI(closes5m);
  if (rsi !== undefined) {
    logger.debug(`[RSI] ${symbol}: ${rsi.toFixed(2)}`);
    if (rsi <= config.RSI_LOW) triggers.push(`RSI Oversold ➜ ${rsi.toFixed(2)} ≤ ${config.RSI_LOW}`);
    if (rsi >= config.RSI_HIGH) triggers.push(`RSI Overbought ➜ ${rsi.toFixed(2)} ≥ ${config.RSI_HIGH}`);
  }

  // === EMA Crossover ===
  const emaX = calculateEMACrossover(closes5m);
  if (emaX) {
    logger.debug(`[EMA-X] ${symbol}: crossover=${emaX.crossover}, crossunder=${emaX.crossunder}`);
    if (emaX.crossover) triggers.push(`EMA Crossover ➜ Fast↑ over Slow`);
    if (emaX.crossunder) triggers.push(`EMA Crossunder ➜ Fast↓ under Slow`);
  }

  // === MACD ===
  const macd = calculateMACD(closes5m);
  if (macd) {
    logger.debug(`[MACD] ${symbol}: MACD=${macd.MACD.toFixed(4)} Signal=${macd.signal.toFixed(4)} Histogram=${macd.histogram.toFixed(4)}`);
    const cross = macd.MACD - macd.signal;
    if (cross > 0 && macd.histogram > 0) {
      triggers.push(`MACD Bullish ➜ MACD=${macd.MACD.toFixed(4)} > Signal=${macd.signal.toFixed(4)}`);
    }
    if (cross < 0 && macd.histogram < 0) {
      triggers.push(`MACD Bearish ➜ MACD=${macd.MACD.toFixed(4)} < Signal=${macd.signal.toFixed(4)}`);
    }
  }

  // === ATR ===
  const atr = calculateATR(highs5m, lows5m, closes5m);
  if (atr && (atr / c5 * 100 >= config.MIN_ATR_PERCENT)) {
    triggers.push(`ATR High ➜ ${atr.toFixed(4)} ≥ ${config.MIN_ATR_PERCENT}% of price`);
  }

  // === ADX ===
  const adx = calculateADX(highs5m, lows5m, closes5m);
  if (adx && adx >= config.MIN_ADX) {
    triggers.push(`ADX Strong ➜ ${adx.toFixed(2)} ≥ ${config.MIN_ADX}`);
  }

  // === Mean Reversion ===
  const mean = calculateMeanReversion(closes5m);
  if (mean?.isDiverged) {
    triggers.push(`Mean Reversion ➜ Price=${c5.toFixed(4)} | MA=${mean.ma.toFixed(4)} | Δ=${mean.diffPercent.toFixed(2)}% ≥ ${config.MEAN_REVERSION_THRESHOLD}%`);
  }

  // === Volume Spike ===
  const v = calculateVolumeSpike(volumes5m);
  if (v.isSpike) {
    triggers.push(`Volume Spike ➜ ${v.recentVolume.toFixed(0)} > Avg=${v.avgVolume.toFixed(0)} ×${(v.spike).toFixed(2)}`);
  }

  // === Impulse Angle (EMA углы на 1m и 5m) ===
  const closes1m = candles1m.map(c => c.close);
  const delta1m = calculateEMAChange(closes1m, config.EMA_ANGLE_LENGTH, config.EMA_ANGLE_PERIOD);
  const delta5m = calculateEMAChange(closes5m, config.EMA_ANGLE_LENGTH, config.EMA_ANGLE_PERIOD);

  logger.debug(`[EMA ANGLE] ${symbol}: delta1m=${delta1m.toFixed(5)} delta5m=${delta5m.toFixed(5)}`);

  if (delta1m > config.EMA_ANGLE_THRESHOLD && delta5m > config.EMA_ANGLE_THRESHOLD) {
    triggers.push(`Impulse Angle ➜ EMA rising on 1m (+${delta1m.toFixed(4)}) & 5m (+${delta5m.toFixed(4)})`);
  }

  logger.debug(`[TRIGGERS] ${symbol}: ${triggers.length > 0 ? triggers.join('; ') : 'нет совпадений'}`);
  return triggers;
}

module.exports = {
  applyStrategies
};
