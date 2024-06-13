const { json } = require('express');
const axios = require('axios');

const db = require('../db');

const logger = db.getLogger('devices-controller');

// gets the device object and attaches it to locals
const getDevice = async (req, res, next) => {
    const { mac } = req.params;
    logger.trace('getting device:', mac);
    let strip;
    try {
        strip = await db.devices.find({ mac });
    } catch (error) {
        logger.error(`${error.name} finding device: ${error.message}`, error)
    }
    // only send 404 if the strip is mandatory
    if (!strip) {
        res.status(404).send("Strip not found");
        return;
    } else {
        logger.info('found device', error)
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
    logger.info('got here')
    const { mac, ip, type } = res.locals;
    const handshake = new db.HandShake(null, null, mac, ip);

    logger.info(`handshake request from ${mac}`, {mac, ip, type})
    let foundDevice = await db.devices.find({ mac });
    if (foundDevice) console.log('found device:', foundDevice);
    // ensure the strip exists
    try {
        if (!foundDevice) {
            logger.info(`creating device ${mac} - ${req.body.name || 'unnamed'}`)
            const device = new db.Device(mac, req.body.name, ip);
            handshake.type = 'init';
            await db.devices.create(device);
            // eventually I should streamline this by figuring out how to return the PK on create
            foundDevice = await db.devices.find({mac: device.mac});
        }
    } catch (error) {
        logger.error(`${error.name} creating device: ${error.message}`, error)
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
        logger.error(`${error.name} updating device: ${error.message}`, error)
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
        logger.error(`${error.name} creating handshake entry: ${error.message}`, error)
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
        logger.debug(`requesting data from strip at ${url}`)
        const stripData = await axios.get(url);
    
        const { data } = stripData;
        logger.debug('got data from strip', data)
        res.json(data);
    } catch (error) {
        logger.error(`${error.name} reading from ${strip.name}: ${error.message}`, error)
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
    logger.info(`writing to ${strip.name}`, {color, on, brightness})
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
        logger.error(`${error.name} writing to ${strip.name}: ${error.message}`, error)
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