// genericErrorHandler.js

const generic = (err, req, res, next) => {
    console.error('An error occurred:', err);
  
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
  
    res.status(status).json({
      status: 'error',
      message,
    });
  };

  // notFoundHandler.js

const notFound = (req, res, next) => {
    next({
        status: 404,
        message: `route not found: ${req.originalUrl}`
    })
  };
  
  module.exports = notFoundHandler;
  
  
  module.exports = {
    handler: generic,
    notFound
};
  