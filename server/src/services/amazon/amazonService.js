'use strict';

const AmazonScraper = require('../../providers/scrapers/amazon.scraper');

class AmazonService {
  constructor() {
    this.scraper = new AmazonScraper();
    this.cacheTTLMs = (parseInt(process.env.AMAZON_CACHE_TTL, 10) || 600) * 1000; // 10 minutes cache
    
    // In-Memory Cache Maps:
    // searchCache: key -> { timestamp: number, data: Array<Product> }
    // productCache: asin -> { timestamp: number, data: Product }
    this.searchCache = new Map();
    this.productCache = new Map();
  }

  /**
   * Search live Amazon products through the scraper.
   * @param {string} query - Search term (e.g., "iPhone")
   * @param {Object} options - Search options (limit, minPrice, maxPrice)
   * @returns {Promise<{ products: Array, source: string, query: string, cached: boolean }>}
   */
  async search(query, options = {}) {
    const q = String(query || '').trim();
    if (!q) {
      return {
        source: 'amazon',
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
        source: 'amazon',
        query: q,
        products: cached.data,
        cached: true,
        lastUpdated: new Date(cached.timestamp).toISOString()
      };
    }

    // Run the live Amazon Scraper
    const scrapeResult = await this.scraper.searchProducts(q, options);
    let products = scrapeResult.products || [];

    // Deduplicate products by ASIN
    const seenAsins = new Set();
    products = products.filter(p => {
      if (!p.asin) return true;
      const cleanAsin = String(p.asin).trim().toUpperCase();
      if (seenAsins.has(cleanAsin)) return false;
      seenAsins.add(cleanAsin);
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
        source: 'amazon',
        query: q,
        products: [],
        cached: false,
        error: 'Amazon data temporarily unavailable',
        lastUpdated: new Date().toISOString()
      };
    }

    // Only cache real scraped results
    if (products.length > 0) {
      const now = Date.now();
      this.searchCache.set(cacheKey, { timestamp: now, data: products });

      for (const p of products) {
        if (p.asin) {
          this.productCache.set(p.asin.toUpperCase(), { timestamp: now, data: p });
        }
      }
    }

    return {
      source: 'amazon',
      query: q,
      products,
      cached: false,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get single Amazon product by ASIN.
   * @param {string} asin - 10-character Amazon ASIN
   * @returns {Promise<Object|null>}
   */
  async getProductByAsin(asin) {
    const cleanAsin = String(asin || '').trim().toUpperCase();
    if (!cleanAsin) {
      return { product: null, cached: false };
    }

    const cached = this.productCache.get(cleanAsin);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTTLMs) {
      return {
        product: cached.data,
        cached: true,
        lastUpdated: new Date(cached.timestamp).toISOString()
      };
    }

    const scrapeResult = await this.scraper.getProductDetails(cleanAsin);
    const product = scrapeResult.product || null;

    if (product) {
      const now = Date.now();
      this.productCache.set(cleanAsin, { timestamp: now, data: product });
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

module.exports = new AmazonService();
