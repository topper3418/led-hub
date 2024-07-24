require('dotenv').config();
const HubApp = require('./src')

const port = process.env.SERVER_PORT;

HubApp.start({ port });
