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
        try {
            const url = `http://${this.ip}:80/`
            logger.debug(`requesting data from strip at ${url}`)
            const stripData = await axios.get(url);

            const { data } = stripData;
            logger.debug('got data from strip', { data })
            return data
        } catch (error) {
            logger.error(`${error.name} reading from ${this.name}: ${error.message}`, { error })
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
