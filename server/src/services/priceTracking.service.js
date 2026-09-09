'use strict';

const { Op }          = require('sequelize');
const logger          = require('../utils/logger');
const providerManager = require('./providerManager.service');
const notifService    = require('./notification.service');
const ProductListing  = require('../models/ProductListing');
const PriceHistory    = require('../models/PriceHistory');
const PriceAlert      = require('../models/PriceAlert');
const Product         = require('../models/Product');
const User            = require('../models/User');

const log = logger.child('PriceTracking');
let _running = false;

const runPriceUpdate = async ({ batchSize = 50 } = {}) => {
  if (_running) { log.warn('Already running — skipping'); return { skipped: true, reason: 'Already running' }; }
  _running = true;
  const start = Date.now();
  const s = { started: new Date(start), processed: 0, updated: 0, unchanged: 0, errors: 0, alertsTriggered: 0 };

  try {
    log.info('Price update run started');
    let page = 0, hasMore = true;

    while (hasMore) {
      const listingsRaw = await ProductListing.findAll({
        where: { isActive: true },
        offset: page * batchSize,
        limit: batchSize
      });
      if (!listingsRaw.length) { hasMore = false; break; }

      const listings = listingsRaw.map(l => l.toJSON());
      await Promise.allSettled(listings.map(l => _processListing(l, s)));
      s.processed += listings.length;
      page++;
      if (listings.length < batchSize) hasMore = false;
    }

    log.info('Price update run complete', s);
  } catch (e) {
    log.error('Price update run failed: ' + e.message);
    s.runError = e.message;
  } finally {
    _running = false;
    s.duration  = `${((Date.now() - start) / 1000).toFixed(1)}s`;
    s.completed = new Date();
  }
  return s;
};

const isRunning = () => _running;

const _processListing = async (listing, s) => {
  try {
    const provider = providerManager.getProvider(listing.provider);
    if (!provider || !provider.isEnabled() || !provider.isConfigured()) return;

    const cur = await provider.getCurrentPrice(listing.providerProductId);
    const newPrice   = cur.price;
    const newOrig    = cur.originalPrice || newPrice;
    const newShip    = cur.shippingCost  ?? listing.shippingCost ?? 0;
    const newAvail   = cur.availability  !== false;

    if (newPrice === listing.price && newAvail === listing.availability) { s.unchanged++; return; }

    const item = await ProductListing.findByPk(listing.id);
    if (item) {
      await item.update({
        price: newPrice,
        originalPrice: newOrig,
        discount: newOrig > newPrice ? Math.round(((newOrig - newPrice) / newOrig) * 100) : 0,
        shippingCost: newShip,
        availability: newAvail,
        lastUpdated: new Date()
      });
    }

    await PriceHistory.create({
      productListingId: listing.id,
      productId: listing.productId,
      provider: listing.provider,
      price: newPrice,
      originalPrice: newOrig,
      shippingCost: newShip,
      discount: cur.discount || 0,
      availability: newAvail,
      date: new Date()
    });

    await _refreshSummary(listing.productId);
    s.alertsTriggered += await _checkAlerts(listing.productId, newPrice + newShip);
    s.updated++;
  } catch (e) { log.warn(`Listing ${listing.id} error: ${e.message}`); s.errors++; }
};

const _refreshSummary = async (productId) => {
  try {
    const lsRaw = await ProductListing.findAll({
      where: { productId, isActive: true, availability: true },
      attributes: ['price', 'shippingCost']
    });
    if (!lsRaw.length) return;
    const ls = lsRaw.map(l => l.toJSON());
    const totals = ls.map(l => l.price + (l.shippingCost || 0));
    const prod = await Product.findByPk(productId);
    if (prod) {
      await prod.update({ lowestPrice: Math.min(...totals), highestPrice: Math.max(...totals) });
    }
  } catch { /* non-critical */ }
};

const _checkAlerts = async (productId, totalCost) => {
  let triggered = 0;
  try {
    const alerts = await PriceAlert.findAll({
      where: { productId, isActive: true, notificationSent: false, targetPrice: { [Op.gte]: totalCost } }
    });
    for (const alert of alerts) {
      try {
        const user = await User.findByPk(alert.userId);
        const alertJson = alert.toJSON();
        alertJson.userId = user ? user.toPublicJSON() : null;

        await notifService.sendPriceDropAlert(alertJson, totalCost);
        await alert.update({
          notificationSent: true,
          notificationSentAt: new Date(),
          currentPrice: totalCost,
          isActive: alert.retriggerAfterDays ? true : false
        });
        triggered++;
      } catch (e) { log.warn(`Alert ${alert.id} notify error: ${e.message}`); }
    }
  } catch (e) { log.warn(`Alert check error for ${productId}: ${e.message}`); }
  return triggered;
};

module.exports = { runPriceUpdate, isRunning };
