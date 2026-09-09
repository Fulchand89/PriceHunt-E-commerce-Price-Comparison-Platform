'use strict';

const router = require('express').Router();
const flipkartController = require('../controllers/flipkartController');

/**
 * @route   GET /api/flipkart/search
 * @desc    Search live Flipkart products
 * @access  Public
 */
router.get('/search', flipkartController.search);

/**
 * @route   GET /api/flipkart/product/:id
 * @desc    Get live Flipkart product details by ID / FSN
 * @access  Public
 */
router.get('/product/:id', flipkartController.getProductById);

module.exports = router;
