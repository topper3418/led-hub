const { useConnection } = require("./util");

class Logger {
    constructor({ id, name, level, console }) {
        this.id = id;
        this.name = name;
        this.level = level;
        levelNumber = ["trace", "debug", "info", "warn", "error", "critical"].indexOf(level);
        this.console = console;
    }

    writeLog = ({ message, data }) => {
        return new Promise((resolve, reject) => {
            useConnection((connection) => {
                let query =
                    "INSERT INTO logs (logger_id, message, data) VALUES (?, ?, ?)";
                connection.query(
                    query,
                    [this.id, message, data],
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
        writeLog({ logger: this, message, data });
    }

    debug(message, data) {
        if (this.levelNumber > 1) return;
        writeLog({ logger: this, message, data });
    }

    info(message, data) {
        if (this.levelNumber > 2) return;
        writeLog({ logger: this, message, data });
    }

    warn(message, data) {
        if (this.levelNumber > 3) return;
        writeLog({ logger: this, message, data });
    }

    error(message, data) {
        if (this.levelNumber > 4) return;
        writeLog({ logger: this, message, data });
    }

    critical(message, data) {
        if (this.levelNumber > 5) return;
        writeLog({ logger: this, message, data });
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

const getLogger = ({ name }) => {
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
