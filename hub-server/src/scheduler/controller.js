const db = require('../db');
const { getLogger } = require('../logging')

const logger = getLogger('scheduler/controller');

// ping a strip and get its data, update the database
const refreshDevice = async (device) => {
    logger.debugp(`refreshing device "${device.name}"`);
    try {
        await device.refreshState();
    } catch (error) {
        logger.errorp(`error frefreshing device ${device.name}: ${error.stack}`, error)
    }
    if (device.connected) {
        logger.info(`device ${device.name} updated successfully`, { device });
    } else {
        logger.info(`unsuccessful refreshing device "${device.name}" at ${device.current_ip}:${device.current_port}`, { device });
    }
    db.devices.update(device);
}


const refreshDevices = async () => {
    const devices = await db.devices.list()
    logger.infop('refreshing devices...')
    devices.forEach(device => {
        try {
            refreshDevice(device);
        } catch (error) {
            logger.errorp(`error refreshing ${device.name}`, { device, error });
        }
    });
}


module.exports = { refreshDevices };
