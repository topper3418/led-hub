const axios = require('axios');

const LOGGING_SERVICE_ENDPOINT = process.env.LOGGING_SERVICE_ENDPOINT || 'http://localhost:8080/logs';

function getLogger(loggerName) {
  const log = async (level, message, meta = {}, print = false) => {
    try {
      await axios.post(LOGGING_SERVICE_ENDPOINT, {
        logger: `server/${loggerName}`,
        level,
        message,
        meta
      });
      if (print) {
        const fmtMessage = `${loggerName} - ${level.toUpperCase()} - ${message}`;
        const printPackage = Object.keys(meta).length !== 0 ? [fmtMessage, meta] : [fmtMessage];
        console.log(...printPackage);
      }
    } catch (error) {
      console.error('Failed to send log:', error);
    }
  };

  return {
    debug: (message, meta) => log('debug', message, meta),
    debugp: (message, meta) => log('debug', message, meta, print=true),
    info: (message, meta) => log('info', message, meta),
    infop: (message, meta) => log('info', message, meta, print=true),
    warn: (message, meta) => log('warn', message, meta),
    warnp: (message, meta) => log('warn', message, meta, print=true),
    error: (message, meta) => log('error', message, meta),
    errorp: (message, meta) => log('error', message, meta, print=true),
  };
}

module.exports = { getLogger };
