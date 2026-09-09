'use strict';

const FlipkartScraper = require('../../providers/scrapers/flipkart.scraper');

class FlipkartService {
  constructor() {
    this.scraper = new FlipkartScraper();
    this.cacheTTLMs = (parseInt(process.env.FLIPKART_CACHE_TTL, 10) || 600) * 1000; // 10 minutes cache

    // In-Memory Cache Maps:
    // searchCache: key -> { timestamp: number, data: Array<Product> }
    // productCache: pid -> { timestamp: number, data: Product }
    this.searchCache = new Map();
    this.productCache = new Map();
  }

  /**
   * Search live Flipkart products through the scraper.
   * @param {string} query - Search term (e.g., "iPhone 15")
   * @param {Object} options - Search options (limit, minPrice, maxPrice)
   * @returns {Promise<{ products: Array, source: string, query: string, cached: boolean }>}
   */
  async search(query, options = {}) {
    const q = String(query || '').trim();
    if (!q) {
      return {
        source: 'flipkart',
        query: '',
        products: [],
        cached: false,
        lastUpdated: new Date().toISOString()
      };
    }

    const cacheKey = `${q.toLowerCase()}::${options.minPrice || ''}::${options.maxPrice || ''}::${options.limit || 20}`;
    const cached = this.searchCache.get(cacheKey);

    if (cached && (Date.now() - cached.timestamp) < this.cacheTTLMs) {
      return {
        source: 'flipkart',
        query: q,
        products: cached.data,
        cached: true,
        lastUpdated: new Date(cached.timestamp).toISOString()
      };
    }

    // Run the live Flipkart Scraper
    const scrapeResult = await this.scraper.searchProducts(q, options);
    let products = scrapeResult.products || [];

    // Deduplicate products by product ID / title
    const seenKeys = new Set();
    products = products.filter(p => {
      const key = (p.productId || p.id || p.title || '').trim().toLowerCase();
      if (!key) return true;
      if (seenKeys.has(key)) return false;
      seenKeys.add(key);
      return true;
    });

    // Filter by min/max price if specified
    if (options.minPrice) {
      const min = Number(options.minPrice);
      if (!isNaN(min)) {
        products = products.filter(p => p.price >= min);
      }
    }
    if (options.maxPrice) {
      const max = Number(options.maxPrice);
      if (!isNaN(max)) {
        products = products.filter(p => p.price <= max);
      }
    }

    if (scrapeResult.status === 'unavailable' && products.length === 0) {
      return {
        source: 'flipkart',
        query: q,
        products: [],
        cached: false,
        error: 'Flipkart data temporarily unavailable',
        lastUpdated: new Date().toISOString()
      };
    }

    // Only cache real scraped results
    if (products.length > 0) {
      const now = Date.now();
      this.searchCache.set(cacheKey, { timestamp: now, data: products });

      for (const p of products) {
        const idKey = (p.productId || p.id || p.fsn || '').trim();
        if (idKey) {
          this.productCache.set(idKey.toUpperCase(), { timestamp: now, data: p });
        }
      }
    }

    return {
      source: 'flipkart',
      query: q,
      products,
      cached: false,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get single Flipkart product by PID / FSN or URL.
   * @param {string} idOrUrl - Product ID, FSN, or URL
   * @returns {Promise<Object|null>}
   */
  async getProductById(idOrUrl) {
    const cleanKey = String(idOrUrl || '').trim();
    if (!cleanKey) {
      return { product: null, cached: false };
    }

    const cached = this.productCache.get(cleanKey.toUpperCase());
    if (cached && (Date.now() - cached.timestamp) < this.cacheTTLMs) {
      return {
        product: cached.data,
        cached: true,
        lastUpdated: new Date(cached.timestamp).toISOString()
      };
    }

    const scrapeResult = await this.scraper.getProductDetails(cleanKey);
    const product = scrapeResult.product || null;

    if (product) {
      const now = Date.now();
      const pKey = (product.productId || product.id || cleanKey).toUpperCase();
      this.productCache.set(pKey, { timestamp: now, data: product });
    }

    return {
      product,
      cached: false,
      lastUpdated: new Date().toISOString()
    };
  }

  clearCache() {
    this.searchCache.clear();
    this.productCache.clear();
  }
}

module.exports = new FlipkartService();
