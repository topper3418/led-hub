// logger.js
const { useConnection } = require('./db/util');

// You can customize or extend these levels
const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

class MyLogger {
  constructor({ loggerName = 'default', level = 'info', consoleEnabled = true }) {
    this.loggerName = loggerName;
    this.level = level;
    this.consoleEnabled = consoleEnabled;
  }

  // Utility to check if the current level is loggable
  shouldLog(level) {
    return LEVELS[level] <= LEVELS[this.level];
  }

  async log(level, message, meta = {}) {
    if (!this.shouldLog(level)) return;

    // Print to console if enabled
    if (this.consoleEnabled) {
      console.log(`[${new Date().toISOString()}][${this.loggerName}][${level}] ${message}`, meta);
    }

    // Write to DB asynchronously using useConnection
    try {
      useConnection((connection) => {
        const query = `
          INSERT INTO logs (logger, level, message, meta, timestamp)
          VALUES (?, ?, ?, ?, ?)
        `;
        connection.query(query, [
          this.loggerName,
          level,
          message,
          JSON.stringify(meta),
          new Date(),
        ]);
      });
    } catch (error) {
      // If logging fails, you might want to handle it or ignore it
      console.error('Failed to log to DB:', error);
    }
  }

  debug(message, meta = {}) {
    return this.log('debug', message, meta);
  }

  info(message, meta = {}) {
    return this.log('info', message, meta);
  }

  warn(message, meta = {}) {
    return this.log('warn', message, meta);
  }

  error(message, meta = {}) {
    return this.log('error', message, meta);
  }
}

// Keep a cache of loggers so we don’t recreate them unnecessarily
const loggerCache = {};

/**
 * Get a logger instance by name. If it doesn’t exist, it is created.
 *
 * @param {string} loggerName - Name of the logger (e.g. 'authLogger')
 * @param {string} level - Log level (e.g. 'info', 'warn', 'error', 'debug')
 * @param {boolean} consoleEnabled - Whether to log to the console
 */
function getLogger(loggerName = 'default', level = 'info', consoleEnabled = true) {
  const cacheKey = `${loggerName}-${level}-${consoleEnabled}`;
  if (!loggerCache[cacheKey]) {
    loggerCache[cacheKey] = new MyLogger({ loggerName, level, consoleEnabled });
  }
  return loggerCache[cacheKey];
}

module.exports = getLogger;
