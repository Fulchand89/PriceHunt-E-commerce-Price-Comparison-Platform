'use strict';

const { forbidden } = require('../utils/apiResponse');

const requireAdmin = (req, res, next) => {
  if (!req.user)                                                    return forbidden(res, 'Authentication required');
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin')  return forbidden(res, 'Admin privileges required');
  next();
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user)                      return forbidden(res, 'Authentication required');
  if (!roles.includes(req.user.role)) return forbidden(res, `Required role: ${roles.join(', ')}`);
  next();
};

module.exports = { requireAdmin, requireRole };
