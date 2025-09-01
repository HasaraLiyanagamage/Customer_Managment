const { ValidationError } = require('express-validation');
const { UnauthorizedError } = require('express-jwt');
const { logger } = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors;

  // Handle validation errors
  if (err instanceof ValidationError) {
    statusCode = 422;
    message = 'Validation Error';
    errors = {};
    
    err.details.body?.forEach((error) => {
      errors[error.path] = error.message;
    });
  }

  // Handle JWT errors
  if (err instanceof UnauthorizedError) {
    statusCode = 401;
    message = 'Invalid or expired token';
  }

  // Handle duplicate key errors (MySQL)
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = 'Duplicate entry';
    errors = {};
    
    err.errors.forEach((error) => {
      const path = error.path;
      errors[path] = `${path} already exists`;
    });
  }

  // Handle foreign key constraint errors
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Invalid reference';
    errors = { [err.fields[0]]: 'Referenced record does not exist' };
  }

  // Log the error
  logger.error({
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : {},
    ...(errors && { errors })
  });

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    ...(errors && { errors })
  });
};

// 404 Not Found middleware
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
