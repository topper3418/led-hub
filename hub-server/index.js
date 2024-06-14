const HubApp = require('./src/api')

const app = new HubApp(prodMode=false, port=2000);

app.start();