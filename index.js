const { initVolatilityWatcher } = require('./core/volatilitySelector');
const { startWSManager } = require('./ws/smartWSManager');

initVolatilityWatcher();
startWSManager();
