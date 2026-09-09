'use strict';

const { Op, Sequelize }   = require('sequelize');
const User               = require('../models/User');
const Product            = require('../models/Product');
const ProductListing     = require('../models/ProductListing');
const PriceAlert         = require('../models/PriceAlert');
const SearchHistory      = require('../models/SearchHistory');
const ProductMatchQueue  = require('../models/ProductMatchQueue');
const PriceHistory       = require('../models/PriceHistory');
const Settings           = require('../models/Settings');
const ScraperLog         = require('../models/ScraperLog');

const { success, paginated, notFound, error: apiErr } = require('../utils/apiResponse');
const { parsePagination, omitEmpty } = require('../utils/helpers');
const providerManager    = require('../services/providerManager.service');
const { runPriceUpdate, isRunning } = require('../services/priceTracking.service');
const { getRedisStatus }        = require('../config/redis');
const { getConnectionStatus }   = require('../config/database');
const logger = require('../utils/logger');
const log    = logger.child('AdminCtrl');

exports.getDashboard = async (req, res, next) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalUsers, activeUsers,
      totalProducts, activeProducts,
      totalListings,
      totalAlerts, activeAlerts,
      totalSearches,
      productsUpdatedToday,
      priceDropsToday,
      successfulScrapes,
      failedScrapes,
      recentSearchesRaw, topSearchesRaw,
      storeListingsAggRaw,
      recentLogsRaw
    ] = await Promise.all([
      User.count(), User.count({ where: { isActive: true } }),
      Product.count(), Product.count({ where: { isActive: true } }),
      ProductListing.count({ where: { isActive: true } }),
      PriceAlert.count(), PriceAlert.count({ where: { isActive: true } }),
      SearchHistory.count(),
      Product.count({ where: { lastScrapedAt: { [Op.gte]: startOfToday } } }),
      PriceHistory.count({ where: { discount: { [Op.gt]: 0 }, timestamp: { [Op.gte]: startOfToday } } }),
      ScraperLog.count({ where: { status: 'success' } }),
      ScraperLog.count({ where: { status: { [Op.in]: ['error', 'blocked', 'timeout'] } } }),
      SearchHistory.findAll({ order: [['searchedAt', 'DESC']], limit: 5, attributes: ['query', 'resultCount', 'searchedAt', 'fromCache'] }),
      SearchHistory.findAll({
        attributes: ['normalizedQuery', 'query', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
        where: { searchedAt: { [Op.gte]: sevenDaysAgo } },
        group: ['normalizedQuery', 'query'],
        order: [[Sequelize.literal('count'), 'DESC']],
        limit: 10
      }),
      ProductListing.findAll({
        attributes: ['provider', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
        group: ['provider']
      }),
      ScraperLog.findAll({ order: [['scrapedAt', 'DESC']], limit: 10 })
    ]);

    const totalScrapes = successfulScrapes + failedScrapes;
    const scraperSuccessRate = totalScrapes > 0 ? Math.round((successfulScrapes / totalScrapes) * 100) : 100;
    const activeStores = providerManager.getEnabled().length;

    const productsByStore = storeListingsAggRaw.map(s => {
      const p = s.getDataValue('provider');
      return {
        store: p ? p.charAt(0).toUpperCase() + p.slice(1) : 'Unknown',
        count: parseInt(s.getDataValue('count'), 10)
      };
    });

    const recentSearches = recentSearchesRaw.map(r => r.toJSON());
    const topSearches = topSearchesRaw.map(s => ({ query: s.getDataValue('query'), count: parseInt(s.getDataValue('count'), 10) }));
    const recentLogs = recentLogsRaw.map(l => l.toJSON());

    return success(res, {
      stats: {
        totalProducts,
        totalListings,
        activeStores,
        scraperSuccessRate,
        productsUpdatedToday,
        priceDropsToday,
        activeAlerts,
        failedScrapes,
        successfulScrapes,
        totalSearches,
        users: { total: totalUsers, active: activeUsers },
        products: { total: totalProducts, active: activeProducts, listings: totalListings },
        alerts: { total: totalAlerts, active: activeAlerts },
        searches: { total: totalSearches },
        providers: { active: activeStores, failed: failedScrapes, total: providerManager.getAll().length }
      },
      charts: {
        productsByStore,
        storePerformance: productsByStore.map(p => ({ store: p.store, clicks: p.count * 12 })),
        clickAnalytics: [
          { month: 'Jan', clicks: 120 }, { month: 'Feb', clicks: 240 },
          { month: 'Mar', clicks: 380 }, { month: 'Apr', clicks: 520 },
          { month: 'May', clicks: 640 }, { month: 'Jun', clicks: 890 }
        ]
      },
      recentSearches,
      topSearches,
      recentLogs,
      system: { database: getConnectionStatus(), cache: getRedisStatus(), priceUpdateRunning: isRunning() }
    });
  } catch (e) { next(e); }
};

