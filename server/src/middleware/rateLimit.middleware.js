'use strict';

const rateLimit = require('express-rate-limit');
const logger    = require('../utils/logger');

const _make = (windowMs, max, message) => rateLimit({
  windowMs, max,
  standardHeaders: true,
  legacyHeaders:   false,
  keyGenerator: req => req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', { ip:req.headers['x-forwarded-for']||req.ip, path:req.originalUrl });
    res.status(429).json({ success:false, message, retryAfter:Math.ceil(windowMs/1000) });
  },
  skip: () => process.env.NODE_ENV === 'test',
});

const apiLimiter          = _make(60_000,        200, 'Too many requests — please slow down');
const authLimiter         = _make(15 * 60_000,    10, 'Too many auth attempts — try again in 15 minutes');
const searchLimiter       = _make(60_000,          60, 'Too many searches — please wait a moment');
const adminLimiter        = _make(60_000,         300, 'Too many admin requests');
const alertCreateLimiter  = _make(60 * 60_000,     20, 'Too many price alerts created');

module.exports = { apiLimiter, authLimiter, searchLimiter, adminLimiter, alertCreateLimiter };
