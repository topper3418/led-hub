const { useConnection } = require('./util');

class Device {
    constructor(mac, name, current_ip) {
        this.mac = mac;
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
            name: this.name,
            current_ip: this.current_ip
        }
    }
}

const find = ({ mac, name, ip }) => {
    console.log('finding device:', mac, name, ip)
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
            console.log('query:', query)
            console.log('criteria:', criteria)
            connection.query(query, [criteria], (err, results) => {
                if (err) {
                    console.error('Error finding record:', err.stack);
                    return reject(err);
                }
                console.log('results: ', results)
                if (results.length === 0) {
                    resolve(null);
                } else {
                    firstResult = results[0];
                    console.log('result:', firstResult);
                    resolve(new Device(firstResult.mac, firstResult.name, firstResult.current_ip))
                }
            });
        });

    });
}

const list = () => {
    return new Promise((resolve, reject) => {
        useConnection((connection) => {
            query = 'SELECT * FROM devices';
            connection.query(query, (err, results) => {
                if (err) {
                    console.error('Error retrieving devices:', err.stack);
                    reject(err);
                }
                resolve(results);
            });
        });
    });
}

const create = ({ mac, name, current_ip }) => {
    console.log('creating device:', mac, name, current_ip)
    return new Promise((resolve, reject) => {
        useConnection((connection) => {
            query = 'INSERT INTO devices (mac, name, current_ip) VALUES (?, ?, ?)';
            connection.query(query, [mac, name, current_ip], (err, results) => {
                if (err) {
                    console.error('Error creating device:', err.stack);
                    reject(err);
                }
                console.log('results:', results);
                resolve(results);
            });
        });
    });
}

const update = (strip) => {
    return new Promise((resolve, reject) => {
        useConnection((connection) => {
            query = 'UPDATE devices SET name = ?, current_ip = ? WHERE mac = ?';
            connection.query(query, [strip.name, strip.current_ip, strip.mac], (err, results) => {
                if (err) {
                    console.error('Error updating the device:', err.stack);
                    reject(err);
                }
                console.log('results:', results);
                resolve(results);
            });
        });
    });
}

const destroy = (mac) => {
    return new Promise((resolve, reject) => {
        useConnection((connection) => {
            query = 'DELETE FROM devices WHERE mac = ?';
            connection.query(query, [mac], (err, results) => {
                if (err) {
                    console.error('Error deleting device:', err.stack);
                    reject(err);
                }
                console.log('results:', results);
                resolve(results);
            });
        });
    });
}

module.exports = {
    Device,
    find,
    list,
    create,
    update,
    delete: destroy
}