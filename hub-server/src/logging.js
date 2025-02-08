const axios = require('axios');

const LOGGING_SERVICE_ENDPOINT = process.env.LOGGING_SERVICE_ENDPOINT || 'http://localhost:8080';

function getLogger(loggerName) {
  const loggerNameAppended = `server/${loggerName}`;
  // ensure the logger exists in the logging service
  axios.post(`${LOGGING_SERVICE_ENDPOINT}/loggers`, { name: loggerNameAppended })
    .catch((error) => console.log('Error creating logger:', error.message));
  // logging function to wrap in logger methods
  const log = async (level, message, meta = {}, print = false) => {
    try {
      await axios.post(`${LOGGING_SERVICE_ENDPOINT}/logs`, {
        logger: `server/${loggerNameAppended}`,
        level,
        message,
        meta
      });
      if (print) {
        const fmtMessage = `${loggerNameAppended} - ${level.toUpperCase()} - ${message}`;
        const printPackage = Object.keys(meta).length !== 0 ? [fmtMessage, meta] : [fmtMessage];
        console.log(...printPackage);
      }
    } catch (error) {
      const fmtMessage = `${loggerNameAppended} - ${level.toUpperCase()} - ${message}`;
      console.error(`Failed to send log: ${error.message}\n${fmtMessage}\n`);
    }
  };

  return {
    debug: (message, meta) => log('debug', message, meta),
    debugp: (message, meta) => log('debug', message, meta, print = true),
    info: (message, meta) => log('info', message, meta),
    infop: (message, meta) => log('info', message, meta, print = true),
    warn: (message, meta) => log('warn', message, meta),
    warnp: (message, meta) => log('warn', message, meta, print = true),
    error: (message, meta) => log('error', message, meta),
    errorp: (message, meta) => log('error', message, meta, print = true),
  };
}

module.exports = { getLogger };
