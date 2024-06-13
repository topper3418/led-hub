const { useConnection } = require('./util');

class HandShake {
    constructor(id, timestamp, mac, ip, type) {
        this.id = id;
        this.timestamp = timestamp;
        this.mac = mac;
        this.ip = ip;
    }
}

const create = (mac, ip) => {
    return new Promise((resolve, reject) => {
        useConnection((connection) => {
            query = 'INSERT INTO handshakes (mac, ip) VALUES (?, ?)';
            connection.query(query, [mac, ip], (err, results) => {
                if (err) {
                    console.error('Error querying the database:', err.stack);
                    reject(err);
                }
                console.log('results:', results);
                resolve(results);
            });
        });

    })
}

module.exports = {
    HandShake,
    create
}