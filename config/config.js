
module.exports = {
  // ░░░ Таймфрейм ░░░
  INTERVAL: '5m',

  // ░░░ RSI ░░░
  RSI_PERIOD: 60,
  RSI_LOW: 40,
  RSI_HIGH: 60,

  // ░░░ EMA Crossover ░░░
  EMA_FAST: 8,
  EMA_SLOW: 21,

  // ░░░ MACD ░░░
  MACD_FAST: 6,
  MACD_SLOW: 13,
  MACD_SIGNAL: 4,

  // ░░░ Mean Reversion ░░░
  MEAN_REVERSION_MA_PERIOD: 30,
  MEAN_REVERSION_THRESHOLD: 0.5,

  // ░░░ ATR ░░░
  ATR_PERIOD: 14,
  MIN_ATR_PERCENT: 0.1,

  // ░░░ ADX ░░░
  ADX_PERIOD: 14,
  MIN_ADX: 5,

  // ░░░ Объем ░░░
  VOLUME_LOOKBACK: 5,
  VOLUME_SPIKE_MULTIPLIER: 1.2,

  // ░░░ Пробой ░░░
  BREAKOUT_LOOKBACK: 60,
  BREAKOUT_MARGIN_PERCENT: 0.05,

  // ░░░ Фильтрация сигналов ░░░
  SIGNAL_CONFIRMATION_COUNT: 1,
  SIGNAL_TIME_WINDOW_UTC: {
    start: '00:00',
    end: '23:59'
  },

  // ░░░ Webhook ░░░
  WEBHOOK_URL: 'https://webhook.site/b5170fa9-7272-431f-8eeb-66d1e4bc4eec',
  ENABLE_WEBHOOK: true,

  // ░░░ Логика и кэш ░░░
  MAX_CACHE_LENGTH: 500,
  DEBUG_LOGGING: true,
  DEBUG_LOG_LEVEL: 'verbose', // none | basic | verbose

  // ░░░ EMA Impulse Angle ░░░
  EMA_ANGLE_PERIOD: 3,
  EMA_ANGLE_THRESHOLD: 0.00005,
  EMA_ANGLE_LENGTH: 5,

  // ░░░ Волатильность ░░░
  VOLATILITY_TOP_COUNT: 10,
  VOLATILITY_LOOKBACK: 30,
  VOLATILITY_REFRESH_INTERVAL_SEC: 3600
};
