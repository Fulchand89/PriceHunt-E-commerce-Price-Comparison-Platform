'use strict';

const MeeshoScraper = require('../../providers/scrapers/meesho.scraper');

class MeeshoService {
  constructor() {
    this.scraper = new MeeshoScraper();
    this.cacheTTLMs = (parseInt(process.env.MEESHO_CACHE_TTL, 10) || 600) * 1000; // 10 minutes default

    // In-Memory Cache Maps:
    // searchCache: key -> { timestamp: number, data: Array<Product> }
    // productCache: id -> { timestamp: number, data: Product }
    this.searchCache = new Map();
    this.productCache = new Map();
  }

  /**
   * Search live Meesho products through the scraper.
   * @param {string} query - Search term (e.g., "iPhone 15")
   * @param {Object} options - Search options (limit, minPrice, maxPrice)
   * @returns {Promise<{ products: Array, source: string, query: string, cached: boolean }>}
   */
  async search(query, options = {}) {
    const q = String(query || '').trim();
    if (!q) {
      return {
        source: 'meesho',
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
        source: 'meesho',
        query: q,
        products: cached.data,
        cached: true,
        lastUpdated: new Date(cached.timestamp).toISOString()
      };
    }

    // Run the live Meesho Scraper
    const scrapeResult = await this.scraper.searchProducts(q, options);
    let products = scrapeResult.products || [];

    // Deduplicate products by productId / title
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
        source: 'meesho',
        query: q,
        products: [],
        cached: false,
        error: 'Meesho data temporarily unavailable',
        lastUpdated: new Date().toISOString()
      };
    }

    // Only cache real scraped results
    if (products.length > 0) {
      const now = Date.now();
      this.searchCache.set(cacheKey, { timestamp: now, data: products });

      for (const p of products) {
        const idKey = (p.productId || p.id || '').trim();
        if (idKey) {
          this.productCache.set(idKey.toUpperCase(), { timestamp: now, data: p });
        }
      }
    }

    return {
      source: 'meesho',
      query: q,
      products,
      cached: false,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get single Meesho product by ID or URL.
   * @param {string} idOrUrl - Product ID or URL
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

    // Resolve URL from ID if needed
    const url = cleanKey.startsWith('http')
      ? cleanKey
      : `https://www.meesho.com/s/p/${cleanKey}`;

    const scrapeResult = await this.scraper.getProductDetails(url);
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

module.exports = new MeeshoService();
