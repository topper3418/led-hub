const { json } = require('express');
const axios = require('axios');

const db = require('../db');

const findDevice = async (mac) => {
    if (!mac) throw new Error('No mac provided');
    try {
        return await db.devices.find({ mac });
    } catch (error) {
        console.log('error finding strip:', error)
    }
}

// gets the device object and attaches it to locals
const getDevice = async (req, res, next) => {
    const { mac } = req.params;
    console.log('received request for strip:', mac)
    let strip;
    try {
        strip = await findDevice(mac);
    } catch (error) {
        console.log('error finding strip:', error)
    }
    // only send 404 if the strip is mandatory
    if (!strip) {
        res.status(404).send("Strip not found");
        return;
    } else {
        console.log('attaching strip', strip)
        res.locals.strip = strip;
    }
    next();
}

const bodyHasData = (req, res, next) => {
    if (!req.body) next({
        status: 400,
        message: 'Missing body'
    })
    next();
}

// factory for checking for items in the body
const dataHas = (items) => {
    return (req, res, next) => {
        for (const item of items) {
            if (!req.body[item]) {
                res.status(400).send(`Missing ${item} in body`);
                return;
            }
            res.locals[item] = req.body[item];
        }
        next();
    }
}

// Middleware:
// - dataHas(['mac', 'ip', 'type'])
const handshake = async (req, res, next) => {
    const { mac, ip, type } = res.locals;
    const handshake = new db.HandShake(null, null, mac, ip, type);
    console.log("handshake request:", {mac, ip, type})
    console.log('looking for device:', mac)
    let foundDevice = await findDevice(mac);
    if (foundDevice) console.log('found device:', foundDevice);
    // ensure the strip exists
    try {
        if (!foundDevice) {
            console.log('creating device')
            const device = new db.Device(mac, req.body.name, ip);
            handshake.type = 'init';
            await db.devices.create(device);
            foundDevice = await db.devices.find(device.mac);
        }
    } catch (error) {
        console.log('error creating device:', error)
        next({
            status: 500,
            message: 'error creating device,' + error
        });
        return;
    }
    // ensure the strip is updated
    try {
        foundDevice.current_ip = ip;
        await db.devices.update(foundDevice); 
    } catch (error) {
        console.log('error updating device:', error)
        next({
            status: 500,
            message: 'error updating device', error
        });
        return;
    }
    // create the handshake
    try {
        await db.handshakes.create(handshake.mac, handshake.ip, handshake.type);
    } catch (error) {
        console.log('error creating handshake:', error)
        next({
            status: 500,
            message: 'error creating handshake', error
        });
        return;
    }
    res.status(200).json(foundDevice);
}


// Middleware:
// - getDevice
const read = async (req, res, next) => {
    const { strip } = res.locals;

    try {
        const url = `http://${strip.current_ip}:80/`
        console.log('fetching from strip:', url)
        const stripData = await axios.get(url);
    
        const { data } = stripData;
        console.log('got data from strip:', data)
        console.log('type of data: ', typeof data)
        res.json(data);
    } catch (error) {
        console.log(error)
        res.status(500).json({error: error.stack, message: 'error fetching from strip'});
    }
};

// no Middleware
const list = async (req, res, next) => {
    try {
        const devices = await db.devices.list();
        res.json(devices);
    } catch (error) {
        res.status(500).json({error: error.stack, message: 'error fetching devices'});
    }
}


// Middleware:
// - getDevice
const write = async (req, res) => {
    const { strip } = res.locals;

    const {color, on, brightness} = req.body;
    const onStatus = on ? 'on' : 'off';
    console.log('color', color)
    const url = `http://${strip.current_ip}/`;
    const body = {
        color,
        state: onStatus,
        brightness
    }

    try {
        const stripData = await axios.post(url, body);
        // const data = compensateForPicoFuckery(stripData.data)
        const data = stripData.data;

        res.json(data);
    } catch (error) {
        console.log(error)
        res.status(500).json({error: error.stack, message: 'error posting to strip'});
    }
}


// Middleware: 

module.exports = {
    handshake: [
        bodyHasData,
        dataHas(['mac', 'ip', 'type']), 
        handshake],
    read: [getDevice, read], 
    write: [getDevice, write],
    list
};