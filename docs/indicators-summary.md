# 📊 Обзор Реализованных Индикаторов и Анализаторов

Полный список технических индикаторов и фильтров, реализованных в проекте **SignalForge WS Edition** на текущий момент.

---

## ✅ Технические Индикаторы

| Индикатор / Фильтр      | Назначение                                                        | Таймфрейм |
|--------------------------|--------------------------------------------------------------------|------------|
| **RSI**                 | Определение перекупленности/перепроданности                      | 5m         |
| **EMA Crossover**       | Кроссовер EMA (быстрая и медленная)                             | 5m         |
| **MACD**                | Сигналы на пересечение MACD и сигнальной линии                  | 5m         |
| **ATR**                 | Оценка локальной волатильности                                  | 5m         |
| **ADX**                 | Сила тренда                                                      | 5m         |
| **Mean Reversion**      | Проверка отклонения от скользящей средней                        | 5m         |
| **Volume Spike**        | Выявление резкого увеличения объема                             | 5m         |
| **EMA Angle**           | Расчет угла наклона EMA на 1m и 5m                              | 1m + 5m    |

---

## 📈 Рыночные Фильтры

| Название                | Назначение                                                        | Источник          |
|-------------------------|--------------------------------------------------------------------|-------------------|
| **High/Low Proximity** | Определение близости к годовому максимуму/минимуму               | yearHighLow.json  |
| **Manual Levels**      | Ручные уровни отскока / перелома                                 | manualLevels.json |
| **Volatility Selector**| Выбор топ-N волатильных монет                                    | Binance WS        |

---

## ⚙️ Переменные из config.js

- RSI: `RSI_PERIOD`, `RSI_LOW`, `RSI_HIGH`
- EMA: `EMA_FAST`, `EMA_SLOW`, `EMA_ANGLE_PERIOD`, `EMA_ANGLE_THRESHOLD`
- MACD: `MACD_FAST`, `MACD_SLOW`, `MACD_SIGNAL`
- ATR: `ATR_PERIOD`, `MIN_ATR_PERCENT`
- ADX: `ADX_PERIOD`, `MIN_ADX`
- Mean Reversion: `MEAN_REVERSION_MA_PERIOD`, `MEAN_REVERSION_THRESHOLD`
- Volume: `VOLUME_LOOKBACK`, `VOLUME_SPIKE_MULTIPLIER`
- Proximity: `PERCENT_TO_HIGH`, `PERCENT_TO_LOW`
- Breakout (в разработке): `BREAKOUT_LOOKBACK`, `BREAKOUT_MARGIN_PERCENT`
- Волатильность: `VOLATILITY_TOP_COUNT`, `VOLATILITY_LOOKBACK`

---

## 📌 Возможности для будущего развития:

- Уровни Fibonacci (автоматически по swing high/low)
- VWAP (Volume Weighted Average Price)
- Кластерный анализ и уровни накопления
- Визуализация сигналов в HTML / Telegram / Dashboard
