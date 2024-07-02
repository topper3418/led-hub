const { useConnection, QueryBuilder, findSql } = require('./util');

class Ping {
    constructor(device, success) {
        this.device_id = device.id;
        this.timestamp = new Date();
        this.success = success;
    }
}

const create = ({ device_id, timestamp, succes }) => {
    return new Promise((resolve, reject) => {
        useConnection((connection) => {
            const query = `INSERT INTO PINGS (device_id, timestamp, success) VALUES (?, ?, ?);`;
            const params = [device_id, timestamp, success];
            connection.query(query, params, (err, results) => {
                if (err) {
                    reject(err);
                }
                resolve(results);
            });
        });
    });
}

const isConnected = (device) => {
    return new Promise((resolve, reject) => {
        useConnection((connection) => {
            const query = `SELECT success FROM pings WHERE device_id = ? order by id desc LIMIT 1`;
            const params = [device.id];
            connection.query(query, params, (err, results) => {
                if (err) {
                    reject(err);
                }
                resolve(results);
            });
        });
    });
}

module.exports = {
    Ping,
    create,
    isConnected,
}
