
const config = require('../config/config');

function log(...args) {
  if (config.DEBUG_LOG_LEVEL !== 'none') {
    console.log('[LOG]', ...args);
  }
}

function debug(...args) {
  if (config.DEBUG_LOG_LEVEL === 'verbose') {
    console.debug('[DEBUG]', ...args);
  }
}

function warn(...args) {
  if (config.DEBUG_LOG_LEVEL !== 'none') {
    console.warn('[WARN]', ...args);
  }
}

function error(...args) {
  console.error('[ERROR]', ...args);
}

module.exports = {
  log,
  debug,
  warn,
  error
};
