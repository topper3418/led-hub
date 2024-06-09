const HubApp = require('./app')

const app = new HubApp(prodMode=false, port=2000);

app.start();