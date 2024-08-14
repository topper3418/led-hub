const db = require('../db');
const getLogger = require('../logging');

const logger = getLogger('api/errors');

const generic = (err, req, res, next) => {
  logger.info(`${err.status} - ${err.message}`)
  
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
  
    res.status(status).json({
      status: 'error',
      message,
    });
  };

  // notFoundHandler.js

const notFound = (req, res, next) => {
    logger.info(`404 - ${req.originalUrl}`)
    next({
        status: 404,
        message: `route not found: ${req.originalUrl}`
    })
  };
  
  
  module.exports = {
    handler: generic,
    notFound
};
  