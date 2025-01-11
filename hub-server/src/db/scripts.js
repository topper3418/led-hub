const { useConnection, findSql } = require('./util');
const getLogger = require('../logging');

const logger = getLogger('db/init', 'debug');


const init = async () => {
    const sql = await findSql('scripts/init.sql');
    console.log("Ensuring DB...")
    results = useConnection((connection) => {
        connection.query(sql, (err, results) => {
            if (err) {
                console.error('Error building DB:', err.stack);
                return;
            }
            logger.info('DB ensured');
            return results;
        });
    }, { multipleStatements: true });
}


const teardown = async () => {
    const sql = await findSql('scripts/teardown.sql');
    console.log('Tearing down DB...')
    results = useConnection((connection) => {
        connection.query(sql, (err, results) => {
            if (err) {
                console.error('Error tering down DB:', err.stack);
                return;
            }
            logger.info('DB torn down');
            return results;
        });
    }, { multipleStatements: true });
}


module.exports = {
    init,
    teardown
}
