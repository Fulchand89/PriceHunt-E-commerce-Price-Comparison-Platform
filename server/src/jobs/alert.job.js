'use strict';

const cron           = require('node-cron');
const logger         = require('../utils/logger');
const PriceAlert     = require('../models/PriceAlert');
const ProductListing = require('../models/ProductListing');
const User           = require('../models/User');
const notifService   = require('../services/notification.service');

const log = logger.child('AlertJob');
let _task    = null;
let _running = false;

const _run = async () => {
  if (_running) return;
  _running = true;
  const s = { checked: 0, triggered: 0, errors: 0 };
  try {
    const alerts = await PriceAlert.findAll({ where: { isActive: true, notificationSent: false } });
    s.checked = alerts.length;
    if (!alerts.length) { _running = false; return; }

    await Promise.allSettled(alerts.map(async alert => {
      try {
        const where = { productId: alert.productId, availability: true, isActive: true };
        if (alert.provider) where.provider = alert.provider;

        const best = await ProductListing.findOne({
          where,
          order: [['price', 'ASC']],
          attributes: ['price', 'shippingCost']
        });
        if (!best) return;

        const total = best.price + (best.shippingCost || 0);
        if (total <= alert.targetPrice) {
          const user = await User.findByPk(alert.userId);
          const alertJson = alert.toJSON();
          alertJson.userId = user ? user.toPublicJSON() : null;

          await notifService.sendPriceDropAlert(alertJson, total);
          await alert.update({
            notificationSent: true,
            notificationSentAt: new Date(),
            currentPrice: total,
            isActive: alert.retriggerAfterDays ? true : false
          });
          s.triggered++;
        } else {
          await alert.update({ currentPrice: total });
        }
      } catch (e) { s.errors++; log.warn(`Alert ${alert.id} error: ${e.message}`); }
    }));

    if (s.triggered) log.info('Alerts checked', s);
  } catch (e) {
    log.error('Alert job failed: ' + e.message);
  } finally {
    _running = false;
  }
};

const start = () => {
  const schedule = process.env.ALERT_CHECK_CRON || '*/5 * * * *';
  if (!cron.validate(schedule)) { log.error(`Invalid ALERT_CHECK_CRON: "${schedule}"`); return; }
  _task = cron.schedule(schedule, _run, { scheduled: true, timezone: process.env.CRON_TIMEZONE || 'Asia/Kolkata' });
  log.info(`Alert check scheduled: "${schedule}"`);
};

const stop = () => { if (_task) { _task.destroy(); _task = null; } };
const runNow = () => _run();

module.exports = { start, stop, runNow };
