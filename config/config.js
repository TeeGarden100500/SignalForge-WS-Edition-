
module.exports = {
  // ░░░ Таймфрейм ░░░
  INTERVAL: '5m', // Используется в WebSocket и расчетах

  // ░░░ RSI ░░░
  RSI_PERIOD: 60,         // 60 минут истории
  RSI_LOW: 30,
  RSI_HIGH: 70,

  // ░░░ EMA Crossover ░░░
  EMA_FAST: 21,           // 21 минута
  EMA_SLOW: 55,           // 55 минут

  // ░░░ MACD ░░░
  MACD_FAST: 12,          // 12 минут EMA
  MACD_SLOW: 26,
  MACD_SIGNAL: 9,

  // ░░░ Mean Reversion ░░░
  MEAN_REVERSION_MA_PERIOD: 90,  // 90 минут
  MEAN_REVERSION_THRESHOLD: 2.0, // %

  // ░░░ ATR ░░░
  ATR_PERIOD: 30,
  MIN_ATR_PERCENT: 0.4,

  // ░░░ ADX ░░░
  ADX_PERIOD: 30,
  MIN_ADX: 20,

  // ░░░ Объем ░░░
  VOLUME_LOOKBACK: 20,           // В минутах
  VOLUME_SPIKE_MULTIPLIER: 2.5,  // x раз превышения

  // ░░░ Пробой ░░░
  BREAKOUT_LOOKBACK: 300,         // 10 минут назад
  BREAKOUT_MARGIN_PERCENT: 0.2,

  // ░░░ Фильтрация сигналов ░░░
  SIGNAL_CONFIRMATION_COUNT: 2,
  SIGNAL_TIME_WINDOW_UTC: {
    start: '06:00',
    end: '23:00'
  },

  // ░░░ Webhook ░░░
  WEBHOOK_URL: 'https://webhook.site/b5170fa9-7272-431f-8eeb-66d1e4bc4eec',
  ENABLE_WEBHOOK: true,

  // ░░░ Логика и кэш ░░░
  MAX_CACHE_LENGTH: 500,
  DEBUG_LOGGING: true,



  // ░░░ EMA Impulse Angle ░░░
  EMA_ANGLE_PERIOD: 5,         // сколько свечей назад сравнивать
  EMA_ANGLE_THRESHOLD: 0.0002, // минимальное отклонение по цене
  EMA_ANGLE_LENGTH: 10 ,        // период EMA для оценки движения


  // ░░░ Волатильность ░░░
  VOLATILITY_TOP_COUNT: 50,
  VOLATILITY_LOOKBACK: 60,              // 60 минут анализа
  VOLATILITY_REFRESH_INTERVAL_SEC: 21600  // раз в 6 часов
};
