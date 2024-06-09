const { tableExists, createDevicesTable } = require('./init');
const { useConnection, connectionObj } = require('./util');

module.exports = {
    init: () => {
        createDevicesTable();
    },
    tableExists,
    connectionObj,
    useConnection
}