exports.getScraperLogs = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const where = {};
    if (req.query.store) where.storeKey = req.query.store.toLowerCase();
    if (req.query.status) where.status = req.query.status.toLowerCase();

    const { rows: logs, count: total } = await ScraperLog.findAndCountAll({
      where,
      order: [['scrapedAt', 'DESC']],
      offset: skip,
      limit
    });
    return paginated(res, { data: logs.map(l => l.toJSON()), total, page, limit });
  } catch (e) { next(e); }
};

exports.refreshStoreScraper = async (req, res, next) => {
  try {
    const { store } = req.params;
    const scraper = providerManager.get(store);
    if (!scraper) return notFound(res, `Store scraper "${store}" not found`);

    const result = await scraper.searchProducts('iPhone 15', { limit: 5 });
    return success(res, { store: scraper.name, result }, 'Manual scrape refreshed');
  } catch (e) { next(e); }
};

exports.getUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const where = {};
    if (req.query.role)   where.role     = req.query.role;
    if (req.query.active) where.isActive = req.query.active === 'true';
    if (req.query.q) where[Op.or] = [{ name: { [Op.like]: `%${req.query.q}%` } }, { email: { [Op.like]: `%${req.query.q}%` } }];

    const { rows: users, count: total } = await User.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: skip,
      limit
    });

    return paginated(res, { data: users.map(u => u.toPublicJSON()), total, page, limit });
  } catch (e) { next(e); }
};

exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return notFound(res, 'User not found');
    return success(res, { user: user.toPublicJSON() });
  } catch (e) { next(e); }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id === req.user.id.toString() && req.body.isActive === false) return apiErr(res, 'Cannot deactivate own account', 400);
    const user = await User.findByPk(id);
    if (!user) return notFound(res, 'User not found');

    const updates = omitEmpty({ role: req.body.role, isActive: req.body.isActive });
    await user.update(updates);
    log.info(`User ${id} updated by admin ${req.user.id}`);
    return success(res, { user: user.toPublicJSON() }, 'User updated');
  } catch (e) { next(e); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id === req.user.id.toString()) return apiErr(res, 'Cannot delete own account', 400);
    const user = await User.findByPk(id);
    if (!user) return notFound(res, 'User not found');
    await user.destroy();
    await PriceAlert.destroy({ where: { userId: id } });
    log.warn(`User ${id} (${user.email}) deleted by admin ${req.user.id}`);
    return success(res, {}, 'User deleted');
  } catch (e) { next(e); }
};

exports.getProducts = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const where = {};
    if (req.query.active !== undefined) where.isActive = req.query.active !== 'false';
    if (req.query.brand)    where.brand    = { [Op.like]: `%${req.query.brand}%` };
    if (req.query.category) where.category = { [Op.like]: `%${req.query.category}%` };
    if (req.query.q) where[Op.or] = [{ title: { [Op.like]: `%${req.query.q}%` } }, { description: { [Op.like]: `%${req.query.q}%` } }];

    const { rows: productsRaw, count: total } = await Product.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: skip,
      limit
    });

    const enriched = await Promise.all(productsRaw.map(async p => {
      const pJson = p.toJSON();
      const listingCount = await ProductListing.count({ where: { productId: pJson.id, isActive: true } });
      return { ...pJson, listingCount };
    }));

    return paginated(res, { data: enriched, total, page, limit });
  } catch (e) { next(e); }
};

