'use strict';

const Joi = require('joi');

const validate = (schema, target = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[target], { abortEarly:false, stripUnknown:true, convert:true });
  if (error) {
    const errors = error.details.map(d => ({ field:d.path.join('.'), message:d.message.replace(/['"]/g,'') }));
    return res.status(422).json({ success:false, message:'Validation failed', errors });
  }
  req[target] = value;
  next();
};

// ── Reusable field schemas ────────────────────────────────────────────────────
const email    = Joi.string().email({ tlds:{allow:false} }).lowercase().trim();
const password = Joi.string().min(8).max(128);
const dbId     = Joi.string().min(1).max(128);
const posInt   = Joi.number().integer().positive();

const schemas = {
  // Auth
  register:       Joi.object({ name:Joi.string().min(2).max(80).trim().required(), email:email.required(), password:password.required(), avatar:Joi.string().uri().allow('',null), role:Joi.string().valid('user','admin','superadmin').default('user') }),
  login:          Joi.object({ email:email.required(), password:Joi.string().min(1).required() }),
  updateProfile:  Joi.object({ name:Joi.string().min(2).max(80).trim(), avatar:Joi.string().uri().allow('',null) }).min(1),
  changePassword: Joi.object({ currentPassword:Joi.string().required(), newPassword:password.required() }),
  forgotPassword: Joi.object({ email:email.required() }),
  resetPassword:  Joi.object({ token:Joi.string().required(), newPassword:password.required() }),

  // Search
  search: Joi.object({
    q:        Joi.string().max(300).trim().allow('', null).default(''),
    page:     posInt.max(1000).default(1),
    limit:    posInt.max(100).default(20),
    sort:     Joi.string().valid('price_asc', 'price_desc', 'relevance', 'discount', 'lowestPrice', 'highestPrice').optional(),
    sortBy:   Joi.string().valid('lowestPrice', 'highestPrice', 'highestDiscount', 'recentlyUpdated', 'price_asc', 'price_desc', 'relevance', 'discount').optional(),
    category: Joi.string().trim().allow('', null).optional(),
    brand:    Joi.string().trim().allow('', null).optional(),
    store:    Joi.string().trim().allow('', null).optional(),
    discount: Joi.alternatives().try(Joi.number().min(0).max(100), Joi.string().allow('', null)).optional(),
    minPrice: Joi.alternatives().try(Joi.number().min(0), Joi.string().allow('', null)).optional(),
    maxPrice: Joi.alternatives().try(Joi.number().min(0), Joi.string().allow('', null)).optional(),
  }),

  // Products
  adminProductCreate: Joi.object({
    title:          Joi.string().min(3).max(500).trim().required(),
    brand:          Joi.string().trim().allow('',null),
    category:       Joi.string().trim().allow('',null),
    description:    Joi.string().trim().allow('',null),
    image:          Joi.string().uri().allow('',null),
    specifications: Joi.array().items(Joi.object({ key:Joi.string().required(), value:Joi.string().required() })).default([]),
  }),

  // Price history
  priceHistoryQuery: Joi.object({ range:Joi.string().valid('7d','30d','90d','1y').default('30d') }),

  // Watchlist
  watchlistAdd: Joi.object({ productId:dbId.required() }),

  // Alerts
  createAlert: Joi.object({
    productId:          dbId.required(),
    targetPrice:        Joi.number().positive().required(),
    provider:           Joi.string().trim().allow(null,''),
    currency:           Joi.string().length(3).uppercase().default('INR'),
    retriggerAfterDays: Joi.number().integer().min(0).max(365).default(0),
  }),
  updateAlert: Joi.object({ targetPrice:Joi.number().positive(), isActive:Joi.boolean(), retriggerAfterDays:Joi.number().integer().min(0).max(365) }).min(1),

  // Admin
  toggleProvider:   Joi.object({ enabled:Joi.boolean().required() }),
  adminUserUpdate:  Joi.object({ role:Joi.string().valid('user','admin','superadmin'), isActive:Joi.boolean() }).min(1),
  paginationQuery:  Joi.object({ page:posInt.max(1000).default(1), limit:posInt.max(100).default(20) }),
};

module.exports = { validate, schemas };
