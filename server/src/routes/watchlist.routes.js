'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/watchlist.controller');
const { protect }           = require('../middleware/auth.middleware');
const { validate, schemas } = require('../middleware/validation.middleware');

// All routes require auth
router.use(protect);

router.get('/',               ctrl.getWatchlist);
router.post('/',              validate(schemas.watchlistAdd), ctrl.addToWatchlist);
router.delete('/:productId',  ctrl.removeFromWatchlist);
router.delete('/',            ctrl.clearWatchlist);

module.exports = router;
