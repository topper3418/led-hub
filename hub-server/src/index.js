const express = require('express')
const router = require('./api')
const { init: initDb } = require('./db')
const scheduler = require('./scheduler')
const { getLogger } = require('./logging')
const cors = require('cors');
const logger = getLogger('api/index');

// Use logger after it has been resolved

const app = express();

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    const { method, url, body } = req;
    logger.debug(`request receieved from ${req.originalUrl}`, { method, url, body });
    next();
});
app.use('/', router);
const startHub = async ({ port = 2000 }) => {
    await initDb();
    scheduler.start();
    app.listen(port, () => logger.info(`hub server is running on port ${port}`));
}

module.exports = {
    start: startHub
}
