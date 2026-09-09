'use strict';

const jwt    = require('jsonwebtoken');
const User   = require('../models/User');
const { unauthorized } = require('../utils/apiResponse');
const logger = require('../utils/logger');
const log    = logger.child('Auth');

const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return unauthorized(res, 'Access token missing');
    const token = header.split(' ')[1];
    let decoded;
    try { decoded = jwt.verify(token, process.env.JWT_SECRET); }
    catch (e) { return unauthorized(res, e.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token'); }
    const user = await User.findByPk(decoded.id);
    if (!user)           return unauthorized(res, 'User no longer exists');
    if (!user.isActive)  return unauthorized(res, 'Account deactivated');
    req.user = user;
    next();
  } catch (e) { log.error('Auth middleware error: ' + e.message); return unauthorized(res, 'Authentication failed'); }
};

const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) { req.user = null; return next(); }
    const token = header.split(' ')[1];
    let decoded;
    try { decoded = jwt.verify(token, process.env.JWT_SECRET); } catch { req.user = null; return next(); }
    const user = await User.findByPk(decoded.id);
    req.user = (user && user.isActive) ? user : null;
    next();
  } catch { req.user = null; next(); }
};

const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not set');
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

module.exports = { protect, optionalAuth, generateToken };
