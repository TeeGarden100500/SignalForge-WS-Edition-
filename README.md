# SignalForge-WS-Edition-

# 📊 SignalForge (WebSocket Edition)

## 🚀 Описание проекта

**SignalForge** — это легковесный фоновый модуль для генерации торговых сигналов по WebSocket-потоку с Binance, без REST-запросов и веб-сервера.
Он построен на базе стратегий, комбинирующих технические индикаторы (RSI, EMA, MACD, Volume Spike и др.), и может отправлять сигналы через Webhook.

Проект полностью конфигурируемый через один файл `config.js`, подходит для запуска на Render как Background Worker.

---

## 🧱 Структура проекта

```
/core
  indicators.js
/strategies
  strategyManager.js
/websocket
  wsHandler.js
/webhook
  webhookSender.js
/config
  config.js
index.js
README.md
```

---

## ⚙️ Переменные `config.js`

| Переменная                              | Описание                                                |
| --------------------------------------- | ------------------------------------------------------- |
| `PAIRS`                                 | Список криптопар, например: `['BTCUSDT', 'ETHUSDT']`    |
| `INTERVAL`                              | Таймфрейм свечей: `'1m'`, `'5m'`, и т.д.                |
| `RSI_PERIOD`                            | Период RSI                                              |
| `RSI_LOW`, `RSI_HIGH`                   | Зоны перепроданности/перекупленности                    |
| `EMA_FAST`, `EMA_SLOW`                  | Периоды для EMA crossover                               |
| `MACD_FAST`, `MACD_SLOW`, `MACD_SIGNAL` | Настройки MACD                                          |
| `MEAN_REVERSION_MA_PERIOD`              | Период средней скользящей для возврата к среднему       |
| `MEAN_REVERSION_THRESHOLD`              | Порог отклонения в % от MA                              |
| `ATR_PERIOD`                            | Период для расчета ATR                                  |
| `MIN_ATR_PERCENT`                       | Минимальная волатильность (в %) для допуска сигнала     |
| `ADX_PERIOD`                            | Период ADX                                              |
| `MIN_ADX`                               | Минимальное значение ADX для допуска трендовых сигналов |
| `VOLUME_LOOKBACK`                       | Количество свечей для среднего объема                   |
| `VOLUME_SPIKE_MULTIPLIER`               | Во сколько раз объем должен превышать средний           |
| `BREAKOUT_LOOKBACK`                     | Сколько свечей назад искать уровень для пробоя          |
| `BREAKOUT_MARGIN_PERCENT`               | Порог приближения к уровню пробоя                       |
| `SIGNAL_CONFIRMATION_COUNT`             | Минимум сработавших стратегий для генерации сигнала     |
| `SIGNAL_TIME_WINDOW_UTC`                | Временной диапазон генерации сигналов (UTC)             |
| `WEBHOOK_URL`                           | Адрес отправки сигнала                                  |
| `ENABLE_WEBHOOK`                        | Вкл/выкл отправку сигналов по Webhook                   |
| `DEBUG_LOGGING`                         | Показывать отладочные логи в консоли                    |
| `MAX_CACHE_LENGTH`                      | Количество свечей в кэше на пару                        |

---

## 🧬 Пример сигнала

```json
{
  "time": "2025-05-10T14:22:00Z",
  "pair": "SOLUSDT",
  "triggers": [
    "RSI Oversold",
    "Volume Spike",
    "Mean Reversion Triggered"
  ],
  "price": 146.22
}
```

---

## 🌐 Пример Webhook-запроса

POST `https://your-service.com/webhook`

```json
{
  "time": "2025-05-10T14:22:00Z",
  "pair": "ETHUSDT",
  "triggers": ["MACD Bullish", "EMA Bullish Crossover"],
  "price": 3120.45
}
```

---

## 💪 Установка

```bash
npm install
node index.js
```

> Требуется Node.js 16+

---

## 📌 Примечания

* Работает **только через WebSocket Binance**
* Не хранит данные, не использует базу
* Без веб-интерфейса — только фоновые сигналы
* Проект легко масштабируется
