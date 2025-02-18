from enum import Enum
import requests
from pprint import pprint

from .config import LOGGING_SERVICE_ENDPOINT


class LoggingLevel(Enum):
    DEBUG = 'debug'
    INFO = 'info'
    WARN = 'warn'
    ERROR = 'error'

class Logger:

    def __init__(self, loggerName):
        self.loggerName = f'server.{loggerName}'
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
            print(f'Failed to send log: {e}\n\t - {fmtMessage}\n')


def get_logger(loggerName) -> Logger:
    return Logger(loggerName)

