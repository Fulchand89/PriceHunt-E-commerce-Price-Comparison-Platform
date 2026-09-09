'use strict';

const logger = require('../utils/logger');

class ProviderManager {
  constructor() {
    this._scrapers = new Map();
    this.log = logger.child ? logger.child('ProviderManager') : logger;
  }

  register(key, scraperInstance) {
    if (!key || !scraperInstance) return;
    this._scrapers.set(key.toLowerCase(), scraperInstance);
    this.log.info(`Registered scraper: ${scraperInstance.name} [${key}]`);
  }

  get(key) {
    return this._scrapers.get(String(key).toLowerCase()) || null;
  }

  getAll() {
    return Array.from(this._scrapers.values());
  }

  getEnabled() {
    return this.getAll().filter(s => s.enabled !== false);
  }

  getStoreKeys() {
    return Array.from(this._scrapers.keys());
  }

  toggle(key, enabled) {
    const s = this.get(key);
    if (!s) return null;
    s.enabled = Boolean(enabled);
    return { store: s.name, key, enabled: s.enabled };
  }

  /**
   * Safe execution of an operation across multiple scrapers concurrently
   */
  async executeAcrossStores(fn, storeKeys = null) {
    const targets = storeKeys
      ? storeKeys.map(k => this.get(k)).filter(Boolean)
      : this.getEnabled();

    if (!targets.length) {
      return [];
    }

    const tasks = targets.map(async (scraper) => {
      const t0 = Date.now();
      try {
        const result = await fn(scraper);
        return {
          store: scraper.name,
          storeKey: scraper.key,
          success: true,
          status: result.status || 'success',
          productsFound: result.productsFound || (result.products ? result.products.length : 0),
          products: result.products || [],
          durationMs: Date.now() - t0,
          scrapedAt: new Date().toISOString()
        };
      } catch (err) {
        return {
          store: scraper.name,
          storeKey: scraper.key,
          success: false,
          status: 'error',
          error: err.message,
          productsFound: 0,
          products: [],
          durationMs: Date.now() - t0,
          scrapedAt: new Date().toISOString()
        };
      }
    });

    const settled = await Promise.allSettled(tasks);
    return settled.map(r => r.status === 'fulfilled' ? r.value : {
      store: 'Unknown',
      success: false,
      status: 'error',
      error: r.reason?.message || 'Scraper execution rejected',
      productsFound: 0,
      products: []
    });
  }
}

module.exports = new ProviderManager();