exports.getProviderStatuses = async (req, res, next) => {
  try { return success(res, { providers: await providerManager.getDetailedStatuses() }); }
  catch (e) { next(e); }
};

exports.toggleProvider = async (req, res, next) => {
  try {
    const { provider } = req.params;
    const { enabled }  = req.body;
    const result = await providerManager.toggleProvider(provider, enabled);
    if (!result) return notFound(res, `Provider "${provider}" not found`);
    log.info(`Provider "${provider}" ${enabled ? 'enabled' : 'disabled'} by admin ${req.user.id}`);
    return success(res, { provider: result }, `Provider ${enabled ? 'enabled' : 'disabled'}`);
  } catch (e) { if (e.message.includes('Unknown provider')) return notFound(res, e.message); next(e); }
};

exports.triggerPriceUpdate = async (req, res, next) => {
  try {
    if (isRunning()) return res.status(409).json({ success: false, message: 'Price update already running' });
    const batchSize = parseInt(req.body?.batchSize || '50', 10);
    runPriceUpdate({ batchSize }).then(s => log.info('Manual update done', s)).catch(e => log.error('Manual update failed: ' + e.message));
    return success(res, { started: true }, 'Price update job started');
  } catch (e) { next(e); }
};

exports.getPriceUpdateStatus = (_req, res) => success(res, { running: isRunning() });

exports.getSearchStats = async (req, res, next) => {
  try {
    const days  = parseInt(req.query.days || '7', 10);
    const since = new Date(); since.setDate(since.getDate() - days);

    const [topTermsRaw, dailyCountsRaw] = await Promise.all([
      SearchHistory.findAll({
        attributes: ['normalizedQuery', 'query', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
        where: { searchedAt: { [Op.gte]: since } },
        group: ['normalizedQuery', 'query'],
        order: [[Sequelize.literal('count'), 'DESC']],
        limit: 20
      }),
      SearchHistory.findAll({
        attributes: [
          [Sequelize.fn('DATE_FORMAT', Sequelize.col('searchedAt'), '%Y-%m-%d'), 'date'],
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        where: { searchedAt: { [Op.gte]: since } },
        group: [Sequelize.fn('DATE_FORMAT', Sequelize.col('searchedAt'), '%Y-%m-%d')],
        order: [[Sequelize.literal('date'), 'ASC']]
      })
    ]);

    return success(res, {
      period: `${days}d`,
      topTerms: topTermsRaw.map(t => ({ query: t.getDataValue('query'), count: parseInt(t.getDataValue('count'), 10) })),
      dailyCounts: dailyCountsRaw.map(d => ({ date: d.getDataValue('date'), count: parseInt(d.getDataValue('count'), 10) }))
    });
  } catch (e) { next(e); }
};

// ── PRODUCT MATCHING REVIEW QUEUE ───────────────────────────────────────────
exports.getProductMatchingQueue = async (req, res, next) => {
  try {
    const pending = await ProductMatchQueue.findAll({
      where: { status: 'pending' },
      order: [['confidenceScore', 'DESC']]
    });
    return res.status(200).json({
      success: true,
      data: pending.map(p => {
        const json = p.toJSON();
        return {
          id: json.id,
          matchScore: json.confidenceScore,
          productA: json.productA,
          productB: json.productB,
          breakdown: json.breakdown
        };
      }),
      threshold: 85
    });
  } catch (e) { next(e); }
};

exports.approveProductMatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await ProductMatchQueue.findByPk(id);
    if (!item) return notFound(res, 'Match request not found');
    await item.update({ status: 'approved', reviewedBy: req.user.id, reviewedAt: new Date() });
    return success(res, { item: item.toJSON() }, 'Match approved');
  } catch (e) { next(e); }
};

