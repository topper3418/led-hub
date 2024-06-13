// deprecate this. I will create a custom docker image built on the mysql image. 

const { useConnection } = require('./util');
const fs = require('fs/promises');
const path = require('path');


const tableExists = (tableName) => {
    results = useConnection(connection => {
        connection.query('SHOW TABLES LIKE ?', [tableName], (err, results) => {
            if (err) {
                console.error('Error querying the database:', err.stack);
                throw err;
            }
            console.log(`results looking for ${tableName} table:`, results);
            return results.length > 0;
        });
    });
    return results;
};

const findSql = async (sqlPath) => {
    const filePath = path.resolve(__dirname, 'sql', sqlPath);
    try {
      await fs.access(filePath);
      return filePath;
    } catch (err) {
      return undefined;
    }
  };

const createDevicesTable = async () => {
    const sqlPath = await findSql('create-devices-table.sql');

    if (!sqlPath) {
        console.error('sql file does not exist: create-devices-table.sql');
        return;
    } else console.log('sql file exists:', sqlPath);
    const sql = await fs.readFile(sqlPath, 'utf8');
    console.log('ensuring devices table')
    results = useConnection(connection => {
        connection.query(sql, (err, results) => {
            if (err) {
                console.error('Error creating devices table:', err.stack);
                return;
            }
            return results;
        });
    });
}

const createHandshakesTable = async () => {
    const sqlPath = await findSql('create-handshakes-table.sql');

    if (!sqlPath) {
        console.error('sql file does not exist: create-handshakes-table.sql');
        return;
    } else console.log('sql file exists:', sqlPath);
    const sql = await fs.readFile(sqlPath, 'utf8');
    console.log('ensuring handshake table')
    results = useConnection((connection) => {
        connection.query(sql, (err, results) => {
            if (err) {
                console.error('Error creating handshakes table:', err.stack);
                return;
            }
            return results;
        });
    });
}

const createLoggingTables = async () => {
    const sqlPath = await findSql('create-logging-tables.sql');

    if (!sqlPath) {
        console.error('sql file does not exist: create-logging-tables.sql');
        return;
    } else console.log('sql file exists:', sqlPath);
    const sql = await fs.readFile(sqlPath, 'utf8');
    console.log('ensuring logging tables')
    results = useConnection((connection) => {
        connection.query(sql, (err, results) => {
            if (err) {
                console.error('Error creating logging tables:', err.stack);
                return;
            }
            return results;
        });
    });
}


module.exports = {
    tableExists,
    createDevicesTable,
    createHandshakesTable,
    createLoggingTables,
}