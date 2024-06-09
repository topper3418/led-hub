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

const createDevicesTable = async () => {
    const tableName = 'devices';
    if (await tableExists(tableName)) {
        console.log('Devices table already exists');
        return;
    }
    console.log(__dirname)
    const sqlPath = path.resolve(__dirname, 'sql', 'create-devices-table.sql');
    const fileExists = async (filePath) => {
        try {
          await fs.access(filePath);
          return true;
        } catch (err) {
          return false;
        }
      };
    if (!await fileExists(sqlPath)) {
        console.error('sql file does not exist:', sqlPath);
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


module.exports = {
    tableExists,
    createDevicesTable
}