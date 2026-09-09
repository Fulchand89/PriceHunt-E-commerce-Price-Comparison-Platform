'use strict';

const logger = require('../utils/logger');
const { providerManager } = require('../providers');
const { groupListings } = require('./productMatcher.service');
const Product = require('../models/Product');
const ProductListing = require('../models/ProductListing');
const PriceHistory = require('../models/PriceHistory');
const ScraperLog = require('../models/ScraperLog');
const Store = require('../models/Store');
const { normalizeTitle } = require('../utils/helpers');

const log = logger.child ? logger.child('ScraperOrchestrator') : logger;

class SimpleQueue {
  constructor(concurrency = 3) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  async run(task) {
    if (this.running >= this.concurrency) {
      await new Promise(resolve => this.queue.push(resolve));
    }
    this.running++;
    try {
      return await task();
    } finally {
      this.running--;
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        next();
      }
    }
  }
}

class ScraperOrchestrator {
  constructor() {
    this.concurrency = parseInt(process.env.SCRAPER_CONCURRENCY || '3', 10);
    this.inFlightSearches = new Map();
  }

  async searchAcrossStores(query, options = {}) {
    const q = String(query || '').trim();
    if (!q) {
      return { products: [], storeStatuses: [] };
    }

    const nq = normalizeTitle(q);
    const inFlightKey = `search:${nq}`;

    if (this.inFlightSearches.has(inFlightKey)) {
      log.debug(`Deduplicating in-flight search for "${q}"`);
      return await this.inFlightSearches.get(inFlightKey);
    }

    const searchPromise = this._executeSearch(q, nq, options);
    this.inFlightSearches.set(inFlightKey, searchPromise);

    try {
      return await searchPromise;
    } finally {
      this.inFlightSearches.delete(inFlightKey);
    }
  }

  async _executeSearch(query, nq, options = {}) {
    const activeScrapers = providerManager.getEnabled();
    const queue = new SimpleQueue(this.concurrency);
    const storeStatuses = [];
    const rawListings = [];

    const tasks = activeScrapers.map(scraper => {
      return queue.run(async () => {
        const t0 = Date.now();
        try {
          const res = await scraper.searchProducts(query, { limit: options.limit || 10 });
          const duration = Date.now() - t0;
          const status = res.status || (res.products && res.products.length > 0 ? 'success' : 'unavailable');
          const productsFound = res.productsFound || (res.products ? res.products.length : 0);

          storeStatuses.push({
            store: scraper.name,
            storeKey: scraper.key,
            status,
            productsFound,
            durationMs: duration,
            scrapedAt: res.scrapedAt || new Date().toISOString()
          });

          this._logScrape(scraper, status, query, productsFound, duration, null);

          if (res.products && res.products.length > 0) {
            rawListings.push(...res.products);
          }
        } catch (err) {
          const duration = Date.now() - t0;
          storeStatuses.push({
            store: scraper.name,
            storeKey: scraper.key,
            status: 'error',
            productsFound: 0,
            durationMs: duration,
            error: err.message,
            scrapedAt: new Date().toISOString()
          });
          this._logScrape(scraper, 'error', query, 0, duration, err.message);
        }
      });
    });

    await Promise.allSettled(tasks);

    const groups = groupListings(rawListings);
    const persistedGroups = await Promise.all(groups.map(g => this._persistGroup(g)));

    return {
      products: persistedGroups.filter(Boolean),
      storeStatuses,
      totalListings: rawListings.length,
      timestamp: new Date().toISOString()
    };
  }

