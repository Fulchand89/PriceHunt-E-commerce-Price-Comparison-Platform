'use strict';

// Load .env from server root (one level up from src/)
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const app              = require('./app');
const { connectDB }    = require('./config/database');
const { connectRedis } = require('./config/redis');
const providerManager  = require('./services/providerManager.service');
const priceUpdateJob   = require('./jobs/priceUpdate.job');
const alertJob         = require('./jobs/alert.job');
const scraperJob       = require('./jobs/scraper.job');
const logger           = require('./utils/logger');

const { seedInitialData } = require('./utils/seeder');

const PORT = parseInt(process.env.PORT || '5000', 10);
const log  = logger.child('Server');

// ── Graceful shutdown ─────────────────────────────────────────────────────────
const shutdown = (signal) => {
  log.info(`${signal} — shutting down`);
  priceUpdateJob.stop();
  alertJob.stop();
  scraperJob.stop();
  process.exit(0);
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

process.on('unhandledRejection', reason => {
  log.error('Unhandled rejection: ' + (reason?.stack || String(reason)));
});
process.on('uncaughtException', err => {
  log.error('Uncaught exception: ' + (err?.stack || err.message));
});

// ── Bootstrap ─────────────────────────────────────────────────────────────────
const bootstrap = async () => {
  // 1. MySQL Database on Port 3308 (required)
  try {
    await connectDB();
    await seedInitialData();
  } catch (err) {
    log.error('MySQL database connection failed: ' + err.message);
    process.exit(1);
  }

  // 2. Redis (optional — in-memory fallback if unavailable)
  await connectRedis();

  // 3. Provider adapters
  await providerManager.initialize();

  // 4. Background jobs (skip in test env)
  if (process.env.NODE_ENV !== 'test') {
    priceUpdateJob.start();
    alertJob.start();
    scraperJob.start();
  }

  // 5. Start HTTP server
  const server = app.listen(PORT, () => {
    log.info('================================================');
    log.info(`PriceHunt API  |  ${process.env.NODE_ENV || 'development'}  |  PORT ${PORT}`);
    log.info(`API Base   : http://localhost:${PORT}/api`);
    log.info(`Swagger    : http://localhost:${PORT}/api-docs`);
    log.info(`Health     : http://localhost:${PORT}/health`);
    log.info(`Client     : ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
    log.info('================================================');
  });

  server.keepAliveTimeout = 65_000;
  server.headersTimeout   = 66_000;
};

bootstrap().catch(err => {
  log.error('Bootstrap failed: ' + err.message);
  process.exit(1);
});
