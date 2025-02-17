import axios from 'axios';
import { LOGGING_SERVICE_ENDPOINT } from './config';

enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export const getLogger = (loggerName: string) => {
  const loggerNameAppended = `webapp/${loggerName}`;
  // ensure the logger exists in the logging service
  axios.post(`${LOGGING_SERVICE_ENDPOINT}/loggers`, { name: loggerNameAppended })
    .catch((error) => console.log('Error creating logger:', error));
  // logging function to wrap in logger methods
  const log = async (level: LogLevel, message: string, meta: any = null, printOut: boolean = false) => {
    try {
      await axios.post(`${LOGGING_SERVICE_ENDPOINT}/logs`, {
        logger: `webapp/${loggerNameAppended}`,
        level,
        message,
        meta
      });
      if (printOut) {
        const fmtMessage = `${loggerNameAppended} - ${level.toUpperCase()} - ${message}`;
        const printPackage = Object.keys(meta || {}).length !== 0 ? [fmtMessage, meta] : [fmtMessage];
        if (level === 'error') {
          console.error(...printPackage);
        } else if (level === 'warn') {
          console.warn(...printPackage);
        } else {
          console.log(...printPackage);
        }
      }
    } catch (error) {
      console.error('Error sending log:', error);
    }
  };

  return {
    debug: (message: string, meta: any = null) => log(LogLevel.DEBUG, message, meta),
    debugp: (message: string, meta: any = null) => log(LogLevel.DEBUG, message, meta, true),
    info: (message: string, meta: any = null) => log(LogLevel.INFO, message, meta),
    infop: (message: string, meta: any = null) => log(LogLevel.INFO, message, meta, true),
    warn: (message: string, meta: any = null) => log(LogLevel.WARN, message, meta),
    warnp: (message: string, meta: any = null) => log(LogLevel.WARN, message, meta, true),
    error: (message: string, meta: any = null) => log(LogLevel.ERROR, message, meta),
    errorp: (message: string, meta: any = null) => log(LogLevel.ERROR, message, meta, true),
  };
}
