const router = require('./src/api');

const Express = require('express');

const app = Express();

app.use(router);

app.listen(4000, () => console.log("running on 4000"));
