const axios = require('axios');

const LOGGING_SERVICE_ENDPOINT = process.env.LOGGING_SERVICE_ENDPOINT || 'http://localhost:8080';

function getLogger(loggerName) {
  const log = async (level, message, meta = {}) => {
    try {
      await axios.post(`${LOGGING_SERVICE_ENDPOINT}/logs`, {
        logger: loggerName,
        level,
        message,
        meta
      });
    } catch (error) {
      console.error('Failed to send log:', error);
    }
  };

  return {
    debug: (message, meta) => log('debug', message, meta),
    info: (message, meta) => log('info', message, meta),
    warn: (message, meta) => log('warn', message, meta),
    error: (message, meta) => log('error', message, meta)
  };
}

module.exports = { getLogger };
