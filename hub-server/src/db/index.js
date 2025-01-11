const { init, teardown } = require('./scripts')
const { useConnection, connectionObj } = require('./util');
const {
    Device,
    ...deviceApi  // so I can pass the 'delete' method safely
} = require('./devices');
const {
    HandShake,
    ...handshakeApi
} = require('./handshakes');
const getLogger = require('./../logging');

module.exports = {
    init,
    teardown,
    connectionObj,
    useConnection,
    Device,
    devices: deviceApi,
    HandShake,
    handshakes: handshakeApi,
    getLogger,
}
