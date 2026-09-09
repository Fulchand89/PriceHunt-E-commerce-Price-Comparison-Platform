'use strict';

const cron = require('node-cron');
const logger = require('../utils/logger');
const Product = require('../models/Product');
const PriceAlert = require('../models/PriceAlert');
const SearchHistory = require('../models/SearchHistory');
const scraperOrchestrator = require('../services/scraperOrchestrator.service');

const log = logger.child ? logger.child('ScraperJob') : logger;
let _task = null;
let _running = false;

const runPrioritizedScrape = async () => {
  if (_running) {
    log.info('Scraper job already running, skipping iteration');
    return;
  }
  _running = true;

  try {
    log.info('Starting prioritized background scraper job...');
    const queriesToRefresh = new Set();

    // Priority 1: Products with active price alerts
    const activeAlerts = await PriceAlert.find({ isActive: true, notificationSent: false })
      .populate('productId', 'title canonicalTitle')
      .limit(20)
      .lean();
    for (const a of activeAlerts) {
      if (a.productId?.title) queriesToRefresh.add(a.productId.title);
    }

    // Priority 2: Popular products (by viewCount)
    const popularProducts = await Product.find({ isActive: true })
      .sort({ viewCount: -1 })
      .limit(10)
      .select('title canonicalTitle')
      .lean();
    for (const p of popularProducts) {
      if (p.title) queriesToRefresh.add(p.title);
    }

    // Priority 3: Recently searched queries
    const recentSearches = await SearchHistory.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('query')
      .lean();
    for (const s of recentSearches) {
      if (s.query && s.query.length >= 3) queriesToRefresh.add(s.query);
    }

    log.info(`Identified ${queriesToRefresh.size} prioritized queries for background refresh`);

    let refreshedCount = 0;
    for (const query of queriesToRefresh) {
      try {
        log.info(`Background scraping: "${query}"`);
        await scraperOrchestrator.searchAcrossStores(query, { limit: 5 });
        refreshedCount++;
        // Polite delay between queries (2 seconds)
        await new Promise(r => setTimeout(r, 2000));
      } catch (err) {
        log.warn(`Background scrape failed for "${query}": ${err.message}`);
      }
    }

    log.info(`Background scraper job completed. Refreshed ${refreshedCount} queries.`);
  } catch (err) {
    log.error('Background scraper job error: ' + err.message);
  } finally {
    _running = false;
  }
};

const start = () => {
  const schedule = process.env.SCRAPER_JOB_CRON || '0 */3 * * *'; // Every 3 hours default
  if (!cron.validate(schedule)) {
    log.error(`Invalid SCRAPER_JOB_CRON: "${schedule}"`);
    return;
  }
  _task = cron.schedule(schedule, runPrioritizedScrape, {
    scheduled: true,
    timezone: process.env.CRON_TIMEZONE || 'Asia/Kolkata'
  });
  log.info(`Prioritized scraper job scheduled: "${schedule}"`);
};

const stop = () => {
  if (_task) {
    _task.destroy();
    _task = null;
    log.info('Prioritized scraper job stopped');
  }
};

module.exports = { start, stop, runNow: runPrioritizedScrape };
