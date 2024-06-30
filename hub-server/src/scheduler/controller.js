const db = require('../db');
const getLogger = require('../logging')

const logger = getLogger('scheduler/controller', 'debug');

// ping a strip and get its data, update the database
const refreshDevice = async (device) => {
    logger.debug(`refreshing device "${device.name}"`);
    logger.debug('got here at least');
    const stripData = await device.interface.getState();
    if (stripData.connected) {
        console.log('its connected');
        device.update(stripData);
        logger.info(`device ${device.name} updated successfully`, { device });
    } else {
        console.log('its not connected')
        logger.info(`unsuccessful refreshing device "${device.name}" on ip ${device.current_ip}`, { device, error: stripData.error });
        device.connected = false;
    }
    db.devices.update(device);
}


const refreshDevices = async () => {
    const devices = await db.devices.list()
    devices.forEach(device => {
        try {
            refreshDevice(device);
        } catch (error) {
            logger.error(`error refreshing ${device.name}`, { device, error });
        }
    });
}


module.exports = { refreshDevices };
