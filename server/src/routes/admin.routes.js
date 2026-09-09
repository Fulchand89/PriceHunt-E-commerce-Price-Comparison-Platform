'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/admin.controller');
const { protect }           = require('../middleware/auth.middleware');
const { requireAdmin }      = require('../middleware/admin.middleware');
const { validate, schemas } = require('../middleware/validation.middleware');
const { adminLimiter }      = require('../middleware/rateLimit.middleware');

router.use(protect, requireAdmin, adminLimiter);

// Dashboard
router.get('/dashboard',                     ctrl.getDashboard);

// Users
router.get('/users',                         ctrl.getUsers);
router.get('/users/:id',                     ctrl.getUserById);
router.put('/users/:id',                     validate(schemas.adminUserUpdate), ctrl.updateUser);
router.delete('/users/:id',                  ctrl.deleteUser);

// Products
router.get('/products',                      ctrl.getProducts);

// Product Matching Review Queue
router.get('/product-matching',              ctrl.getProductMatchingQueue);
router.post('/product-matching/:id/approve', ctrl.approveProductMatch);
router.post('/product-matching/:id/reject',  ctrl.rejectProductMatch);

// Providers
router.get('/providers/status',              ctrl.getProviderStatuses);
router.put('/providers/:provider/toggle',    validate(schemas.toggleProvider), ctrl.toggleProvider);

// Prices, Offers, Price Alerts, Reports & Settings
router.get('/prices',                        ctrl.getPricesAdmin);
router.put('/prices/:id',                    ctrl.updatePriceAdmin);
router.delete('/prices/:id',                 ctrl.deletePriceAdmin);
router.get('/offers',                        ctrl.getOffersAdmin);
router.get('/price-alerts',                  ctrl.getPriceAlertsAdmin);
router.get('/reports',                       ctrl.getReportsAdmin);
router.get('/settings',                      ctrl.getSettingsAdmin);
router.put('/settings',                      ctrl.updateSettingsAdmin);

// Jobs
router.post('/jobs/update-prices',           ctrl.triggerPriceUpdate);
router.get('/jobs/update-prices/status',     ctrl.getPriceUpdateStatus);

// Scraper Telemetry & Control
router.get('/scrapers/logs',                 ctrl.getScraperLogs);
router.post('/scrapers/:store/refresh',      ctrl.refreshStoreScraper);

// Search analytics
router.get('/search-stats',                  ctrl.getSearchStats);

module.exports = router;
