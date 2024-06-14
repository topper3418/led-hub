const { createLogger, format, transports } = require('winston');
const Transport = require('winston-transport');
const mysql = require('mysql2/promise');
const path = require('path');

class MySQLTransport extends Transport {
  constructor(opts) {
    super(opts);
    this.connection = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: 'Monday12',
      database: 'test'
    });
    this.loggerName = opts.loggerName || 'default';
  }

  async log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    const { level, message, ...meta } = info;
    const query = `INSERT INTO logs (logger, level, message, meta, timestamp) VALUES (?, ?, ?, ?, ?)`;
    const timestamp = new Date();

    try {
      await this.connection.execute(query, [this.loggerName, level, message, JSON.stringify(meta), timestamp]);
    } catch (error) {
      console.error('Failed to log to MySQL:', error);
    }

    callback();
  }
}

const getLogger = (loggerName, level='info') => {
  return createLogger({
    level: level,
    format: format.combine(
      format.label({ label: path.basename(__filename) }),
      format.timestamp(),
      format.printf(({ timestamp, level, message, label }) => {
        return `${timestamp} [${loggerName}] ${level}: ${message}`;
      }),
      format.json()
    ),
    transports: [
      new MySQLTransport({ loggerName }),
      new transports.Console()
    ]
  });
};

const logger = getLogger('test-logging.js');

logger.info('Hello, this is a logging message!', { meta: 'data' });
logger.warn('Warning: this is a warning message!');
logger.error('Error: this is an error message!');
logger.debug('Debug: this is a debug message!');

module.exports = getLogger;
