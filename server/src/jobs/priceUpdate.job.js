'use strict';

// Price Update Cron Job
// Schedule controlled by PRICE_UPDATE_CRON env var (default: every 30 min)
// Uses node-cron. Will not run in serverless environments — use the admin
// endpoint POST /api/admin/jobs/update-prices as an alternative trigger.

const cron   = require('node-cron');
const logger = require('../utils/logger');
const { runPriceUpdate } = require('../services/priceTracking.service');

const log = logger.child('PriceUpdateJob');
let _task = null;

const start = () => {
  const schedule = process.env.PRICE_UPDATE_CRON || '0 */2 * * *'; // every 2 hours default (safe default)

  if (!cron.validate(schedule)) {
    log.error(`Invalid PRICE_UPDATE_CRON: "${schedule}" — job not scheduled`);
    return;
  }

  _task = cron.schedule(schedule, async () => {
    log.info(`Cron triggered (${schedule})`);
    try {
      const summary = await runPriceUpdate({ batchSize: 50 });
      log.info('Price update complete', summary);
    } catch (e) {
      log.error('Price update job failed: ' + e.message);
    }
  }, {
    scheduled: true,
    timezone: process.env.CRON_TIMEZONE || 'Asia/Kolkata',
  });

  log.info(`Price update scheduled: "${schedule}"`);
};

const stop = () => {
  if (_task) { _task.destroy(); _task = null; log.info('Job stopped'); }
};

module.exports = { start, stop };
