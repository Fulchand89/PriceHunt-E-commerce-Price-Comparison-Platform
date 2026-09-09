'use strict';

const router = require('express').Router();
const cCtrl  = require('../controllers/comparison.controller');

/**
 * GET /api/comparison/catalog
 * Get list of active catalog products ("Mera Data") for comparison selection
 */
router.get('/catalog', cCtrl.getCatalog);

/**
 * GET /api/comparison/product/:id
 * Compare Admin Product from DB with live Amazon product
 */
router.get('/product/:id', cCtrl.compareAdminWithAmazon);

/**
 * GET /api/comparison/amazon/:asin
 * Compare Amazon live product by ASIN with Admin Product from DB
 */
router.get('/amazon/:asin', cCtrl.compareAmazonWithAdmin);

/**
 * GET /api/comparison/flipkart/:id
 * Compare Flipkart live product by ID/FSN/query with Admin Product from DB
 */
router.get('/flipkart/:id', cCtrl.compareFlipkartWithAdmin);

module.exports = router;
