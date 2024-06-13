const { useConnection } = require("./util");

class Logger {
    constructor({ id, name, level, printtoconsole }) {
        this.id = id;
        this.name = name;
        this.level = level;
        this.levelNumber = ["trace", "debug", "info", "warn", "error", "critical"].indexOf(level);
        this.printtoconsole = printtoconsole;
    }

    writeLog = ({ level, message, data }) => {
        if (this.printtoconsole) console.log(level, ' - ', message, data);
        return new Promise((resolve, reject) => {
            useConnection((connection) => {
                let query =
                    "INSERT INTO logs (logger_id, level, message, data) VALUES (?, ?, ?, ?)";
                connection.query(
                    query,
                    [this.id, level, message, data],
                    (err, results) => {
                        if (err) {
                            console.error("Error writing log:", err.stack);
                            return reject(err);
                        }
                        resolve(results);
                    }
                );
            });
        });
    };

    trace(message, data) {
        if (this.levelNumber > 0) return;
        writeLog({ level: 'INFO', message, data });
    }

    debug(message, data) {
        if (this.levelNumber > 1) return;
        writeLog({ level: 'DEBUG', message, data });
    }

    info(message, data) {
        if (this.levelNumber > 2) return;
        writeLog({ level: 'INFO', message, data });
    }

    warn(message, data) {
        if (this.levelNumber > 3) return;
        writeLog({ level: 'WARN', message, data });
    }

    error(message, data) {
        if (this.levelNumber > 4) return;
        writeLog({ level: 'ERROR', message, data });
    }

    critical(message, data) {
        if (this.levelNumber > 5) return;
        writeLog({ level: 'CRITICAL', message, data });
    }

    setLevel(level) {
        this.level = level;
        this.levelNumber = ["trace", "debug", "info", "warn", "error", "critical"].indexOf(level);
        return new Promise((resolve, reject) => {
            useConnection((connection) => {
                let query = "UPDATE loggers SET level = ? WHERE id = ?";
                connection.query(query, [level, this.id], (err, results) => {
                    if (err) {
                        console.error("Error setting level:", err.stack);
                        return reject(err);
                    }
                    resolve(results);
                });
            });
        });
    }
}


const findLogger = ({ name }) => {
    return new Promise((resolve, reject) => {
        useConnection((connection) => {
            let query = "SELECT * FROM loggers WHERE name = ?";
            connection.query(query, [name], (err, results) => {
                if (err) {
                    console.error("Error finding record:", err.stack);
                    return reject(err);
                }
                if (results.length > 0) {
                    resolve(new Logger(results[0]));
                } else {
                    resolve(null);
                }
            });
        });
    });
};

const createLogger = ({ name, level, printtoconsole }) => {
    return new Promise((resolve, reject) => {
        useConnection((connection) => {
            let query = "INSERT INTO loggers (name, level, printtoconsole) VALUES (?, ?, ?)";
            connection.query(query, [name, level, printtoconsole], (err, results) => {
                if (err) {
                    console.error("Error creating logger:", err.stack);
                    return reject(err);
                }
                resolve(results);
            });
        });
    });
};

const getLogger = async (name) => {
    let logger = await findLogger({ name });
    if (!logger) {
        await createLogger({ name, level: "info", printtoconsole: true });
        logger = await findLogger({ name });
    }
    return logger;
};

module.exports = getLogger;