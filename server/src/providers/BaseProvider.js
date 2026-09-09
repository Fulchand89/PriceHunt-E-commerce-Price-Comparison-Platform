'use strict';

const axios = require('axios');
const logger = require('../utils/logger');

const DEFAULT_USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
];

class BaseProvider {
  constructor(key, name, homepage, logo = null) {
    if (!key) throw new Error('BaseProvider: key is required');
    this.key = key.toLowerCase();
    this.name = name || key;
    this.homepage = homepage || '';
    this.logo = logo || `https://logo.clearbit.com/${this._extractDomain(homepage)}`;
    this.currency = 'INR';
    this.timeout = parseInt(process.env.SCRAPER_TIMEOUT || '15000', 10);
    this.maxRetries = 2;
    this.log = logger.child ? logger.child(this.name) : logger;
    this.enabled = true;
  }

  _extractDomain(url) {
    try {
      const u = new URL(url.startsWith('http') ? url : `https://${url}`);
      return u.hostname.replace(/^www\./, '');
    } catch {
      return `${this.key}.com`;
    }
  }

  getRandomUserAgent() {
    return DEFAULT_USER_AGENTS[Math.floor(Math.random() * DEFAULT_USER_AGENTS.length)];
  }

  getDefaultHeaders(customHeaders = {}) {
    return {
      'User-Agent': this.getRandomUserAgent(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-IN,en-GB;q=0.9,en;q=0.8',
      'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      ...customHeaders,
    };
  }

  /**
   * Safe HTTP GET with timeout, exponential backoff, and polite status classification
   */
  async safeGet(url, config = {}) {
    const timeout = config.timeout || this.timeout;
    const headers = this.getDefaultHeaders(config.headers || {});
    let lastError = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const t0 = Date.now();
        const res = await axios.get(url, {
          ...config,
          headers,
          timeout,
          validateStatus: (status) => status >= 200 && status < 400
        });
        this.log.debug(`GET ${url} [${res.status}] in ${Date.now() - t0}ms`);
        return { ok: true, status: res.status, data: res.data };
      } catch (err) {
        lastError = err;
        const statusCode = err.response?.status;

        // Blocked / Access Denied (403, 401, 429) - do not spam retries
        if (statusCode === 403 || statusCode === 401) {
          this.log.warn(`Store ${this.name} access restricted (${statusCode})`);
          return { ok: false, status: 'blocked', statusCode, error: err.message };
        }
        if (statusCode === 429) {
          this.log.warn(`Store ${this.name} rate limited (${statusCode})`);
          return { ok: false, status: 'rate_limited', statusCode, error: err.message };
        }
        if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
          this.log.warn(`Store ${this.name} request timed out`);
          return { ok: false, status: 'timeout', error: err.message };
        }

        // Retry on 5xx or transient connection reset
        if (attempt < this.maxRetries) {
          const delay = 500 * Math.pow(2, attempt);
          await new Promise(r => setTimeout(r, delay));
        }
      }
    }

    return {
      ok: false,
      status: 'error',
      statusCode: lastError?.response?.status || 500,
      error: lastError?.message || 'Request failed'
    };
  }

  /**
   * Standardized product normalization
   */
  normalizeProduct(data = {}) {
    const price = Math.round(Number(data.price) || 0);
    const mrp = Math.round(Number(data.mrp || data.originalPrice) || price);
    const discount = mrp > price && mrp > 0
      ? Math.round(((mrp - price) / mrp) * 100)
      : (Number(data.discount) || 0);

    return {
      store: this.name,
      storeKey: this.key,
      title: String(data.title || '').trim(),
      url: data.url || data.link || this.homepage,
      image: data.image || data.img || null,
      brand: String(data.brand || '').trim(),
      model: String(data.model || '').trim(),
      category: String(data.category || '').trim(),
      price: price,
      mrp: mrp,
      discount: discount,
      currency: data.currency || this.currency,
      availability: data.availability !== false ? (data.availability || 'In Stock') : 'Out of Stock',
      rating: data.rating != null ? Number(data.rating) : null,
      reviewCount: data.reviewCount != null ? Number(data.reviewCount) : null,
      variant: String(data.variant || '').trim(),
      seller: String(data.seller || this.name).trim(),
      scrapedAt: data.scrapedAt || new Date().toISOString()
    };
  }

  /**
   * Interface contract to be implemented by each store scraper
   */
  async searchProducts(query, options = {}) {
    throw new Error(`searchProducts() not implemented by ${this.name} scraper`);
  }

  async getProductDetails(url) {
    throw new Error(`getProductDetails() not implemented by ${this.name} scraper`);
  }
}

module.exports = BaseProvider;