  async _persistGroup({ representative: rep, listings }) {
    try {
      const nTitle = normalizeTitle(rep.title);
      let product = await Product.findOne({ where: { normalizedTitle: nTitle } });

      if (!product) {
        const baseSlug = (rep.title || '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || 'product';
        const slug = `${baseSlug}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;

        product = await Product.create({
          title: rep.title,
          canonicalTitle: rep.title,
          slug,
          normalizedTitle: nTitle,
          brand: rep.brand || rep.seller || '',
          model: rep.model || '',
          category: rep.category || '',
          image: rep.image || null,
          images: rep.image ? [rep.image] : [],
          lastScrapedAt: new Date(),
          isActive: true
        });
      }

      const pId = product.id;

      const upsertedListings = await Promise.all(listings.map(async (l) => {
        try {
          const provKey = l.storeKey || l.provider || (l.store ? l.store.toLowerCase() : 'amazon');
          const storeDoc = await Store.findOne({ where: { key: provKey } });

          let [listingDoc] = await ProductListing.findOrCreate({
            where: { productId: pId, provider: provKey },
            defaults: {
              productId: pId,
              storeId: storeDoc ? storeDoc.id : null,
              provider: provKey,
              title: l.title,
              image: l.image || null,
              price: l.price,
              mrp: l.mrp || l.originalPrice || l.price,
              originalPrice: l.mrp || l.originalPrice || l.price,
              discount: l.discount || 0,
              currency: l.currency || 'INR',
              availability: l.availability !== 'Out of Stock',
              seller: l.seller || l.store,
              productUrl: l.url || l.productUrl || null,
              affiliateUrl: l.affiliateUrl || l.url || l.productUrl || null,
              rating: l.rating,
              reviewCount: l.reviewCount,
              variant: l.variant || '',
              lastScrapedAt: new Date(),
              lastUpdated: new Date(),
              isActive: true
            }
          });

          if (listingDoc) {
            await listingDoc.update({
              title: l.title,
              image: l.image || null,
              price: l.price,
              mrp: l.mrp || l.originalPrice || l.price,
              originalPrice: l.mrp || l.originalPrice || l.price,
              discount: l.discount || 0,
              availability: l.availability !== 'Out of Stock',
              seller: l.seller || l.store,
              productUrl: l.url || l.productUrl || null,
              affiliateUrl: l.affiliateUrl || l.url || l.productUrl || null,
              rating: l.rating,
              reviewCount: l.reviewCount,
              variant: l.variant || '',
              lastScrapedAt: new Date(),
              lastUpdated: new Date()
            });
          }

          const lJson = listingDoc.toJSON();

          if (lJson && lJson.price > 0) {
            await PriceHistory.create({
              productListingId: lJson.id,
              productId: pId,
              storeId: storeDoc ? storeDoc.id : null,
              store: l.store || l.provider,
              provider: provKey,
              price: lJson.price,
              mrp: lJson.mrp,
              originalPrice: lJson.originalPrice,
              discount: lJson.discount,
              availability: lJson.availability,
              timestamp: new Date(),
              date: new Date()
            }).catch(() => {});
          }

          return lJson;
        } catch (err) {
          log.warn(`Listing persist failed for ${l.store}: ${err.message}`);
          return null;
        }
      }));

      const validListings = upsertedListings.filter(Boolean);
      const validPrices = validListings.map(l => l.price).filter(p => p > 0);

      if (validPrices.length) {
        const lowest = Math.min(...validPrices);
        const highest = Math.max(...validPrices);
        await product.update({
          lowestPrice: lowest,
          highestPrice: highest,
          lastScrapedAt: new Date(),
          image: product.image || validListings[0]?.image || null
        });
      }

      return {
        product: product.toJSON(),
        listings: validListings
      };
    } catch (err) {
      log.error(`_persistGroup error: ${err.message}`);
      return null;
    }
  }

  async _logScrape(scraper, status, query, productsFound, durationMs, errorMessage) {
    try {
      await ScraperLog.create({
        store: scraper.name,
        storeKey: scraper.key,
        status,
        query,
        productsFound,
        durationMs,
        errorMessage,
        scrapedAt: new Date()
      });

      const storeDoc = await Store.findOne({ where: { key: scraper.key } });
      if (storeDoc) {
        const updates = {
          lastError: errorMessage || null,
          status: status === 'success' ? 'active' : (status === 'blocked' ? 'degraded' : 'active')
        };
        if (status === 'success') updates.lastSuccessfulRun = new Date();
        if (productsFound > 0) updates.productsCount = (storeDoc.productsCount || 0) + productsFound;

        await storeDoc.update(updates);
      }
    } catch {
      // Non-critical logging failure
    }
  }
}

module.exports = new ScraperOrchestrator();
