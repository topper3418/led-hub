// const { json } = require('express');
// const axios = require('axios');

const db = require('../db');
const getLogger = require('../logging');
// const LedStrip = require('../ledStrip');
const logger = getLogger('api/controller', 'debug');

// const {
//     isMac,
//     getDevice,
//     bodyHasData,
//     dataHas
// } = require('./middleware');
const isMac = (mac) => {
    if (typeof mac !== 'string') return false;
    return mac.match(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/);
}

// gets the device object and attaches it to locals
const getDevice = async (req, res, next) => {
    const { id } = req.params;
    logger.debug('searching for device device:', { id });
    let device;
    try {
        if (isMac(id)) {
            device = await db.devices.find({ mac: id });
        } else {
            device = await db.devices.find({ name: id });
        }
    } catch (error) {
        logger.error(`${error.name} finding device: ${error.message}`, { error, id })
    }
    if (!device) {
        res.status(404).send("Device not found");
        return;
    } else {
        logger.info('found device', { device })
        res.locals.device = device;
    }
    next();
}

const bodyHasData = (req, res, next) => {
    if (!req.body) {
        return next({
            status: 400,
            message: 'Missing body'
        })
    }
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
    const handshake = new db.HandShake({ mac, ip });

    logger.info(`handshake request from ${mac}`, { mac, ip, type })
    let foundDevice = await db.devices.find({ mac });
    if (foundDevice) logger.info('found device', { foundDevice });
    // ensure the strip exists
    try {
        if (!foundDevice) {
            logger.info(`creating device ${mac} - ${req.body.name || 'unnamed'}`)
            const device = new db.Device({ mac, name: req.body.name, current_ip: ip });
            handshake.type = 'init';
            await db.devices.create(device);
            // eventually I should streamline this by figuring out how to return the PK on create
            foundDevice = await db.devices.find({ mac: device.mac });
        }
    } catch (error) {
        logger.error(`${error.name} creating device: ${error.message}`, { error, mac, ip, type })
        next({
            status: 500,
            message: 'error creating device,' + error
        });
        return;
    }
    // ensure the strip is updated
    try {
        foundDevice.current_ip = ip;
        logger.info(`updating device ${foundDevice.name} with ip ${ip}`)
        await db.devices.update(foundDevice);
    } catch (error) {
        logger.error(`${error.name} updating device: ${error.message}`, { error, mac, ip, type })
        next({
            status: 500,
            message: 'error updating device', error
        });
        return;
    }
    // create the handshake
    try {
        await db.handshakes.create(handshake);
    } catch (error) {
        logger.error(`${error.name} creating handshake entry: ${error.message}`, { error, mac, ip, type })
        next({
            status: 500,
            message: 'error creating handshake', error
        });
        return;
    }
    logger.debug("returning device", { foundDevice });
    res.status(200).json(foundDevice);
}


// Middleware:
// - getDevice
const read = async (req, res, next) => {
    const { device } = res.locals;
    // instantiate led strip interface

    try {
        // const url = `http://${device.current_ip}:80/`
        // logger.debug(`requesting data from strip at ${url}`)
        // const stripData = await axios.get(url);
        //    
        // const { data } = stripData;
        // logger.debug('got data from strip', {data})
        // const data = device.interface.getState();
        // res.json(data);
        res.json(device.state)
    } catch (error) {
        logger.error(`${error.name} reading from ${device.name}: ${error.message}`, { error, device })
        res.status(500).json({ error: error.stack, message: 'error fetching from strip' });
    }
};

// no Middleware
const list = async (req, res, next) => {
    try {
        const devices = await db.devices.list();
        res.json(devices);
    } catch (error) {
        res.status(500).json({ error: error.stack, message: 'error fetching devices' });
    }
}


// Middleware:
// - getDevice
const write = async (req, res, next) => {
    const { device } = res.locals;
    //
    // const { color, on, brightness } = req.body;
    // const onStatus = on ? 'on' : 'off';

    // if these are set, the ledStrip
    // if (color != undefined) ledStripData.color = color;
    // if (on != undefined) ledStripData.state = onStatus;
    // if (brightness != undefined) ledStripData.brightness = brightness;

    // logger.info(`writing to ${device.name}`, {color, on, brightness})
    // const url = `http://${device.current_ip}/`;
    // const body = {
    //     color,
    //     state: onStatus,
    //     brightness
    // }
    // console.log('extracting state');
    const { color, on, brightness } = req.body;
    // console.log('body', req.body);
    try {
        // const stripData = await axios.post(url, body); // const data = compensateForPicoFuckery(stripData.data)
        // const data = stripData.data;

        // const writeData = { color, on: onStatus, brightness };

        await device.write({ color, on, brightness });
        const data = device.state;
        // console.log({ device });
        db.devices.update(device);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.stack, message: 'error posting to strip' });
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
