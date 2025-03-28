from enum import Enum
import logging
from logging.handlers import RotatingFileHandler
from pprint import pprint, pformat

import requests

from .config import LOGGING_SERVICE_ENDPOINT, BYPASS_LOGGING_SERVICE


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


def get_logger(loggerName) -> Logger | logging.Logger:
    if BYPASS_LOGGING_SERVICE:
        # Create logger
        logger = logging.getLogger(loggerName)
        logger.setLevel(logging.DEBUG)  # Set to lowest level to catch all messages

        # Clear any existing handlers to avoid duplicates
        if logger.hasHandlers():
            logger.handlers.clear()

        # Custom formatter to handle pretty-printing of extra argument
        class PrettyFormatter(logging.Formatter):
            def format(self, record):
                msg = super().format(record)
                # Check if there's an extra argument (stored in record.extra_arg)
                if hasattr(record, "extra_arg") and record.extra_arg is not None:
                    pretty_output = pformat(record.extra_arg)
                    return f"{msg}\n{pretty_output}"
                return msg

        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.DEBUG)
        console_formatter = PrettyFormatter("[%(levelname)s] %(asctime)s - %(message)s")
        console_handler.setFormatter(console_formatter)
        logger.addHandler(console_handler)

        # File handler with rotation
        file_handler = RotatingFileHandler(
            "logs.txt", maxBytes=10 * 1024 * 1024, backupCount=5  # 10MB, 5 backups
        )
        file_handler.setLevel(logging.DEBUG)
        file_formatter = PrettyFormatter("[%(levelname)s] %(asctime)s - %(message)s")
        file_handler.setFormatter(file_formatter)
        logger.addHandler(file_handler)

        # Wrapper to handle the extra argument explicitly
        class LoggerWrapper:
            def __init__(self, logger):
                self.logger = logger

            def debug(self, msg, extra_arg=None, *args, **kwargs):
                self.logger.debug(msg, extra={"extra_arg": extra_arg}, *args, **kwargs)

            def info(self, msg, extra_arg=None, *args, **kwargs):
                self.logger.info(msg, extra={"extra_arg": extra_arg}, *args, **kwargs)

            def warning(self, msg, extra_arg=None, *args, **kwargs):
                self.logger.warning(msg, extra={"extra_arg": extra_arg}, *args, **kwargs)

            def error(self, msg, extra_arg=None, *args, **kwargs):
                self.logger.error(msg, extra={"extra_arg": extra_arg}, *args, **kwargs)

            def critical(self, msg, extra_arg=None, *args, **kwargs):
                self.logger.critical(msg, extra={"extra_arg": extra_arg}, *args, **kwargs)

        return LoggerWrapper(logger)

    return Logger(loggerName)

