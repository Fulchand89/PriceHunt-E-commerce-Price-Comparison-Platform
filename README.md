# PriceHunt — Real-Time E-Commerce Price Comparison Platform

PriceHunt is a modern, production-ready e-commerce price comparison platform where shoppers search for products and compare **real prices, discounts, availability, ratings, and store deals** across 8 leading Indian e-commerce websites:

- **Amazon India**
- **Flipkart**
- **Croma**
- **Reliance Digital**
- **Vijay Sales**
- **Myntra**
- **AJIO**
- **Meesho**

The platform operates using a **server-side scraping architecture** on publicly accessible store pages without relying on paid or official e-commerce APIs.

---

## Key Features

1. **Zero Mock Data in Production Flow**: If a store blocks access or is unavailable, the UI clearly displays `Store unavailable`. Fake prices or dummy products are never generated.
2. **Variant-Aware Product Matcher**: Accurately matches identical products across different store titles while strictly preventing cross-variant merges (e.g., 128GB is never merged with 256GB; 8GB RAM is never merged with 12GB RAM).
3. **Price Comparison Engine**: Automatically calculates the Lowest Price, Highest Price, Best Deal, You Save amount, and sorts stores by lowest effective price.
4. **Price History Tracking**: Captures real price points over time and renders interactive 7d, 30d, 3m, 6m, and 1y charts based exclusively on collected history.
5. **Real-Time Price Alerts**: Users set target thresholds (e.g. "Alert me below ₹50,000") evaluated by automated background jobs.
6. **Prioritized Background Scraping**: `node-cron` scheduled jobs update products with active alerts, tracked wishlist items, and popular items with safe concurrency.
7. **Store Scraper Status Telemetry**: Search results clearly display live store status badges (`✓ Amazon`, `✓ Flipkart`, `✕ Croma (Unavailable)`) and data freshness timestamps ("Updated 3m ago").
8. **Admin Control Panel**: Store scraper toggles, health metrics, scraper logs, manual refresh triggers, and user management.

---

## Technology Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS, React Router 6, Redux Toolkit, Recharts, Lucide React icons.
- **Backend**: Node.js, Express.js, Axios, Cheerio, Mongoose, node-cron, Winston logger, Helmet, CORS, Express Rate Limiter.
- **Database**: MongoDB Atlas Cluster (`pricehunt` database).

---

## Quick Start

### 1. Install Dependencies
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Run Database Migrations
```bash
cd server
npm run migrate
```

### 3. Run Automated Tests
```bash
cd server
npm test
```

### 4. Run Development Servers
```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

---

## Documentation Links

- [Project Audit (Phase 0)](./PROJECT_AUDIT.md)
- [Scraper Architecture Documentation](./SCRAPER_DOCUMENTATION.md)
- [Deployment Guide](./DEPLOYMENT.md)
