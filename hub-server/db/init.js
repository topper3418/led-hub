const { useConnection } = require('./util');
const fs = require('fs/promises');
const path = require('path');


const tableExists = async (tableName) => {
    results = await useConnection(connection => {
        connection.query('SHOW TABLES LIKE ?', [tableName], (err, results) => {
            if (err) {
                console.error('Error querying the database:', err.stack);
                return;
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
    const tableName = 'devices';
    if (await tableExists(tableName)) {
        console.log('Devices table already exists');
        return;
    }
    const sqlPath = await findSql('create-devices-table.sql');

    if (!sqlPath) {
        console.error('sql file does not exist: create-devices-table.sql');
        return;
    } else console.log('sql file exists:', sqlPath);
    const sql = await fs.readFile(sqlPath, 'utf8');
    console.log('running sql:', sql)
    results = useConnection(connection => {
        connection.query(sql, (err, results) => {
            if (err) {
                console.error('Error creating devices table:', err.stack);
                return;
            }
            console.log('results:', results);
            return results;
        });
    });
}

const createHandshakesTable = async () => {
    const tableName = 'handshakes';
    if (await tableExists(tableName)) {
        console.log('Handshakes table already exists');
        return;
    }
    const sqlPath = await findSql('create-handshakes-table.sql');

    if (!sqlPath) {
        console.error('sql file does not exist: create-handshakes-table.sql');
        return;
    } else console.log('sql file exists:', sqlPath);
    const sql = await fs.readFile(sqlPath, 'utf8');
    console.log('running sql:', sql)
    results = useConnection(connection => {
        connection.query(sql, (err, results) => {
            if (err) {
                console.error('Error creating handshakes table:', err.stack);
                return;
            }
            console.log('results:', results);
            return results;
        });
    });
}


module.exports = {
    tableExists,
    createDevicesTable,
    createHandshakesTable
}