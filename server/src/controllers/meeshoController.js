'use strict';

const meeshoService = require('../services/meesho/meeshoService');

/**
 * Search Meesho live products
 * GET /api/meesho/search?q=iphone
 */
exports.search = async (req, res, next) => {
  try {
    const query = req.query.q;
    if (!query || !String(query).trim()) {
      return res.status(400).json({
        source: 'meesho',
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

    const result = await meeshoService.search(query, options);

    if (result.error) {
      return res.status(503).json({
        source: 'meesho',
        query: String(query).trim(),
        products: [],
        error: 'Meesho data temporarily unavailable'
      });
    }

    const products = result.products || [];

    return res.status(200).json({
      source: 'meesho',
      query: String(query).trim(),
      count: products.length,
      cached: Boolean(result.cached),
      lastUpdated: result.lastUpdated,
      products: products.map(p => ({
        id: p.id || p.productId || null,
        productId: p.productId || p.id || null,
        title: p.title || null,
        price: p.price != null ? p.price : 0,
        originalPrice: p.originalPrice != null ? p.originalPrice : (p.mrp || null),
        discount: p.discount != null ? p.discount : null,
        image: p.image || null,
        rating: p.rating != null ? p.rating : null,
        reviewCount: p.reviewCount != null ? p.reviewCount : null,
        url: p.url || null,
        productUrl: p.url || p.productUrl || null,
        availability: p.availability || null,
        seller: p.seller || 'Meesho',
        source: 'Meesho'
      }))
    });
  } catch (err) {
    return res.status(503).json({
      source: 'meesho',
      query: String(req.query.q || '').trim(),
      products: [],
      error: 'Meesho data temporarily unavailable'
    });
  }
};

/**
 * Get Meesho live product details by ID / URL
 * GET /api/meesho/product/:id
 */
exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || !String(id).trim()) {
      return res.status(400).json({
        source: 'meesho',
        product: null,
        error: 'Product ID parameter is required.'
      });
    }

    const result = await meeshoService.getProductById(id);
    if (!result.product) {
      return res.status(404).json({
        source: 'meesho',
        id: String(id).trim(),
        product: null,
        error: `No Meesho product found with ID "${id}".`
      });
    }

    return res.status(200).json({
      source: 'meesho',
      id: String(id).trim(),
      cached: Boolean(result.cached),
      lastUpdated: result.lastUpdated,
      product: result.product
    });
  } catch (err) {
    return res.status(503).json({
      source: 'meesho',
      id: String(req.params.id || '').trim(),
      product: null,
      error: 'Meesho data temporarily unavailable'
    });
  }
};
