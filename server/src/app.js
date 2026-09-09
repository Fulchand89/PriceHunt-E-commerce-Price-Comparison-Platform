'use strict';

const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const path       = require('path');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi    = require('swagger-ui-express');

const { apiLimiter }    = require('./middleware/rateLimit.middleware');
const { notFoundHandler, globalErrorHandler } = require('./middleware/error.middleware');
const { getConnectionStatus } = require('./config/database');
const { getRedisStatus }      = require('./config/redis');
const providerManager         = require('./services/providerManager.service');

// ── Route imports ─────────────────────────────────────────────────────────────
const authRoutes      = require('./routes/auth.routes');
const searchRoutes    = require('./routes/search.routes');
const productRoutes   = require('./routes/product.routes');
const watchlistRoutes = require('./routes/watchlist.routes');
const alertRoutes     = require('./routes/priceAlert.routes');
const adminRoutes     = require('./routes/admin.routes');
const notificationRoutes = require('./routes/notification.routes');

const app = express();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production',
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGINS || process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',').map(o => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) return cb(null, true);
    cb(new Error(`CORS: "${origin}" not allowed`));
  },
  credentials:    true,
  methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.set('trust proxy', 1);

// ── Global rate limiter ───────────────────────────────────────────────────────
app.use('/api', apiLimiter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', async (_req, res) => {
  const db    = getConnectionStatus();
  const cache = getRedisStatus();
  const ok    = db.status === 'connected';
  return res.status(ok ? 200 : 503).json({
    success:   ok,
    status:    ok ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    database:  db.status,
    cache:     cache.mode,
    providers: providerManager.getAllProviderStatuses(),
  });
});

// ── Swagger docs ──────────────────────────────────────────────────────────────
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title:       'PriceHunt API',
      version:     '2.0.0',
      description: 'E-Commerce Price Comparison Platform — REST API',
    },
    servers: [{ url: '/api', description: 'Current server' }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  },
  apis: [path.join(__dirname, 'routes', '*.js')],
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'PriceHunt API Docs',
  swaggerOptions:  { persistAuthorization: true },
}));
app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

const metaRoutes      = require('./routes/meta.routes');
const mobileAppRoutes = require('./routes/mobileApp.routes');
const amazonRoutes    = require('./routes/amazonRoutes');
const flipkartRoutes  = require('./routes/flipkartRoutes');
const comparisonRoutes = require('./routes/comparison.routes');

// ── API Root Index & Welcome ───────────────────────────────────────────────────
app.get(['/', '/api'], (_req, res) => {
  return res.json({
    success: true,
    name: 'PriceHunt Price Comparison API',
    version: '2.0.0',
    status: 'running',
    docs: '/api-docs',
    health: '/health',
    endpoints: {
      amazonSearch: '/api/amazon/search?q=iphone',
      amazonProduct: '/api/amazon/product/:asin',
      flipkartSearch: '/api/flipkart/search?q=iphone',
      flipkartProduct: '/api/flipkart/product/:id',
      compareProduct: '/api/comparison/product/:id',
      compareAmazon: '/api/comparison/amazon/:asin',
      compareFlipkart: '/api/comparison/flipkart/:id',
      search: '/api/search?q=iphone',
      suggestions: '/api/search/suggestions?q=iphone',
      products: '/api/products',
      categories: '/api/categories',
      stores: '/api/stores',
      brands: '/api/brands',
      coupons: '/api/coupons',
      offers: '/api/offers'
    }
  });
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/amazon',        amazonRoutes);
app.use('/api/flipkart',      flipkartRoutes);
app.use('/api/comparison',    comparisonRoutes);
app.use('/api/auth',          authRoutes);
app.use('/api/search',        searchRoutes);
app.use('/api/products',      productRoutes);
app.use('/api/watchlist',     watchlistRoutes);
app.use('/api/price-alerts',  alertRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/app',           mobileAppRoutes);

// Meta routes: /api/categories, /api/brands, /api/stores
app.use('/api',               metaRoutes);

// ── 404 + error handlers (must be last) ──────────────────────────────────────
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
