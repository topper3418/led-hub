const express = require('express')
const { getLogger, loggerRouter, loggingEngine } = require('@topper3418/logger-server')
const path = require('path')
const router = require('./router')

const logger = getLogger('hub-server')

class HubApp extends express {
    constructor(prodMode = true, port = 4000) {
        super();
        this.port = port || 4000;
        this.prodMode = prodMode;
        this.applyMiddleware();
        this.loggingEngine = loggingEngine;
        
        if (this.prodMode){
            this.use(express.static(path.join(__dirname, "../webApp/dist")));
            this.get("/", (_, res) => {
                console.log("serving client app");
                res.sendFile(
                    path.join(__dirname, "../webApp/dist", "index.html")
                );
            });
        } else {
            this.get("/", (_, res) => {
                res.send("Hello from Hub Server");
            });
        }

        this.use("/logs", loggerRouter);

        this.get("/stripInfo", (_, res) => {
            res.json({ ip: stripIP, port: stripPort });
        });

        this.use("/stripData/", router);
    }

    applyMiddleware = () => {
        this.use(express.json());
        const cors = require("cors");
        this.use(cors());
        if (!this.prodMode) {
        } 
    };

    start = async () => {
        await loggingEngine.sync();
        this.listen(this.port, () => {
            const mode = this.prodMode ? "prod mode" : "dev mode"
            console.log(
                `log server is running on port ${this.port} in ${mode}`
            );
            logger.info(`log server is running on port ${this.port} in ${mode}`)
        });
    };
}

module.exports = HubApp;