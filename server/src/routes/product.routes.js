'use strict';

const router = require('express').Router();
const pCtrl  = require('../controllers/product.controller');
const cCtrl  = require('../controllers/comparison.controller');
const { protect }              = require('../middleware/auth.middleware');
const { requireAdmin }         = require('../middleware/admin.middleware');
const { validate, schemas }    = require('../middleware/validation.middleware');

const sCtrl  = require('../controllers/search.controller');
const { searchLimiter }         = require('../middleware/rateLimit.middleware');
const { optionalAuth }          = require('../middleware/auth.middleware');

// Public
router.get('/search',     searchLimiter, optionalAuth, validate(schemas.search, 'query'), sCtrl.search);
router.get('/trending',   pCtrl.getTrendingProducts);
router.get('/',           pCtrl.getProducts);

// Nested comparison + price-history (must come before /:id)
router.get('/:productId/compare',       validate(schemas.priceHistoryQuery, 'query'), cCtrl.compareProduct);
router.get('/:productId/price-history', validate(schemas.priceHistoryQuery, 'query'), cCtrl.getPriceHistory);

// Single product
router.get('/:id',        pCtrl.getProductById);

// Admin-only mutations
router.post('/',          protect, requireAdmin, validate(schemas.adminProductCreate), pCtrl.createProduct);
router.put('/:id',        protect, requireAdmin, pCtrl.updateProduct);
router.delete('/:id',     protect, requireAdmin, pCtrl.deleteProduct);

module.exports = router;
