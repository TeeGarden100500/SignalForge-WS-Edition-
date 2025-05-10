module.exports = {
  // ░░░ Общие настройки ░░░
  INTERVAL: '1m',                           // Таймфрейм свечей

  // ░░░ RSI ░░░
  RSI_PERIOD: 14,
  RSI_LOW: 30,
  RSI_HIGH: 70,

  // ░░░ EMA Crossover ░░░
  EMA_FAST: 9,
  EMA_SLOW: 21,

  // ░░░ MACD ░░░
  MACD_FAST: 12,
  MACD_SLOW: 26,
  MACD_SIGNAL: 9,

  // ░░░ Mean Reversion ░░░
  MEAN_REVERSION_MA_PERIOD: 20,
  MEAN_REVERSION_THRESHOLD: 2.0, // В % отклонения от MA

  // ░░░ ATR ░░░
  ATR_PERIOD: 14,
  MIN_ATR_PERCENT: 0.5, // Игнорируем сигналы, если ATR ниже этого значения

  // ░░░ ADX ░░░
  ADX_PERIOD: 14,
  MIN_ADX: 20, // Минимум силы тренда для EMA и MACD

  // ░░░ Объем ░░░
  VOLUME_LOOKBACK: 20,               // Сколько свечей брать для расчета среднего объема
  VOLUME_SPIKE_MULTIPLIER: 2.0,      // Минимум во сколько раз объем должен превышать средний

  // ░░░ Пробой ░░░
  BREAKOUT_LOOKBACK: 10,             // За сколько свечей назад искать экстремумы
  BREAKOUT_MARGIN_PERCENT: 0.2,      // Сколько процентов "допуск" к уровню

  // ░░░ Фильтрация сигналов ░░░
  SIGNAL_CONFIRMATION_COUNT: 2,      // Сколько стратегий должно сработать одновременно
  SIGNAL_TIME_WINDOW_UTC: {          // Только в рамках этого времени UTC давать сигналы
    start: '07:00',
    end: '19:00'
  },

  // ░░░ Webhook ░░░
  WEBHOOK_URL: 'https://your-service.com/webhook', // Куда отправлять сигналы
  ENABLE_WEBHOOK: true,

  // ░░░ Другое ░░░
  DEBUG_LOGGING: true,               // Включить подробные логи
  MAX_CACHE_LENGTH: 500,              // Храним максимум 500 свечей на пару

  
  // ░░░ Волатильность ░░░
  VOLATILITY_TOP_COUNT: 20,             // Сколько монет отбирать
  VOLATILITY_TIMEFRAME: '5m',           // Какой таймфрейм использовать для анализа
  VOLATILITY_LOOKBACK: 12,              // Сколько свечей анализировать (12×5m = 1 час)
  VOLATILITY_REFRESH_INTERVAL_SEC: 300  // Как часто обновлять топ (в секундах)
};
