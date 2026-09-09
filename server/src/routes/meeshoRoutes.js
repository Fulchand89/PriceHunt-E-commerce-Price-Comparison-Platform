'use strict';

const router = require('express').Router();
const meeshoController = require('../controllers/meeshoController');

/**
 * @route   GET /api/meesho/search
 * @desc    Search live Meesho products
 * @access  Public
 */
router.get('/search', meeshoController.search);

/**
 * @route   GET /api/meesho/product/:id
 * @desc    Get live Meesho product details by ID / URL
 * @access  Public
 */
router.get('/product/:id', meeshoController.getProductById);

module.exports = router;
