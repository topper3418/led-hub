const { tableExists, createDevicesTable, createHandshakesTable } = require('./init');
const { useConnection, connectionObj } = require('./util');
const {
    Strip,
    ...stripApi  // so I can pass the 'delete' method safely
} = require('./strips');
const {
    HandShake,
    ...handshakeApi
} = require('./handshakes');

module.exports = {
    init: () => {
        createDevicesTable();
        createHandshakesTable();
    },
    tableExists,
    connectionObj,
    useConnection,
    Strip,
    strips: stripApi,
    HandShake,
    handshakes: handshakeApi
}