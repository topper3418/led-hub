const router = require('./src/api');

const Express = require('express');

const app = Express();

const PORT = 4000;

app.use(router);

app.listen(PORT, () => console.log(`running on ${PORT}`));
