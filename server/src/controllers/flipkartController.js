'use strict';

const flipkartService = require('../services/flipkart/flipkartService');

/**
 * Search Flipkart live products
 * GET /api/flipkart/search?q=iphone
 */
exports.search = async (req, res, next) => {
  try {
    const query = req.query.q;
    if (!query || !String(query).trim()) {
      return res.status(400).json({
        source: 'flipkart',
        query: '',
        products: [],
        error: 'Search query parameter "q" is required.'
      });
    }

    const options = {
      limit: req.query.limit ? parseInt(req.query.limit, 10) : 20,
      minPrice: req.query.minPrice || null,
      maxPrice: req.query.maxPrice || null
    };

    const result = await flipkartService.search(query, options);

    if (result.error) {
      return res.status(503).json({
        source: 'flipkart',
        query: String(query).trim(),
        products: [],
        error: 'Flipkart data temporarily unavailable'
      });
    }

    const products = result.products || [];

    return res.status(200).json({
      source: 'flipkart',
      query: String(query).trim(),
      count: products.length,
      cached: Boolean(result.cached),
      lastUpdated: result.lastUpdated,
      products: products.map(p => ({
        id: p.id || p.productId || p.fsn || null,
        productId: p.productId || p.id || p.fsn || null,
        title: p.title || null,
        price: p.price != null ? p.price : 0,
        originalPrice: p.originalPrice != null ? p.originalPrice : p.mrp || null,
        discount: p.discount != null ? p.discount : null,
        image: p.image || null,
        rating: p.rating != null ? p.rating : null,
        reviewCount: p.reviewCount != null ? p.reviewCount : null,
        url: p.url || null,
        productUrl: p.url || p.productUrl || null,
        availability: p.availability || null,
        seller: p.seller || 'Flipkart',
        source: 'Flipkart'
      }))
    });
  } catch (err) {
    return res.status(503).json({
      source: 'flipkart',
      query: String(req.query.q || '').trim(),
      products: [],
      error: 'Flipkart data temporarily unavailable'
    });
  }
};

/**
 * Get Flipkart live product details by ID / FSN / URL
 * GET /api/flipkart/product/:id
 */
exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || !String(id).trim()) {
      return res.status(400).json({
        source: 'flipkart',
        product: null,
        error: 'Product ID parameter is required.'
      });
    }

    const result = await flipkartService.getProductById(id);
    if (!result.product) {
      return res.status(404).json({
        source: 'flipkart',
        id: String(id).trim(),
        product: null,
        error: `No Flipkart product found with ID "${id}".`
      });
    }

    return res.status(200).json({
      source: 'flipkart',
      id: String(id).trim(),
      cached: Boolean(result.cached),
      lastUpdated: result.lastUpdated,
      product: result.product
    });
  } catch (err) {
    return res.status(503).json({
      source: 'flipkart',
      id: String(req.params.id || '').trim(),
      product: null,
      error: 'Flipkart data temporarily unavailable'
    });
  }
};
