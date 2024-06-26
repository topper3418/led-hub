const db = require('../db');
const getLogger = require('../logging')

const logger = getLogger('scheduler/controller', 'DEBUG');

// ping a strip and get its data, update the database
const refreshDevice = async (device) => {
    try {
        logger.debug(`refreshing device ${device.name}`);
        const stripData = await device.interface.getState();
        device.update(stripData);
        await db.devices.update(device);
        logger.info(`device ${device.name} updated successfully`, { device });
    } catch (error) {
        // TODO make the "no connection" condition set strip to disconnected
        logger.error(`error refreshing ${device.name}`, { device, error });
    }
}


const refreshDevices = async () => {
    const devices = await db.devices.list()
    devices.forEach(device => {
        try {
            refreshDevice(device);
        } catch (error) {
            logger.error(`error refreshing ${device.name}`, { device, error });
        }
    }
}


module.exports = { refreshDevices }
