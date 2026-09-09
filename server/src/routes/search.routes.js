'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/search.controller');
const { optionalAuth, protect } = require('../middleware/auth.middleware');
const { validate, schemas }     = require('../middleware/validation.middleware');
const { searchLimiter }         = require('../middleware/rateLimit.middleware');

// GET /api/search?q=iphone&page=1&limit=20
router.get('/',           searchLimiter, optionalAuth, validate(schemas.search, 'query'), ctrl.search);
// GET /api/search/suggestions?q=iphone
router.get('/suggestions', ctrl.getSuggestions);
// GET /api/search/history
router.get('/history',    protect, ctrl.getSearchHistory);
// DELETE /api/search/history
router.delete('/history', protect, ctrl.clearSearchHistory);

module.exports = router;
