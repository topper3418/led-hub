const { useConnection } = require('./util');

class HandShake {
    constructor(id, timestamp, mac, ip, type) {
        this.id = id;
        this.timestamp = timestamp;
        this.mac = mac;
        this.ip = ip;
        this.type = type;
    }
}

const search = async ({id, mac, ip, type, startTime, endTime, limit=50, offset, orderBy}) => {
    let query = 'SELECT * FROM handshakes';
    if (offset) {
        query += ' OFFSET :offset';
    }
    const wheres = [];
    if (id) {
        wheres.push('id = :id');
    }
    if (mac) {
        wheres.push('mac =:mac');
    }
    if (ip) {
        wheres.push('ip = :ip');
    }
    if (type) {
        wheres.push('type = :type');
    }
    if (startTime) {
        wheres.push('timestamp >= :startTime');
    }
    if (endTime) {
        wheres.push('timestamp <= :endTime');
    }
    if (wheres.length !== 0) {
        query += ' WHERE ' + wheres.join(' AND ');
    }
    if (orderBy) {
        query += ' ORDER BY ' + orderBy;
    }
    query += ' LIMIT :limit';
    return await useConnection((connection) => {
        const params = {id, mac, ip, type, startTime, endTime, limit};
        connection.query(query, params, (err, results) => {
            if (err) {
                console.error('Error querying the database:', err.stack);
                return;
            }
            console.log('results:', results);
            return results;
        });
    });
}

const create = async (mac, ip, type) => {
    return await useConnection((connection) => {
        query = 'INSERT INTO handshakes (mac, ip, type) VALUES (?, ?, ?)';
        connection.query(query, [mac, ip, type], (err, results) => {
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
    HandShake,
    search,
    create
}