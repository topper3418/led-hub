const { useConnection } = require('./util');

class Strip {
    constructor(mac, name, current_ip) {
        this.mac = mac;
        this.name = name;
        this.current_ip = current_ip;
    }
}

const find = async (mac) => {
    return await useConnection((connection) => {
        query = 'SELECT * FROM devices WHERE mac = ?';
        connection.query(query, [mac], (err, results) => {
            if (err) {
                console.error('Error querying the database:', err.stack);
                return;
            }
            if (results.length === 0) {
                return null;
            } else {
                console.log('results:', results);
                return new Strip(...results[0]);
            }
        });
    });
}

const create = async (mac, name, current_ip) => {
    return await useConnection((connection) => {
        query = 'INSERT INTO devices (mac, name, current_ip) VALUES (?, ?, ?)';
        connection.query(query, [mac, name, current_ip], (err, results) => {
            if (err) {
                console.error('Error querying the database:', err.stack);
                return;
            }
            console.log('results:', results);
            return results;
        });
    });
}

const update = async (strip) => {
    return await useConnection((connection) => {
        query = 'UPDATE devices SET name = ?, current_ip = ? WHERE mac = ?';
        connection.query(query, [strip.name, strip.current_ip, strip.mac], (err, results) => {
            if (err) {
                console.error('Error querying the database:', err.stack);
                return;
            }
            console.log('results:', results);
            return results;
        });
    });
}

const deleteStrip = async (mac) => {
    return await useConnection((connection) => {
        query = 'DELETE FROM devices WHERE mac = ?';
        connection.query(query, [mac], (err, results) => {
            if (err) {
                console.error('Error querying the database:', err.stack);
                return;
            }
            console.log('results:', results);
            return results;
        });
    });
}

module.exports = {
    Strip,
    find,
    create,
    update,
    deleteStrip
}