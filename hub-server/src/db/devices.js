const { useConnection, QueryBuilder, findSql } = require('./util');
const getLogger = require('../logging');
const LedStripInterface = require('../ledStrip');
const logger = getLogger('db/devices', 'debug');
const fs = require('fs/promises');

class Device {
    constructor({ mac, name, type, current_ip, on, brightness, red, green, blue, connected }) {
        this.mac = mac;
        this.type = type;
        this.name = name;
        this.current_ip = current_ip;
        this.on = on;
        this.brightness = brightness;
        this.color = [red, green, blue];
        this.interface = new LedStripInterface({ name, mac, ip: current_ip });
        this.connected = connected || false;
    }

    get state() {
        return {
            brightness: this.brightness,
            color: this.color,
            on: this.on
        }
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

    update({ color, brightness, state, connected }) {
        if (color) this.color = color;
        if (brightness) this.brightness = brightness;
        if (state) {
            if (typeof state == Boolean) {
                this.on = state;
            } else this.on = state === 'on';
        }
        if (connected) this.connected = connected;
    }

    async refreshState() {
        const newState = await this.interface.getState();
        this.update(newState);
    }

    async write(newState) {
        console.log('new state:', newState);
        const { color, on, brightness } = newState;
        const onStatus = on ? 'on' : 'off';
        const writeData = { color, state: onStatus, brightness };
        console.log('writeData: ', writeData);
        const data = await this.interface.set(writeData);
        console.log('data: ', data);
        this.update(data);
    }
}

// const devicesQueryBuilder = QueryBuilder('devices');

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

const generateDeviceName = (device) => {
    return list().then((allDevices => {
        const takenNames = allDevices.map(device => device.name).filter(name => name.startsWith(device.type));
        let name = `${device.type}1`;
        let i = 1;
        while (takenNames.includes(name)) {
            i++;
            name = `${device.type}${i}`;
        }
        return name;
    }))
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
                const devices = results.map(result => new Device(result));
                logger.debug('found devices', { devices });
                resolve(devices);
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
const update = async (device) => {
    logger.info('updating device:', { strip: device })
    console.log('device:', { device });
    const query = await findSql('update/devices.sql');
    console.log('query', query);
    const params = [
        device.name,
        device.current_ip,
        device.on,
        device.brightness,
        device.color[0],
        device.color[1],
        device.color[2],
        device.connected,
        device.mac
    ];
    console.log('params', params);
    return new Promise((resolve, reject) => {
        useConnection((connection) => {
            logger.debug('running query:', { query, strip: device, params })
            connection.query(query, params, (err, results) => {
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
    list,
    generateDeviceName,
    create,
    update,
    delete: destroy,
}
