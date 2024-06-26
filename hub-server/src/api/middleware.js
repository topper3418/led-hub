
const isMac = (mac) => {
    if (typeof mac !== 'string') return false;
    return mac.match(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/);
}

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
    // only send 404 if the strip is mandatory
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
    if (!req.body) next({
        status: 400,
        message: 'Missing body'
    })
    next();
}


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

module.exports = {
    isMac,
    getDevice,
    bodyHasData,
    dataHas
}
