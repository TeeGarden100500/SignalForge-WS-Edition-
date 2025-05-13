// 📁 scripts/updateHighLow.js
const fs = require('fs');
const https = require('https');

const outputPath = './data/yearHighLow.json';

function fetchExchangeInfo() {
  return new Promise((resolve, reject) => {
    https.get('https://api.binance.com/api/v3/exchangeInfo', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const info = JSON.parse(data);
          const usdtPairs = info.symbols
            .filter(s => s.quoteAsset === 'USDT' && s.status === 'TRADING' && s.isSpotTradingAllowed)
            .map(s => s.symbol);
          resolve(usdtPairs);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function getKlines(symbol) {
  return new Promise((resolve, reject) => {
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d&limit=365`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const candles = JSON.parse(data);
          resolve(candles);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function collectHighLow() {
  const result = {};
  const pairs = await fetchExchangeInfo();

  for (const symbol of pairs) {
    try {
      const candles = await getKlines(symbol);
      const highs = candles.map(c => parseFloat(c[2]));
      const lows = candles.map(c => parseFloat(c[3]));
      result[symbol] = {
        high: Math.max(...highs),
        low: Math.min(...lows)
      };
      console.log(`[OK] ${symbol} — HIGH: ${result[symbol].high} / LOW: ${result[symbol].low}`);
    } catch (e) {
      console.error(`[FAIL] ${symbol}`, e.message);
    }
  }

  fs.mkdirSync('./data', { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`\n✅ Данные сохранены в ${outputPath}`);
}

collectHighLow();
