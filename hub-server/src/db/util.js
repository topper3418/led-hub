require('dotenv').config();
const mysql = require('mysql2');

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


module.exports = {
    connectionObj,
    useConnection
}

