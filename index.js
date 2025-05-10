const { initVolatilityWatcher } = require('./core/volatilitySelector');
const { initWebSocket } = require('./websocket/wsHandler');
const { initVolatilityWatcher } = require('./core/volatilitySelector');
const { startWSManager } = require('./ws/smartWSManager');



initVolatilityWatcher();
initWebSocket();
initVolatilityWatcher();
startWSManager();
