const {getLogger} = require('@topper3418/logger-server')

const HubApp = require('./app')

logger = getLogger("appHubServer", "INFO");

const app = new HubApp(prodMode=false, port=2000);

app.start();