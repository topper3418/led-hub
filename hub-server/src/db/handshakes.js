const { useConnection } = require('./util');
const getLogger = require('../logging');
const logger = getLogger('db/handshakes');

class HandShake {
    constructor(id, timestamp, mac, ip, type) {
        this.id = id;
        this.timestamp = timestamp;
        this.mac = mac;
        this.ip = ip;
    }
}

const create = (mac, ip) => {
    logger.info('creating handshake:', { mac, ip });
    return new Promise((resolve, reject) => {
        useConnection((connection) => {
            const query = 'INSERT INTO handshakes (mac, ip) VALUES (?, ?)';
            const params = [ mac, ip ];
            logger.debug('running query:', { query, params });
            connection.query(query, params, (err, results) => {
                if (err) {
                    logger.error('Error querying the database:', { error: err.stack });
                    reject(err);
                }
                logger.info('results:', results);
                resolve(results);
            });
        });

    })
}

module.exports = {
    HandShake,
    create
}