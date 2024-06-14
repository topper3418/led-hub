const { 
    tableExists, 
    createDevicesTable, 
    createHandshakesTable,
    createLoggingTable
} = require('./init');
const { useConnection, connectionObj } = require('./util');
const {
    Device,
    ...deviceApi  // so I can pass the 'delete' method safely
} = require('./devices');
const {
    HandShake,
    ...handshakeApi
} = require('./handshakes');
//const getLogger = require('./logging');

module.exports = {
    // deprecate init
    init: async () => {
        await createDevicesTable();
        await createHandshakesTable();
        await createLoggingTable();
    },
    tableExists,
    connectionObj,
    useConnection,
    Device,
    devices: deviceApi,
    HandShake,
    handshakes: handshakeApi,
//    getLogger,
}