exports.rejectProductMatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await ProductMatchQueue.findByPk(id);
    if (!item) return notFound(res, 'Match request not found');
    await item.update({ status: 'rejected', reviewedBy: req.user.id, reviewedAt: new Date() });
    return success(res, { item: item.toJSON() }, 'Match rejected');
  } catch (e) { next(e); }
};

// ── PRICES & OFFERS ────────────────────────────────────────────────────────
exports.getPricesAdmin = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { rows: listingsRaw, count: total } = await ProductListing.findAndCountAll({
      order: [['updatedAt', 'DESC']],
      offset: skip,
      limit
    });

    const data = await Promise.all(listingsRaw.map(async l => {
      const lJson = l.toJSON();
      const product = await Product.findByPk(lJson.productId, { attributes: ['id', 'title'] });
      return {
        _id: lJson.id,
        id: lJson.id,
        product: { name: product?.title || lJson.title },
        store: { name: lJson.seller || lJson.provider },
        price: lJson.price,
        deliveryCharge: lJson.shippingCost || 0,
        finalPrice: lJson.price + (lJson.shippingCost || 0),
        discountPercentage: lJson.discount || 0
      };
    }));
    return paginated(res, { data, total, page, limit });
  } catch (e) { next(e); }
};

exports.updatePriceAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { price, deliveryCharge } = req.body;
    const listing = await ProductListing.findByPk(id);
    if (!listing) return notFound(res, 'Price listing not found');
    await listing.update({
      price: Number(price),
      shippingCost: Number(deliveryCharge || 0),
      lastUpdated: new Date()
    });
    return success(res, listing.toJSON(), 'Price updated');
  } catch (e) { next(e); }
};

exports.deletePriceAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const listing = await ProductListing.findByPk(id);
    if (listing) await listing.destroy();
    return success(res, {}, 'Price listing deleted');
  } catch (e) { next(e); }
};

exports.getOffersAdmin = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { rows: listingsRaw, count: total } = await ProductListing.findAndCountAll({
      order: [['updatedAt', 'DESC']],
      offset: skip,
      limit
    });
    const listings = listingsRaw.map(l => l.toJSON());
    return paginated(res, { data: listings, total, page, limit });
  } catch (e) { next(e); }
};

// ── PRICE ALERTS MONITORING ────────────────────────────────────────────────
exports.getPriceAlertsAdmin = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { rows: alertsRaw, count: total } = await PriceAlert.findAndCountAll({
      order: [['createdAt', 'DESC']],
      offset: skip,
      limit
    });

    const data = await Promise.all(alertsRaw.map(async a => {
      const aJson = a.toJSON();
      const [user, product] = await Promise.all([
        User.findByPk(aJson.userId, { attributes: ['id', 'name', 'email'] }),
        Product.findByPk(aJson.productId, { attributes: ['id', 'title', 'image', 'lowestPrice'] })
      ]);
      return {
        ...aJson,
        userId: user ? user.toPublicJSON() : null,
        productId: product ? product.toJSON() : null
      };
    }));

    return paginated(res, { data, total, page, limit });
  } catch (e) { next(e); }
};

// ── REPORTS & SETTINGS ─────────────────────────────────────────────────────
exports.getReportsAdmin = async (req, res, next) => {
  try {
    const [totalProducts, totalUsers, totalAlerts, totalSearches] = await Promise.all([
      Product.count(),
      User.count(),
      PriceAlert.count(),
      SearchHistory.count()
    ]);
    return success(res, {
      summary: { totalProducts, totalUsers, totalAlerts, totalSearches },
      generatedAt: new Date().toISOString()
    });
  } catch (e) { next(e); }
};

exports.getSettingsAdmin = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ siteName: 'PriceHunt', autoMatchThreshold: 85, searchCacheTTL: 600 });
    }
    return success(res, settings.toJSON());
  } catch (e) { next(e); }
};

exports.updateSettingsAdmin = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      await settings.update(req.body);
    }
    return success(res, settings.toJSON(), 'Settings updated');
  } catch (e) { next(e); }
};
