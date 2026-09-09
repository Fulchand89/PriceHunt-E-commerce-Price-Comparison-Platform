'use strict';

const logger = require('../utils/logger');
const isProd  = process.env.NODE_ENV === 'production';

const notFoundHandler = (req, res) =>
  res.status(404).json({ success:false, message:`Route not found: ${req.method} ${req.originalUrl}` });

// eslint-disable-next-line no-unused-vars
const globalErrorHandler = (err, req, res, _next) => {
  let code    = err.status || err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Mongoose validation
  if (err.name === 'ValidationError') {
    code = 422;
    const errors = Object.values(err.errors).map(e => ({ field:e.path, message:e.message }));
    logger.warn('Validation error', { path:req.path, errors });
    return res.status(422).json({ success:false, message:'Validation failed', errors });
  }
  // Mongoose cast (bad ObjectId)
  if (err.name === 'CastError') { code=400; message=`Invalid value for "${err.path}"`; }
  // Duplicate key
  if (err.code === 11000) {
    code=409;
    const field = Object.keys(err.keyValue||{})[0]||'field';
    message = `Duplicate: "${err.keyValue?.[field]}" already exists for ${field}`;
  }
  // JWT
  if (err.name === 'JsonWebTokenError')  { code=401; message='Invalid token'; }
  if (err.name === 'TokenExpiredError')  { code=401; message='Token expired'; }
  // Axios
  if (err.isAxiosError) { code=err.response?.status||503; message=`External service error: ${message}`; }

  if (code >= 500) logger.error('Unhandled error', { path:req.path, method:req.method, message:err.message, stack:err.stack });
  else             logger.warn('Client error',     { path:req.path, code, message });

  const body = { success:false, message };
  if (!isProd && code>=500) body.stack = err.stack;
  return res.status(code).json(body);
};

module.exports = { notFoundHandler, globalErrorHandler };
