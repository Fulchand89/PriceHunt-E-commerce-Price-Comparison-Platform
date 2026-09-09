'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/mobileApp.controller');
const { optionalAuth, protect } = require('../middleware/auth.middleware');

// GET /api/app/config — App init config & force update status
router.get('/config',            ctrl.getAppConfig);

// GET /api/app/home-feed — Lightweight mobile homepage feed
router.get('/home-feed',         ctrl.getHomeFeed);

// POST /api/app/barcode-scan — In-store mobile barcode scanning
router.post('/barcode-scan',     ctrl.scanBarcode);

// POST /api/app/push-token — Push notification device token registration
router.post('/push-token',       optionalAuth, ctrl.registerPushToken);

// GET /api/app/deal-of-the-day — Mobile widget & lockscreen deal
router.get('/deal-of-the-day',   ctrl.getDealOfTheDay);

module.exports = router;
