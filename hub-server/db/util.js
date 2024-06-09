require('dotenv').config();
const mysql = require('mysql2');

const connectionObj = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  }

const useConnection = async (callback) => {
    const connection = mysql.createConnection(connectionObj);

    connection.connect((err) => {
      if (err) {
        console.error('Error connecting to the database:', err.stack);
        return;
      }
      console.log('Connected to the database as id ' + connection.threadId);
    });
    try {
        results = await callback(connection)
        connection.end();
        return results
    } catch (error) {
        console.error('Error using the connection:', error.stack);
        connection.end();
    }
}

module.exports = {
    connectionObj,
    useConnection
}

