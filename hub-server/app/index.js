const express = require('express')
const path = require('path')
const { getStripData, setStrip } = require('./routes')

class HubApp extends express {
    constructor(prodMode = true, port = 4000) {
        super();
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
        this.listen(this.port, () => {
            console.log(
                `log server is running on port ${this.port} in ${
                    this.prodMode ? "prod mode" : "dev mode"
                }`
            );
        });
    };
}

module.exports = HubApp;