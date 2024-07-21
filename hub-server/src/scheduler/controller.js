const db = require('../db');
const getLogger = require('../logging')

const logger = getLogger('scheduler/controller', 'debug');

// ping a strip and get its data, update the database
const refreshDevice = async (device) => {
    logger.debug(`refreshing device "${device.name}"`);
    await device.refreshState();
    if (device.connected) {
        logger.info(`device ${device.name} updated successfully`, { device });
    } else {
        logger.info(`unsuccessful refreshing device "${device.name}" at ${device.current_ip}:${device.current_port}`, { device });
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
