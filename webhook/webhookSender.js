const https = require('https');
const http = require('http');
const url = require('url');
const config = require('../config/config');

function sendWebhook(payload) {
  if (!config.ENABLE_WEBHOOK) return;

  const parsedUrl = url.parse(config.WEBHOOK_URL);
  const data = JSON.stringify(payload);

  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
    path: parsedUrl.path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const protocol = parsedUrl.protocol === 'https:' ? https : http;

  const req = protocol.request(options, (res) => {
    if (config.DEBUG_LOGGING) {
      console.log(`[WEBHOOK] Status: ${res.statusCode}`);
    }
  });

  req.on('error', (err) => {
    console.error('[WEBHOOK] Error:', err.message);
  });

  req.write(data);
  req.end();
}

module.exports = {
  sendWebhook
};
