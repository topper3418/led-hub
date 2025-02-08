# points to the logging microservice

# just need to make the python version of this: 

# const axios = require('axios');
#
# const LOGGING_SERVICE_ENDPOINT = process.env.LOGGING_SERVICE_ENDPOINT || 'http://localhost:8080';
#
# function getLogger(loggerName) {
#   const loggerNameAppended = `server/${loggerName}`;
#   // ensure the logger exists in the logging service
#   axios.post(`${LOGGING_SERVICE_ENDPOINT}/loggers`, { name: loggerNameAppended })
#     .catch((error) => console.log('Error creating logger:', error.message));
#   // logging function to wrap in logger methods
#   const log = async (level, message, meta = {}, print = false) => {
#     try {
#       await axios.post(`${LOGGING_SERVICE_ENDPOINT}/logs`, {
#         logger: `server/${loggerNameAppended}`,
#         level,
#         message,
#         meta
#       });
#       if (print) {
#         const fmtMessage = `${loggerNameAppended} - ${level.toUpperCase()} - ${message}`;
#         const printPackage = Object.keys(meta).length !== 0 ? [fmtMessage, meta] : [fmtMessage];
#         console.log(...printPackage);
#       }
#     } catch (error) {
#       const fmtMessage = `${loggerNameAppended} - ${level.toUpperCase()} - ${message}`;
#       console.error(`Failed to send log: ${error.message}\n${fmtMessage}\n`);
#     }
#   };
#
#   return {
#     debug: (message, meta) => log('debug', message, meta),
#     debugp: (message, meta) => log('debug', message, meta, print = true),
#     info: (message, meta) => log('info', message, meta),
#     infop: (message, meta) => log('info', message, meta, print = true),
#     warn: (message, meta) => log('warn', message, meta),
#     warnp: (message, meta) => log('warn', message, meta, print = true),
#     error: (message, meta) => log('error', message, meta),
#     errorp: (message, meta) => log('error', message, meta, print = true),
#   };
# }
#
# module.exports = { getLogger };

from enum import Enum
import requests
import os
from pprint import pprint

LOGGING_SERVICE_ENDPOINT = os.getenv('LOGGING_SERVICE_ENDPOINT', 'http://localhost:8080')

class LoggingLevel(Enum):
    DEBUG = 'debug'
    INFO = 'info'
    WARN = 'warn'
    ERROR = 'error'

class VoiceRequestorLogger:

    def __init__(self, loggerName):
        self.loggerName = f'voiceRequestor/{loggerName}'
        self._ensure_logger_exists()

    def debug(self, message, meta={}):
        self._log(LoggingLevel.DEBUG, message, meta)

    def debugp(self, message, meta={}):
        self._log(LoggingLevel.DEBUG, message, meta, printLog=True)

    def info(self, message, meta={}):
        self._log(LoggingLevel.INFO, message, meta)

    def infop(self, message, meta={}):
        self._log(LoggingLevel.INFO, message, meta, printLog=True)

    def warn(self, message, meta={}):
        self._log(LoggingLevel.WARN, message, meta)

    def warnp(self, message, meta={}):
        self._log(LoggingLevel.WARN, message, meta, printLog=True)

    def error(self, message, meta={}):
        self._log(LoggingLevel.ERROR, message, meta)

    def errorp(self, message, meta={}):
        self._log(LoggingLevel.ERROR, message, meta, printLog=True)

    def _ensure_logger_exists(self):
        requests.post(f'{LOGGING_SERVICE_ENDPOINT}/loggers', json={'name': self.loggerName})

    def _log(self, level: LoggingLevel, message, meta={}, printLog=False):
        try:
            requests.post(f'{LOGGING_SERVICE_ENDPOINT}/logs', json={
                'logger': self.loggerName,
                'level': level.value,
                'message': message,
                'meta': meta
            })
            if printLog:
                fmtMessage = f'{self.loggerName} - {level.value.upper()} - {message}'
                print(fmtMessage)
                if len(meta) != 0:
                    pprint(meta)
        except Exception as e:
            fmtMessage = f'{self.loggerName} - {level.value.upper()} - {message}'
            print(f'Failed to send log: {e}\n{fmtMessage}\n')


def getLogger(loggerName) -> VoiceRequestorLogger:
    return VoiceRequestorLogger(loggerName)
