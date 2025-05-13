// 📄 scripts/testHighLowScan.js
const fs = require('fs');
const path = './data/yearHighLow.json';

const config = require('../config/config');
const PERCENT_TO_HIGH = config.PERCENT_TO_HIGH;
const PERCENT_TO_LOW = config.PERCENT_TO_LOW;

try {
  const content = JSON.parse(fs.readFileSync(path, 'utf8'));

  console.log('\n📈 [NEAR YEAR HIGH]');
  Object.entries(content).forEach(([symbol, { high, close }]) => {
    const distance = ((high - close) / high) * 100;
    if (distance <= PERCENT_TO_HIGH) {
      console.log(`${symbol}: close=${close}, high=${high} \u2794 ${distance.toFixed(2)}% от HIGH`);
    }
  });

  console.log('\n📉 [NEAR YEAR LOW]');
  Object.entries(content).forEach(([symbol, { low, close }]) => {
    const distance = ((close - low) / low) * 100;
    if (distance <= PERCENT_TO_LOW) {
      console.log(`${symbol}: close=${close}, low=${low} \u2794 ${distance.toFixed(2)}% от LOW`);
    }
  });
} catch (err) {
  console.error('\n\u274C Ошибка чтения yearHighLow.json:', err.message);
}
