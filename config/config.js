module.exports = {
  DEBUG_LOG_LEVEL: 'basic',
  TIMEFRAMES: {
    LEVEL_1: '5m',
    LEVEL_2: '15m',
    LEVEL_3: '1h'
  },
  VOLATILITY_TOP_N: 20,
  BINANCE_STREAM_URL: 'wss://stream.binance.com:9443/ws',
  MANUAL_LEVELS_PATH: './data/manualLevels.json',
  YEAR_HIGH_LOW_PATH: './data/yearHighLow.json',
  ENABLE_HISTORY_LOG: true,
  
  // ░░░ RSI ░░░
  RSI_PERIOD: 60,
  RSI_LOW: 30,
  RSI_HIGH: 70,

  // ░░░ EMA Crossover ░░░
  EMA_FAST: 12,
  EMA_SLOW: 26,

  // ░░░ MACD ░░░
  MACD_FAST: 12,
  MACD_SLOW: 26,
  MACD_SIGNAL: 9,

  // ░░░ Mean Reversion ░░░
  MEAN_REVERSION_MA_PERIOD: 30,
  MEAN_REVERSION_THRESHOLD: 0.5,

  // ░░░ ATR ░░░
  ATR_PERIOD: 14,
  MIN_ATR_PERCENT: 0.5,

  // ░░░ ADX ░░░
  ADX_PERIOD: 14,
  MIN_ADX: 20,

  // ░░░ Объем ░░░
  VOLUME_LOOKBACK: 20,
  VOLUME_SPIKE_MULTIPLIER: 2.5,

  // ░░░ Пробой ░░░
  BREAKOUT_LOOKBACK: 60,
  BREAKOUT_MARGIN_PERCENT: 0.05,

  // ░░░ Фильтрация сигналов ░░░
  SIGNAL_CONFIRMATION_COUNT: 2,
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
  VOLATILITY_TOP_COUNT: 5,
  VOLATILITY_LOOKBACK: 5,
  VOLATILITY_REFRESH_INTERVAL_SEC: 300,

  // отклонение от уровня фибоначи
  FIBO_TOLERANCE_PERCENT: 5.5, // Допуск в % для попадания в уровень
  
  // 12mth - low/high
  PERCENT_TO_HIGH: 10,
  PERCENT_TO_LOW: 10,

    // 🆕 Интервал обновления подписок (мс)
  SUBSCRIPTION_REFRESH_INTERVAL_MS: 5 * 60 * 1000,

};
