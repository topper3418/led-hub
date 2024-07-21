const { refreshDevices } = require('./controller');
const Scheduler = require('./scheduler');

const scheduler = new Scheduler();

scheduler.addJob('*/10 * * * * *', refreshDevices);


module.exports = scheduler;

