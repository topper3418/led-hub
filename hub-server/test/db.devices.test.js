const db = require('../db'); 

const tablesExist = () => {
    const devicesExists = db.tableExists('devices');
    const handshakesExists = db.tableExists('handshakes');
    return devicesExists && handshakesExists;
}

const crudDevices = async () => {
    // create test devices
    const dev1 = new db.Device('testMac1', 'fakeName1', 'testIP1');
    const dev2 = new db.Device('testMac2', 'fakeName2', 'testIP2');
    const dev3 = new db.Device('testMac3', 'fakeName3', 'testIP3');
    const dev4 = new db.Device('testMac4', 'fakeName4', 'testIP4');

    // insert into db
    await db.devices.create(dev1);
    console.log('inserted device 1');
    await db.devices.create(dev2);
    console.log('inserted device 2');
    await db.devices.create(dev3);
    console.log('inserted device 3');
    await db.devices.create(dev4);
    console.log('inserted device 4');
    
    // read back from db
    const checkdev1 = await db.devices.find({mac: dev1.mac});
    console.log({mac: checkdev1.mac, name: checkdev1.name, ip: checkdev1.current_ip})
    console.log(typeof checkdev1)
    const checkdev2 = await db.devices.find({mac: dev2.mac});
    const checkdev3 = await db.devices.find({mac: dev3.mac});
    const checkdev4 = await db.devices.find({mac: dev4.mac});

    // check for equality
    if (dev1.isEqual(checkdev1)) console.log('device 1 inserted successfully');
    else console.error('device 1 not inserted correctly');
    if (dev2.isEqual(checkdev2)) console.log('device 2 inserted successfully');
    else console.error('device 2 not inserted correctly');
    if (dev3.isEqual(checkdev3)) console.log('device 3 inserted successfully');
    else console.error('device 3 not inserted correctly');
    if (dev4.isEqual(checkdev4)) console.log('device 4 inserted successfully');
    else console.error('device 4 not inserted correctly');

    // update devices
    checkdev1.name = 'newName';
    checkdev2.current_ip = 'newIP';
    await db.devices.update(checkdev1);
    await db.devices.update(checkdev2);

    // check for equality
    console.log({mac1: checkdev1.mac, mac2: checkdev2.mac})
    const checkdev1Updated = await db.devices.find({mac: checkdev1.mac});
    const checkdev2Updated = await db.devices.find({mac: checkdev2.mac});
    if (checkdev1.isEqual(checkdev1Updated)) console.log('device 1 updated successfully');
    else console.error('device 1 not updated correctly');
    if (checkdev2.isEqual(checkdev2Updated)) console.log('device 2 updated successfully');
    else console.error('device 2 not updated correctly');

    // delete devices
    await db.devices.delete(checkdev3.mac);
    await db.devices.delete(checkdev4.mac);

    // verify deletion
    const checkdev3Deleted = db.devices.find({mac: checkdev3.mac});
    const checkdev4Deleted = db.devices.find({mac: checkdev4.mac});
    if (!checkdev3Deleted) console.log('device 3 deleted successfully');
    else console.error('device 3 not deleted correctly');
    if (!checkdev4Deleted) console.log('device 4 deleted successfully');
    else console.error('device 4 not deleted correctly');
}

module.exports = {
    tablesExist,
    crudDevices
}