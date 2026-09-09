'use strict';

const success    = (res, data = {}, message = 'Success', code = 200) =>
  res.status(code).json({ success: true, message, data });

const created    = (res, data = {}, message = 'Created') =>
  success(res, data, message, 201);

const paginated  = (res, { data, total, page, limit, message = 'Success' }) => {
  const totalPages = Math.ceil(total / limit);
  return res.status(200).json({
    success: true, message, data,
    pagination: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
  });
};

const error = (res, message = 'An error occurred', code = 500, detail = null) => {
  const body = { success: false, message };
  if (detail && process.env.NODE_ENV !== 'production')
    body.error = typeof detail === 'string' ? detail : detail.message || detail;
  return res.status(code).json(body);
};

const validationError = (res, errors) =>
  res.status(422).json({ success: false, message: 'Validation failed', errors: Array.isArray(errors) ? errors : [errors] });

const unauthorized    = (res, msg = 'Unauthorized')                         => error(res, msg, 401);
const forbidden       = (res, msg = 'Forbidden — insufficient permissions') => error(res, msg, 403);
const notFound        = (res, msg = 'Resource not found')                   => error(res, msg, 404);
const tooManyRequests = (res, msg = 'Too many requests')                    => error(res, msg, 429);

module.exports = { success, created, paginated, error, validationError, unauthorized, forbidden, notFound, tooManyRequests };
