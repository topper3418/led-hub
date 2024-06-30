require('dotenv').config();
const mysql = require('mysql2');
const path = require('path');
const fs = require('fs/promises');

const connectionObj = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
}

const useConnection = (callback) => {
    const connection = mysql.createConnection(connectionObj);

    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to the database:', err.stack);
            return;
        }
        console.log('Connected to the database as id ' + connection.threadId);
    });
    try {
        results = callback(connection)
        connection.end();
        return results
    } catch (error) {
        console.error('Error using the connection:', error.stack);
        connection.end();
        throw error;
    }
}

const findSql = async (sqlPath) => {
    const filePath = path.resolve(__dirname, 'sql', sqlPath);
    console.log('found filepath', filePath)
    try {
        return await fs.readFile(filePath, 'utf8');
    } catch (err) {
        return undefined;
    }
};

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



class QueryBuilder {
    constructor(tableName) {
        this.tableName = tableName;
    }

    insert(data) {
        const columns = Object.keys(data).join(", ");
        const values = Object.values(data).map(value =>
            typeof value === 'string' ? `'${value}'` : value
        ).join(", ");
        const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${values});`;
        return query;
    }

    update(id, data) {
        const setClause = Object.entries(data).map(([key, value]) =>
            `${key} = ${typeof value === 'string' ? `'${value}'` : value}`
        ).join(", ");

        let whereClause;
        if (typeof id === 'object') {
            whereClause = Object.entries(id).map(([key, value]) =>
                `${key} = ${typeof value === 'string' ? `'${value}'` : value}`
            ).join(" AND ");
        } else {
            whereClause = `id = ${typeof id === 'string' ? `'${id}'` : id}`;
        }

        const query = `UPDATE ${this.tableName} SET ${setClause} WHERE ${whereClause};`;
        return query;
    }


    select(columns) {
        const columnList = Array.isArray(columns) ? columns.join(", ") : columns;
        const query = `SELECT ${columnList} FROM ${this.tableName};`;
        return query;
    }
}

module.exports = {
    connectionObj,
    useConnection,
    findSql,
    tableExists,
    QueryBuilder,
}

