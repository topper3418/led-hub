// deprecate this. I will create a custom docker image built on the mysql image. 

const { useConnection, findSql, tableExists } = require('./util');
const fs = require('fs/promises');
const path = require('path');
// const getLogger = require('../logging');

// const logger = getLogger('db/init', 'debug');

// const tableExists = (tableName) => {
//     results = useConnection(connection => {
//         connection.query('SHOW TABLES LIKE ?', [tableName], (err, results) => {
//             if (err) {
//                 console.error('Error querying the database:', err.stack);
//                 throw err;
//             }
//             console.log(`results looking for ${tableName} table:`, results);
//             return results.length > 0;
//         });
//     });
//     return results;
// };
// const findSql = async (sqlPath) => {
//     const filePath = path.resolve(__dirname, 'sql', sqlPath);
//     try {
//       await fs.access(filePath);
//       return filePath;
//     } catch (err) {
//       return undefined;
//     }
//   };
//
const createDevicesTable = async () => {
    // const sqlPath = await findSql('create/devices-table.sql');
    //
    // if (!sqlPath) {
    //     logger.error('sql file does not exist: create-devices-table.sql');
    //     return;
    // }
    const sql = await findSql('create/devices-table.sql');
    console.log('ensuring devices table', { sql });
    // logger.debug('ensuring devices table', { sql });
    results = useConnection(connection => {
        connection.query(sql, (err, results) => {
            if (err) {
                // logger.error('Error creating devices table', { error: err.stack });
                return;
            }
            // logger.info('devices table ensured');
            return results;
        });
    });
}

const createHandshakesTable = async () => {
    // const sqlPath = await findSql('create/handshakes-table.sql');
    //
    // if (!sqlPath) {
    //     logger.error('sql file does not exist: create-handshakes-table.sql');
    //     return;
    // }
    const sql = await findSql('create/handshakes-table.sql');
    // logger.debug('ensuring handshake table', { sql })
    results = useConnection((connection) => {
        connection.query(sql, (err, results) => {
            if (err) {
                // logger.error('Error creating handshakes table', { error: err.stack });
                return;
            }
            // logger.info('handshakes table ensured');
            return results;
        });
    });
}

const createLoggingTable = async () => {
    // const sqlPath = await findSql('create/logging-table.sql');
    //
    // if (!sqlPath) {
    //     logger.error('sql file does not exist: create-logging-tables.sql');
    //     return;
    // };
    const sql = await findSql('create/logging-table.sql');
    // logger.debug('ensuring logging tables', { sql })
    results = useConnection((connection) => {
        connection.query(sql, (err, results) => {
            if (err) {
                console.error('Error creating logging tables:', err.stack);
                return;
            }
            // logger.info('logging tables ensured');
            return results;
        });
    });
}


module.exports = {
    createDevicesTable,
    createHandshakesTable,
    createLoggingTable,
}
