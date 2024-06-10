const { setupDatabase, teardownDatabase } = require('./test/dbContext');
const {
    tablesExist,
    crudDevices
    } = require('./test/db.devices.test');
    
// test the setup and teardown
const testSetupTearDown = async () => {
    await setupDatabase();
    await teardownDatabase();
}

// test the crud operations
const testCrud = async () => {
    await setupDatabase();
    await tablesExist();
    await crudDevices();
    await teardownDatabase();
}

testSetupTearDown();
testCrud();