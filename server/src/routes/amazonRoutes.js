'use strict';

const router = require('express').Router();
const amazonController = require('../controllers/amazonController');

/**
 * @route   GET /api/amazon/search
 * @desc    Search live Amazon products through authorized Amazon API
 * @access  Public
 */
router.get('/search', amazonController.search);

/**
 * @route   GET /api/amazon/product/:asin
 * @desc    Get live Amazon product details by ASIN
 * @access  Public
 */
router.get('/product/:asin', amazonController.getProductByAsin);

module.exports = router;
