'use strict';

const amazonService = require('../services/amazon/amazonService');

/**
 * Search Amazon live products
 * GET /api/amazon/search?q=iphone
 */
exports.search = async (req, res, next) => {
  try {
    const query = req.query.q;
    if (!query || !String(query).trim()) {
      return res.status(400).json({
        source: 'amazon',
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

    const result = await amazonService.search(query, options);

    if (result.error) {
      return res.status(503).json({
        source: 'amazon',
        query: String(query).trim(),
        products: [],
        error: 'Amazon data temporarily unavailable'
      });
    }

    const products = result.products || [];

    // Response structure strictly following Step 7 & Step 5
    return res.status(200).json({
      source: 'amazon',
      query: String(query).trim(),
      count: products.length,
      cached: Boolean(result.cached),
      lastUpdated: result.lastUpdated,
      products: products.map(p => ({
        title: p.title || null,
        price: p.price != null ? p.price : 0,
        originalPrice: p.originalPrice != null ? p.originalPrice : null,
        discount: p.discount != null ? p.discount : null,
        image: p.image || null,
        rating: p.rating != null ? p.rating : null,
        reviewCount: p.reviewCount != null ? p.reviewCount : null,
        asin: p.asin || null,
        url: p.url || null,
        availability: p.availability || null
      }))
    });
  } catch (err) {
    return res.status(503).json({
      source: 'amazon',
      query: String(req.query.q || '').trim(),
      products: [],
      error: 'Amazon data temporarily unavailable'
    });
  }
};

/**
 * Get Amazon live product details by ASIN
 * GET /api/amazon/product/:asin
 */
exports.getProductByAsin = async (req, res, next) => {
  try {
    const { asin } = req.params;
    if (!asin || !String(asin).trim()) {
      return res.status(400).json({
        source: 'amazon',
        product: null,
        error: 'Product ASIN parameter is required.'
      });
    }

    const result = await amazonService.getProductByAsin(asin);
    if (!result.product) {
      return res.status(404).json({
        source: 'amazon',
        asin: String(asin).trim().toUpperCase(),
        product: null,
        error: `No Amazon product found with ASIN "${asin}".`
      });
    }

    return res.status(200).json({
      source: 'amazon',
      asin: String(asin).trim().toUpperCase(),
      cached: Boolean(result.cached),
      lastUpdated: result.lastUpdated,
      product: result.product
    });
  } catch (err) {
    return res.status(503).json({
      source: 'amazon',
      asin: String(req.params.asin || '').trim().toUpperCase(),
      product: null,
      error: 'Amazon data temporarily unavailable'
    });
  }
};
