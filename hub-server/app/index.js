const {getLogger, LoggerApp, loggingEngine} = require('@topper3418/logger-server')
const express = require('express')
const path = require('path')
const { getStripData, setStrip } = require('./routes')

// constant for now, will be configurable later
const stripIP = '192.168.68.69';
const stripPort = '80';

logger = getLogger("appHubServer", "INFO");

class HubApp extends express {
    constructor(prodMode = true, port = 4000) {
        super();
        this.port = port || 4000;
        this.prodMode = prodMode;
        this.applyMiddleware();
        
        const loggerApp = new LoggerApp();
        this.use('/log', loggerApp);
        
        if (this.prodMode){
            this.use(express.static(path.join(__dirname, "../webClient/dist")));
            this.get("/", (_, res) => {
                logger.info("serving client app");
                console.log("serving client app");
                res.sendFile(
                    path.join(__dirname, "../webClient/dist", "index.html")
                );
            });
        } else {
            this.get("/", (_, res) => {
                res.send("Hello from Hub Server");
            });
        }

        this.get("/stripInfo", (_, res) => {
            res.json({ ip: stripIP, port: stripPort });
        });

        this.get("/stripData/:stripname", getStripData);
        this.post("/stripData/:stripname", setStrip);
    }

    applyMiddleware = () => {
        this.use(express.json());
        if (!this.prodMode) {
            const cors = require("cors");
            this.use(cors());
        } 
    };

    start = async () => {
        await loggingEngine.sync();
        this.listen(this.port, () => {
            console.log(
                `log server is running on port ${this.port} in ${
                    this.prodMode ? "prod mode" : "dev mode"
                }`
            );
            logger.info("Log server started", {
                port: this.port,
                mode: this.prodMode ? "prod" : "dev",
            });
        });
    };
}

module.exports = HubApp;