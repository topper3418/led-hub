const db = require('../db');

const logger = db.getLogger('http-errors');

const generic = (err, req, res, next) => {
  logger.trace(`${err.status} - ${err.message}`)
  
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
  
    res.status(status).json({
      status: 'error',
      message,
    });
  };

  // notFoundHandler.js

const notFound = (req, res, next) => {
    logger.trace(`404 - ${req.originalUrl}`)
    next({
        status: 404,
        message: `route not found: ${req.originalUrl}`
    })
  };
  
  
  module.exports = {
    handler: generic,
    notFound
};
  