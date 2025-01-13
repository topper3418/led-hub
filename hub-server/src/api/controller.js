const db = require('../db');
const { getLogger } = require('../logging');
const logger = getLogger('api/controller');

const isMac = (mac) => {
    if (typeof mac !== 'string') return false;
    return mac.match(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/);
}

// gets the device object and attaches it to locals
const getDevice = async (req, res, next) => {
    const { id } = req.params;
    logger.debugp('searching for device device:', { id });
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
// - dataHas(['mac', 'ip', 'port'])
const handshake = async (req, res, next) => {
    const { mac, ip, port } = res.locals;
    const handshake = new db.HandShake({ mac, ip, port });

    logger.info(`handshake request from ${mac}`, { mac, ip, port })
    let foundDevice = await db.devices.find({ mac });
    if (foundDevice) logger.info('found device', { foundDevice });
    // ensure the strip exists
    try {
        if (!foundDevice) {
            logger.info(`creating device ${mac} - ${req.body.name || 'unnamed'}`)
            const device = new db.Device({
                mac: handshake.mac,
                name: req.body.name,
                current_ip: handshake.ip,
                current_port: handshake.port
            });
            await db.devices.create(device);
            // eventually I should streamline this by figuring out how to return the PK on create
            foundDevice = await db.devices.find({ mac: device.mac });
        }
    } catch (error) {
        logger.error(`${error.name} creating device: ${error.message}`, { error, mac, ip })
        next({
            status: 500,
            message: 'error creating device,' + error
        });
        return;
    }
    // ensure the strip is updated
    try {
        foundDevice.current_ip = ip;
        foundDevice.current_port = port;
        logger.info(`updating device ${foundDevice.name} to ${ip}:${port}`)
        await db.devices.update(foundDevice);
    } catch (error) {
        logger.error(`${error.name} updating device: ${error.message}`, { error, mac, ip })
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
    console.log('GOING TO WRITE TO DEVICE', { device })
    const { color, on, brightness } = req.body;
    try {
        const newState = { color, on, brightness }
        logger.info(`writing to device ${device.name}`, { body: req.body, newState })
        if (on === undefined) newState.on = device.on;
        console.log('first test')
        await device.write(newState);
        console.log('second test')
        const data = device.state;
        db.devices.update(device);
        res.json(data);
    } catch (error) {
        logger.error('error posting to strip', { error: error.stack })
        res.status(500).json({ error: error.stack, message: 'error posting to strip' });
    }
}


// Middleware: 

module.exports = {
    handshake: [
        bodyHasData,
        dataHas(['mac', 'ip', 'port']),
        handshake],
    read: [getDevice, read],
    write: [getDevice, write],
    list
};
