const express = require('express');
const axios = require('axios');
const cors = require('cors');


const app = express();
const SERVER_PORT = 2000;
const SERVER_ADDRESS = 'localhost'; // Replace with your server address

const PORT = 3100;  // the port this will be listening on

app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Mock LED strip state and control
let ledStrip = {
    brightness: 100,
    on: false,
    color: {
        r: 255,
        g: 255, 
        b: 255
    }
};

// Handshake endpoint
const HANDSHAKE_ENDPOINT = `http://${SERVER_ADDRESS}:${SERVER_PORT}/`;

// Logging middleware
app.use((req, res, next) => {
    console.log(req.method, req.originalUrl, req.body);
    next();
});

// Handshake function
async function handshake() {
    const handshakeData = {
        mac: 'mockMacAddress',
        type: 'LedStrip',
        ip: '127.0.0.1',
        name: 'mock-led',
        port: PORT
    };

    try {
        const response = await axios.post(HANDSHAKE_ENDPOINT, handshakeData);
        if (response.status === 200) {
            console.log('Handshake successful');
            return true;
        } else {
            console.log('Handshake failed');
            return false;
        }
    } catch (error) {
        console.error(`Error during handshake: ${error.stack}`);
        return false;
    }
}

// Routes
app.get('/', (req, res) => {
    console.log('returning state: ', ledStrip)
    res.json(ledStrip);
});

app.post('/', (req, res) => {
    console.log('request body', req.body);
    if (req.body.brightness !== undefined) {
        console.log('Setting brightness:', req.body.brightness);
        ledStrip.brightness = req.body.brightness;
    }
    if (req.body.on !== undefined) {
        console.log('Setting state:', req.body.on);
        ledStrip.on = req.body.on;
    }
    if (req.body.color !== undefined) {
        console.log('Setting color:', req.body.color);
        ledStrip.color = req.body.color;
    }
    res.json(ledStrip);
});

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Server startup
async function startServer() {
    try {
        let handShakeComplete = false;
        while (!handShakeComplete) {
            handShakeComplete = await handshake();
            if (!handShakeComplete) await delay(500);
        }
        app.listen(PORT, () => {
            console.log(`Mock server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
    }
}

// Start the server
startServer();

