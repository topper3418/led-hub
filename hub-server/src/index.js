const express = require('express')
const router = require('./api')
const { init: initDb } = require('./db')
const scheduler = require('./scheduler')
const getLogger = require('./logging')

const logger = getLogger('api/index');

// Use logger after it has been resolved

class HubApp extends express {
    constructor(port = 4000) {
        super();
        this.initialization = initDb();
        this.scheduler = scheduler;
        this.port = port || 4000;
        this.prodMode = prodMode;
        this.applyMiddleware();
    }

    applyMiddleware = () => {
        this.use((req, res, next) => {
            const { method, url, body } = req;
            logger.debug(`request receieved from ${req.originalUrl}`, { method, url, body });
            next();
        });
        this.use(express.json());
        const cors = require("cors");
        this.use(cors());
        this.use("/", router);
    };

    start = async () => {
        await this.initialization;
        this.scheduler.start();
        this.listen(this.port, () => {
            logger.info(
                `hub server is running on port ${this.port}`
            );
        });
    };
}

module.exports = HubApp;