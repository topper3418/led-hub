const { tableExists, createDevicesTable, createHandshakesTable } = require('./init');
const { useConnection, connectionObj } = require('./util');
const {
    Device,
    ...deviceApi  // so I can pass the 'delete' method safely
} = require('./devices');
const {
    HandShake,
    ...handshakeApi
} = require('./handshakes');

module.exports = {
    init: async () => {
        await createDevicesTable();
        await createHandshakesTable();
    },
    tableExists,
    connectionObj,
    useConnection,
    Device,
    devices: deviceApi,
    HandShake,
    handshakes: handshakeApi
}