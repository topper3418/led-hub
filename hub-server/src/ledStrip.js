const getLogger = require('./logging');
const axios = require('axios');

const logger = getLogger('ledStrip', 'debug')

class LedStripInterface {
    constructor({ name, mac, ip }) {
        this.name = name;
        this.mac = mac;
        this.ip = ip;
    }

    async getState() {
        const url = `http://${this.ip}:80/`
        logger.debug(`requesting data from strip at ${url}`)
        try {
            const stripData = await axios.get(url, { timeout: 5000 });
            const { data } = stripData;
            data.connected = true;
            logger.debug('got data from strip', { data })
            return data
        } catch (error) {
            if (error.code == "ECONNABORTED") {
                logger.debug('its a conn aborted');
                return { connected: false, error };
            } else if (error.code == "EHOSTDOWN") {
                logger.debug('its a host down');
                return { connected: false, error };
            } else if (error.code == "EHOSTUNREACH") {
                logger.debug('its an unreachable');
                return { connected: false, error };
            }
            logger.error('error caught by strip', { error });
            throw error;
        }
    }

    async set({ state, brightness, color }) {
        logger.info(`writing to ${this.name}`, { color, state, brightness })
        const url = `http://${this.ip}/`;
        const body = {
            color,
            state,
            brightness
        }

        try {
            const stripData = await axios.post(url, body);
            // const data = compensateForPicoFuckery(stripData.data)
            const data = stripData.data;

            return data;
        } catch (error) {
            logger.error(`${error.name} writing to ${this.name}: ${error.message}`, { error })
            throw error;
        }

    }
}

module.exports = LedStripInterface;
