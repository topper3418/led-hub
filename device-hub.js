const HubApp = require('./device-hub');
const express = require('express');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');
require('dotenv').config();

const app = new HubApp();

try {
    // Serve the Vite build located at webapp/dist
    app.use('/', express.static(path.join(__dirname, 'webapp/dist')));
} catch (error) {
    if (error.message.includes('webapp/dist')) {
        console.error("no build found, building...");
        console.log("Navigating to /webapp and running npm run build...");
        process.chdir(path.join(__dirname, 'webapp'));
        execSync('npm run build');
        console.log("Build completed successfully.");
    } else {
        throw error;
    }
}

const port = process.env.HUB_SERVER_PORT || 3000;
// Get the local IP address
const networkInterfaces = os.networkInterfaces();
const localIP = networkInterfaces['lo0'][0].address;

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://${localIP}:${port}`);
});