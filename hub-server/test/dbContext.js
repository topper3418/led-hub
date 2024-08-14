const { useConnection, init } = require('../db');

const setupDatabase = () => {
    process.env.DB_NAME = 'test';
    useConnection((connection) => {
        connection.query('DROP DATABASE IF EXISTS test');
        connection.query('CREATE DATABASE test');
    });
    init();
};

const teardownDatabase = async () => {
    useConnection((connection) => {
        //connection.query('DROP DATABASE test');
    });
};

module.exports = { setupDatabase, teardownDatabase };
