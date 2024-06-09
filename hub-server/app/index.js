const express = require('express')
const path = require('path')
const router = require('./router')
const { init: initDb } = require('../db')

class HubApp extends express {
    constructor(prodMode = true, port = 4000) {
        super();
        initDb();
        this.port = port || 4000;
        this.prodMode = prodMode;
        this.applyMiddleware();
        
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
        this.listen(this.port, () => {
            const mode = this.prodMode ? "prod mode" : "dev mode"
            console.log(
                `log server is running on port ${this.port} in ${mode}`
            );
        });
    };
}

module.exports = HubApp;