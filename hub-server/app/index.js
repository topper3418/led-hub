const express = require('express')
const path = require('path')
const router = require('./router')
const { init: initDb } = require('../db')
const getLogger = require('../db/logging')

const loggerPromise = getLogger('hub-server');
let logger;

loggerPromise.then((resolvedLogger) => {
    logger = resolvedLogger;
}).catch((error) => {
    console.error('Error initializing logger:', error);
});

// Use logger after it has been resolved

class HubApp extends express {
    constructor(prodMode = true, port = 4000) {
        super();
        //initDb(); // deprecate this, run the sql some other way. 
        this.port = port || 4000;
        this.prodMode = prodMode;
        this.applyMiddleware();
    }

    applyMiddleware = () => {
        // this.use((req, res, next) => {
        //     console.log(new Date().toISOString(), req.method, req.url, req.body);
        //     next();
        // });
        this.use(express.json());
        const cors = require("cors");
        this.use(cors());
        
        if (this.prodMode){
            this.use(express.static(path.join(__dirname, "../webApp/dist")));
            this.get("/", (_, res) => {
                logger.info("serving client app");
                res.sendFile(
                    path.join(__dirname, "../webApp/dist", "index.html")
                );
            });
        } else {
            this.get("/", (_, res) => {
                res.send("Hello from Hub Server");
            });
        }

        this.use("/devices/", router);
    };

    start = async () => {
        this.listen(this.port, () => {
            const mode = this.prodMode ? "prod mode" : "dev mode"
            logger.info(
                `hub server is running on port ${this.port} in ${mode}`
            );
        });
    };
}

module.exports = HubApp;