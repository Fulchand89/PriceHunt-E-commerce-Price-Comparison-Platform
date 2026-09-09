# E-Commerce Price Comparison Platform — Project Audit (Phase 0)

**Date**: 2026-09-07  
**Scope**: Complete codebase inspection across `client/`, `server/`, configurations, models, routes, providers, scrapers, and data flows.

---

## 1. Current Architecture

```
User Browser / Mobile
       ↓
React 18 + Vite Frontend (SPA with Tailwind CSS & Redux Toolkit)
       ↓ (Axios HTTP API calls)
Node.js + Express REST API (Helmet, CORS, Rate Limiting, Winston Logger)
       ↓
Services & Providers Layer (ProviderManager, ProductMatcher, ProductSearch)
       ↓
MongoDB Atlas Cluster (`pricehunt` database via Mongoose 8.5)
       ↓
Node-Cron Background Jobs (Alerts, Price Tracking)
```

---

## 2. Directory Structure & Workspace Layout

| Directory / File | Status & Role | Observations |
| :--- | :--- | :--- |
| `client/` | **Active Frontend** | React 18, Vite 5, Tailwind CSS 3.4, React Router 6, Redux Toolkit, Recharts, Lucide icons. Complete storefront and admin layouts. |
| `server/` | **Active Backend** | Express 4.19, Mongoose 8.5, Cheerio 1.0, Axios 1.7, node-cron 3.0, bcryptjs, jsonwebtoken, helmet, cors. |
| `client-admin/` | **Redundant Stub** | Contains only a dummy `package.json`. Safe to ignore or prune in final cleanup. |
| `client-website/` | **Redundant Stub** | Contains only a dummy `package.json`. Safe to ignore or prune in final cleanup. |

---

## 3. Existing Backend Architecture

### 3.1 Backend Routes (`server/src/routes/`)
- `/api/auth` (`auth.routes.js`): Register, login, current user (`/me`), profile update, password reset.
- `/api/products` (`product.routes.js`): Trending products, product catalog, nested `/compare`, `/price-history`, details `/:id`.
- `/api/search` (`search.routes.js`): Search query endpoint (`/`), suggestions (`/suggestions`), history (`/history`).
- `/api/alerts` (`priceAlert.routes.js`): Price drop alerts CRUD.
- `/api/watchlist` (`watchlist.routes.js`): User wishlist/favorites.
- `/api/admin` (`admin.routes.js`): System metrics, user management, store toggles, cache purges.
- `/api/meta` (`meta.routes.js`): Categories, brands, stores, offers, banners, blogs, FAQs.
- `/api/notifications` (`notification.routes.js`): User alerts & in-app notifications.

### 3.2 MongoDB / Mongoose Models (`server/src/models/`)
- `User.js`: Authentication, roles (`user`, `admin`, `superadmin`), bcrypt password hashing, reset tokens.
- `Product.js`: Canonical product representation (`title`, `slug`, `normalizedTitle`, `brand`, `model`, `category`, `image`, `images`, `specifications`, `variants`, `lowestPrice`, `highestPrice`, `isActive`).
- `ProductListing.js`: Store-specific offer (`productId`, `provider`, `title`, `price`, `originalPrice`, `discount`, `availability`, `seller`, `productUrl`, `affiliateUrl`, `lastUpdated`).
- `Store.js`: Store metadata (`key`, `name`, `logo`, `websiteUrl`, `affiliateUrl`, `status`, `isActive`).
- `PriceHistory.js`: Historical price records (`productId`, `productListingId`, `provider`, `price`, `originalPrice`, `date`).
- `PriceAlert.js`: Target price thresholds and notification status (`userId`, `productId`, `targetPrice`, `currentPrice`, `isActive`, `notificationSent`).
- `ProductMatchQueue.js`: Low-confidence product pairs flagged for admin review.
- `SearchHistory.js`: User/IP search logs and provider success/failure arrays.
- `Settings.js`, `Provider.js`, `Category.js`, `Brand.js`, `Banner.js`, `BlogPost.js`, `FAQ.js`, `Offer.js`, `Seller.js`.

### 3.3 Existing Provider & Scraper Implementations (`server/src/providers/`)
- `base.provider.js`: Inherited by all store adapters. Contains `getMockSearch(query)` which generates synthetic prices and products when API keys are absent.
- `amazon.provider.js`: Previously attempted AWS PA-API 5.0 with credentials; fallback to `getMockSearch`.
- `flipkart.provider.js`, `croma.provider.js`, `relianceDigital.provider.js`, `vijaySales.provider.js`, `myntra.provider.js`, `ajio.provider.js`, `meesho.provider.js`: Configured with dummy headers (`x-api-key: process.env.*_API_KEY`) and fallback to `getMockSearch`.
- **Scraper scripts tested**:
  - Amazon India: Cheerio scraping successfully tested on `https://www.amazon.in/s?k=...` (17 real items retrieved with real prices).
  - Flipkart: Cheerio + `window.__INITIAL_STATE__` / DOM scraping successfully tested (24 real items retrieved with real prices).

