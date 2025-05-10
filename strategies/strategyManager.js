// strategies/strategyManager.js
const config = require('../config/config');
const indicators = require('../core/indicators');

function applyStrategies(pair, candles) {
  const closes = candles.map(c => c.close);
  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);
  const volumes = candles.map(c => c.volume);

  const results = [];

  // ✅ RSI Rebound
  const rsi = indicators.calculateRSI(closes);
  if (rsi !== undefined) {
    if (rsi < config.RSI_LOW) results.push('RSI Oversold');
    else if (rsi > config.RSI_HIGH) results.push('RSI Overbought');
  }

  // ✅ EMA Crossover
  const emaCrossover = indicators.calculateEMACrossover(closes);
  if (emaCrossover?.crossover) results.push('EMA Bullish Crossover');
  if (emaCrossover?.crossunder) results.push('EMA Bearish Crossunder');

  // ✅ MACD Cross
  const macd = indicators.calculateMACD(closes);
  if (macd && macd.MACD && macd.signal) {
    const prevHist = macd.histogram;
    if (prevHist > 0 && macd.MACD < macd.signal) results.push('MACD Bearish');
    if (prevHist < 0 && macd.MACD > macd.signal) results.push('MACD Bullish');
  }

  // ✅ Mean Reversion
  const reversion = indicators.calculateMeanReversion(closes);
  if (reversion?.isDiverged) results.push('Mean Reversion Triggered');

  // ✅ Volume Spike
  const volSpike = indicators.calculateVolumeSpike(volumes);
  if (volSpike?.isSpike) results.push('Volume Spike');

  // ✅ ATR фильтр
  const atr = indicators.calculateATR(highs, lows, closes);
  if (atr && (atr / closes.at(-1)) * 100 < config.MIN_ATR_PERCENT) {
    return []; // Слабое движение — сигналы игнорируются
  }

  // ✅ ADX фильтр
  const adx = indicators.calculateADX(highs, lows, closes);
  if (adx !== undefined && adx < config.MIN_ADX) {
    return []; // Тренд слабый — сигналы игнорируются
  }
  
  if (results.length > 0 && config.DEBUG_LOGGING) {
  console.log(`[CHECK] ${pair}: сработали стратегии → ${results.join(', ')}`);
  }
  
  return results;
}

module.exports = {
  applyStrategies
};
