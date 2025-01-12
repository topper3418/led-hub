const { useConnection } = require('./util');
const { getLogger } = require('../logging');
const logger = getLogger('db/handshakes');

class HandShake {
    constructor({ id, timestamp, mac, ip, port }) {
        this.id = id;
        this.timestamp = timestamp;
        this.mac = mac;
        this.ip = ip;
        this.port = port;
    }
}

const create = ({ mac, ip, port }) => {
    logger.info('creating handshake:', { mac, ip, port });
    return new Promise((resolve, reject) => {
        useConnection((connection) => {
            const query = 'INSERT INTO handshakes (mac, ip, port) VALUES (?, ?, ?)';
            const params = [mac, ip, port];
            logger.debug('running query:', { query, params });
            connection.query(query, params, (err, results) => {
                if (err) {
                    logger.error('Error querying the database:', { error: err.stack });
                    reject(err);
                }
                logger.info('results', { results });
                resolve(results);
            });
        });

    })
}

module.exports = {
    HandShake,
    create
}
