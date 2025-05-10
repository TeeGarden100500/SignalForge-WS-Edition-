const { initVolatilityWatcher } = require('./core/volatilitySelector');
const { initWebSocket } = require('./websocket/wsHandler');

initVolatilityWatcher();
initWebSocket();
