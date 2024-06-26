const { useConnection } = require('./util');
const getLogger = require('../logging');
const LedStripInterface = require('../ledStrip');
const logger = getLogger('db/devices', 'debug');

class Device {
    constructor({ mac, name, type, current_ip, on, brightness, red, green, blue }) {
        this.mac = mac;
        this.type = type;
        this.name = name;
        this.current_ip = current_ip;
        this.on = on;
        this.brightness = brightness;
        this.color = [red, green, blue]
        this.interface = LedStripInterface({ name, mac, ip: current_ip });
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
            return false
        }
        return true;
    }

    toJSON() {
        return {
            mac: this.mac,
            type: this.type,
            name: this.name,
            current_ip: this.current_ip,
            state: {
                on: this.on,
                brightness: this.brightness,
                color: this.color
            }
        }
    }

    update({ color, brightness, state }) {
        this.color = color;
        this.brightness = brightness;
        this.on = state === 'on';
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
                return reject(new Error('No valid search criteria provided'))
            }
            params = [criteria];
            logger.debug('running query:', { query, params })
            connection.query(query, params, (err, results) => {
                if (err) {
                    logger.error('Error finding device:', { error: err.stack });
                    return reject(err);
                }
                if (results.length === 0) {
                    resolve(null);
                    logger.info('no results found')
                } else {
                    firstResult = results[0];
                    logger.info('results: ', { firstResult })
                    resolve(new Device(firstResult))
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
            connection.query(query, params, (err, results) => {
                if (err) {
                    logger.error('Error searching for devices:', { error: err.stack });
                    return reject(err);
                }
                resolve(results.map(result => new Device(result));
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
            let query = 'SELECT * FROM devices';
            connection.query(query, (err, results) => {
                if (err) {
                    logger.error('Error retrieving devices:', { error: err.stack });
                    reject(err);
                }
                resolve(results.map(result => new Device(result)));
            });
        });
    });
}

const create = ({ mac, name, current_ip }) => {
    logger.info('creating device:', { mac, name, current_ip })
    return new Promise((resolve, reject) => {
        if (!name) {
            name = generateDeviceName({ type: 'device' });
        }
        useConnection((connection) => {
            const query = 'INSERT INTO devices (mac, name, current_ip) VALUES (?, ?, ?)';
            logger.debug('running query:', { query, mac, name, current_ip })
            connection.query(query, [mac, name, current_ip], (err, results) => {
                if (err) {
                    logger.error('Error creating device:', { error: err.stack });
                    reject(err);
                }
                logger.info('results', { results });
                resolve(results);
            });
        });
    });
}

// TODO make the update actually capable of updating all things. or at least give the 
//      other stuff its own update function. then we can update the history separetly. 
const update = (device) => {
    logger.info('updating device:', { strip: device })
    return new Promise((resolve, reject) => {
        useConnection((connection) => {
            const query = 'UPDATE devices SET name = ?, current_ip = ? WHERE mac = ?';
            logger.debug('running query:', { query, strip: device })
            connection.query(query, [device.name, device.current_ip, device.mac], (err, results) => {
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
            let query = 'DELETE FROM devices WHERE mac = ?';
            logger.debug('running query:', { query, mac })
            connection.query(query, [mac], (err, results) => {
                if (err) {
                    logger.error('Error deleting device', { error: err.stack });
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
