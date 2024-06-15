const { useConnection } = require('./util');
const getLogger = require('../logging');
const { query } = require('express');

const logger = getLogger('db/devices');

class Device {
    constructor(mac, name, type, current_ip) {
        this.mac = mac;
        this.type = type;
        this.name = name;
        this.current_ip = current_ip;
    }

    isEqual(other) {
        if (!other instanceof Device) {
            return false;
        }
        if (!this.mac === other.mac) {
            return false;
        }
        if (!this.type === other.type) {
            return false;
        }
        if (!this.name === other.name) {
            return false;
        }
        if (!this.current_ip === other.current_ip) {
            return false;
        }
        return true;
    }

    toJSON() {
        return {
            mac: this.mac,
            type: this.type,
            name: this.name,
            current_ip: this.current_ip
        }
    }
}

const find = ({ mac, name, ip }) => {
    logger.info('finding device:', { mac, name, ip })
    return new Promise((resolve, reject) => {
        useConnection((connection) => {
            let query = 'SELECT * FROM devices WHERE ';
            let criteria;
            if (mac) {
                criteria = mac;
                query += 'mac = ?';
            } else if (name) {
                criteria = name;
                query += 'name = ?';
            } else if (ip) {
                criteria = ip;
                query += 'current_ip = ?';
            } else {
                reject(new Error('No valid search criteria provided'))
            }
            params = [criteria];
            logger.debug('running query:', { query, params })
            connection.query(query, params, (err, results) => {
                if (err) {
                    logger.error('Error finding record:', err.stack);
                    return reject(err);
                }
                logger.info('results: ', { results })
                if (results.length === 0) {
                    resolve(null);
                } else {
                    firstResult = results[0];
                    resolve(new Device(firstResult.mac, firstResult.name, firstResult.current_ip))
                }
            });
        });

    });
}

const search = ({ searchTerm, type }) => {
    logger.info('searching for device:', { searchTerm, type })
    return new Promise((resolve, reject) => {
        useConnection((connection) => {
            let query;
            if (type) {
                query = `SELECT * FROM devices WHERE AND type = ?`;
                params = [type];
            } else if (searchTerm) {
                query = `SELECT * FROM devices WHERE mac LIKE ? OR name LIKE ? OR current_ip LIKE ?`;
                params = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`];
            } else {
                reject(new Error('No valid search criteria provided'));
            }
            logger.debug('running query:', { query, params })
            connection.query(query  , params, (err, results) => {
                if (err) {
                    logger.error('Error searching for devices:', err.stack);
                    return reject(err);
                }
                resolve(results);
            });
        });

    });
}

const generateDeviceName = (device) => {
    const allDevices = list();
    const takenNames = allDevices.map(device => device.name).filter(name => name.startsWith(device.type));
    let name = `${device.type}1`;
    let i = 1;
    while (takenNames.includes(name)) {
        i++;
        name = `${device.type}${i}`;
    }
    return name;
}

const list = () => {
    logger.info('listing devices')
    return new Promise((resolve, reject) => {
        useConnection((connection) => {
            query = 'SELECT * FROM devices';
            connection.query(query, (err, results) => {
                if (err) {
                    logger.error('Error retrieving devices:', { error: err.stack });
                    reject(err);
                }
                resolve(results);
            });
        });
    });
}

const create = ({ mac, name, current_ip }) => {
    logger.info('creating device:', { mac, name, current_ip })
    return new Promise((resolve, reject) => {
        useConnection((connection) => {
            const query = 'INSERT INTO devices (mac, name, current_ip) VALUES (?, ?, ?)';
            logger.debug('running query:', { query, mac, name, current_ip })
            connection.query(query, [mac, name, current_ip], (err, results) => {
                if (err) {
                    logger.error('Error creating device:', err.stack);
                    reject(err);
                }
                logger.info('results:', results);
                resolve(results);
            });
        });
    });
}

const update = (strip) => {
    logger.info('updating device:', { strip })
    return new Promise((resolve, reject) => {
        useConnection((connection) => {
            const query = 'UPDATE devices SET name = ?, current_ip = ? WHERE mac = ?';
            logger.debug('running query:', { query, strip })
            connection.query(query, [strip.name, strip.current_ip, strip.mac], (err, results) => {
                if (err) {
                    logger.error('Error updating the device:', { error: err.stack });
                    reject(err);
                }
                logger.info('results:', { results });
                resolve(results);
            });
        });
    });
}

const destroy = (mac) => {
    logger.info('deleting device:', { mac })
    return new Promise((resolve, reject) => {
        useConnection((connection) => {
            query = 'DELETE FROM devices WHERE mac = ?';
            logger.debug('running query:', { query, mac })
            connection.query(query, [mac], (err, results) => {
                if (err) {
                    logger.error('Error deleting device:', err.stack);
                    reject(err);
                }
                logger.info('results:', { results });
                resolve(results);
            });
        });
    });
}

module.exports = {
    Device,
    find,
    search,
    list,
    generateDeviceName,
    create,
    update,
    delete: destroy, 
}