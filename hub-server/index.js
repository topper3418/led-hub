const HubApp = require('./app')

const app = new HubApp(prodMode=true, port=2000);

app.start();