### 3.4 Existing Background Jobs (`server/src/jobs/`)
- `priceUpdate.job.js`: Cron job scheduled via `PRICE_UPDATE_CRON` (default every 2 hours) triggering `priceTracking.service.js`.
- `alert.job.js`: Cron job scheduled via `ALERT_CHECK_CRON` (default every 5 min) evaluating active alerts against lowest listing prices.

---

## 4. Existing Frontend Architecture (`client/src/`)

### 4.1 Pages
- **Storefront**:
  - `HomePage.jsx`: Hero, live search bar, popular categories, featured comparisons, trending deals, download banner.
  - `SearchResultsPage.jsx`: Filter sidebar (Category, Brand, Price range, Store, Min discount), mobile filter drawer, sort options, product cards with lowest price & store counts.
  - `ProductDetailsPage.jsx`: Gallery, product summary, offer comparison table (`OfferTable.jsx`), interactive price history chart (`PriceHistoryChart.jsx`), technical specifications, price alert modal.
  - `PriceAlertsPage.jsx`, `WishlistPage.jsx`, `UserDashboardPage.jsx`, `LoginPage.jsx`, `RegisterPage.jsx`, `DealsPage.jsx`, `BlogPage.jsx`, `FAQPage.jsx`.
- **Admin**:
  - `AdminDashboardPage.jsx`: Analytics cards and charts (clicks, store distribution).
  - `AdminStoresPage.jsx`: E-commerce store management.
  - `AdminProductsPage.jsx`, `AdminPricesPage.jsx`, `AdminProductMatchingPage.jsx`, `AdminPriceAlertsPage.jsx`, `AdminUsersPage.jsx`, `AdminSettingsPage.jsx`.

### 4.2 Reusable UI Components
- `OfferTable.jsx`: Store breakdown table, highlighted lowest price, "Visit Store" affiliate redirect. Responsive mobile cards.
- `PriceHistoryChart.jsx`: Recharts area/line chart for price trends.
- `PriceAlertModal.jsx`: Modal to input target price.
- `MobileAppBanner.jsx` & `MobileBottomNav.jsx`: Mobile UX enhancements.

---

## 5. Mock / Demo Data Locations Identified

| Location | Mock Data Description | Required Action |
| :--- | :--- | :--- |
| `server/src/providers/base.provider.js` | `_getMockPriceFactor()` and `getMockSearch()` | **Remove completely**. |
| `server/src/providers/*.provider.js` | `if (this.isMockAllowed()) return this.getMockSearch()` | **Replace with real scraping logic**. |
| `server/src/config/providers.js` | `requiredEnvKeys: ['*_API_KEY']` | **Remove API key constraints**. |
| `server/src/services/providerManager.service.js` | `p.isMockAllowed()` checks | **Remove mock fallback branches**. |
| `server/src/models/Settings.js` | `enableMockProviders` boolean | **Deprecate / default to false**. |

---

## 6. Problems Found

1. **API Key Dependency & Mock Fallback**: All store adapters expected official API keys and defaulted to mock data generation.
2. **Missing Scraper Infrastructure**: No common `BaseScraper` class with retry, backoff, and polite headers.
3. **No Scraper Logs Model**: `ScraperLog` model did not exist to track store scrape health, duration, and error codes.
4. **Missing Store Status Reporting**: Search results returned results without real-time scraper statuses (`success`, `timeout`, `blocked`, `unavailable`).
5. **No Strict Storage/RAM Boundary in Product Matching**: Product matching could potentially merge 128GB and 256GB variants if tokens overlapped.
6. **Redundant Root Directories**: `client-admin/` and `client-website/` are empty placeholders.

---

## 7. Recommended Phased Migration Plan

- **Phase 1**: Implement `BaseScraper.js`, `ProviderManager.js` refactoring, and individual scraper stubs with common interface. Validate with live Amazon scraper.
- **Phase 2**: Implement and test each of the 8 scrapers sequentially (Amazon, Flipkart, Croma, Reliance Digital, Vijay Sales, Myntra, AJIO, Meesho) with independent failure handling.
- **Phase 3**: Add `ScraperLog.js` and update `Product`, `ProductListing`, `Store`, `PriceHistory` schemas and indexes.
- **Phase 4**: Implement variant-aware product matcher with strict storage, RAM, and color boundaries.
- **Phase 5**: Build search orchestrator with safe concurrency (3 workers) and graceful store degradation.
- **Phase 6**: Implement 10-minute cache TTL and data freshness indicators.
- **Phase 7 & 8**: Connect price comparison and product details pages with real store listings and direct URLs.
- **Phase 9**: Save actual `PriceHistory` records on every scrape.
- **Phase 10 & 11**: Connect background cron jobs (`node-cron`) for tracked products and real price alerts.
- **Phase 12**: Cleanly remove all mock generators and API key requirements.
- **Phase 13**: Update admin dashboard and store management panels with live scraper telemetry.
- **Phase 14 - 20**: Security hardening, frontend polish, SEO, automated testing, production readiness, and final cleanup.
