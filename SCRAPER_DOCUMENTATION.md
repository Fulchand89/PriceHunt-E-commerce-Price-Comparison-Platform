# PriceHunt — Server-Side Scraper Architecture & Documentation

## Overview

PriceHunt utilizes a server-side scraping architecture for publicly accessible e-commerce pages. It does NOT depend on paid or official e-commerce APIs, nor does it employ CAPTCHA bypassing, IP proxy evasion, or access control circumvention.

---

## 1. Provider Architecture

```
server/src/providers/
├── BaseProvider.js               (Common base class with timeout, retry, backoff)
├── ProviderManager.js            (Registry & cross-store execution orchestrator)
├── index.js                      (Exports registered instances)
└── scrapers/
    ├── amazon.scraper.js         (Amazon India search & product parsing)
    ├── flipkart.scraper.js       (Flipkart search & product parsing)
    ├── croma.scraper.js          (Croma search & product parsing)
    ├── relianceDigital.scraper.js(Reliance Digital search & product parsing)
    ├── vijaySales.scraper.js     (Vijay Sales search & product parsing)
    ├── myntra.scraper.js         (Myntra search & product parsing)
    ├── ajio.scraper.js           (AJIO search & product parsing)
    └── meesho.scraper.js         (Meesho search & product parsing)
```

---

## 2. Common Scraper Interface

Every scraper extends `BaseProvider` and implements:

```javascript
searchProducts(query, options = {})
getProductDetails(url)
normalizeProduct(rawData)
```

### Standard Normalized Output Schema

```json
{
  "store": "Amazon",
  "storeKey": "amazon",
  "title": "Apple iPhone 15 (128 GB) - Black",
  "url": "https://www.amazon.in/dp/B0DXQH1DBS",
  "image": "https://m.media-amazon.com/images/I/61FMZ9rSZUL._AC_UY218_.jpg",
  "brand": "Apple",
  "model": "iPhone 15",
  "category": "Smartphones",
  "price": 57990,
  "mrp": 59900,
  "discount": 3,
  "currency": "INR",
  "availability": "In Stock",
  "rating": 4.5,
  "reviewCount": 1240,
  "variant": "128 GB",
  "seller": "Amazon",
  "scrapedAt": "2026-09-07T10:38:13.568Z"
}
```

### Standard Scraper Health Status

```json
{
  "store": "Amazon",
  "status": "success", // success | partial | timeout | blocked | unavailable | error
  "productsFound": 5,
  "durationMs": 2150,
  "scrapedAt": "2026-09-07T10:38:13.568Z"
}
```

---

## 3. Scraper Reliability & Safety Controls

1. **Timeout Handling**: Default 15-second timeout (`SCRAPER_TIMEOUT`). If an endpoint exceeds the limit, the scraper returns `status: "timeout"` and does not block other stores.
2. **Exponential Backoff**: Up to 2 retries for transient 5xx / connection reset errors with backoff delays of `500ms * 2^attempt`.
3. **Concurrency Limiting**: Handled by `SimpleQueue` in `scraperOrchestrator.service.js` with max 3 concurrent scraper tasks (`SCRAPER_CONCURRENCY=3`).
4. **Independent Failure Isolation**: All scrapers execute via `Promise.allSettled`. A 403/timeout on one store will never break the search for remaining stores.
5. **Caching & Deduplication**:
   - In-flight request deduplication prevents duplicate simultaneous queries.
   - 10-minute cache TTL (`SCRAPER_CACHE_TTL=600`) in Redis/MongoDB to minimize store hits.
6. **No Mock Fallbacks**: If a store blocks access or is unavailable, the system strictly returns `Store unavailable`. Fake prices are never generated.

---

## 4. How to Add a New Store Scraper

To add a 9th store (e.g., Tata CLiQ):

1. Create `server/src/providers/scrapers/tatacliq.scraper.js` extending `BaseProvider`:
   ```javascript
   const BaseProvider = require('../BaseProvider');

   class TataCliqScraper extends BaseProvider {
     constructor() {
       super('tatacliq', 'Tata CLiQ', 'https://www.tatacliq.com');
     }

     async searchProducts(query, options = {}) {
       // Perform safeGet, Cheerio/JSON extraction, and return normalized items
     }
   }
   module.exports = TataCliqScraper;
   ```
2. Register the scraper in `server/src/providers/index.js`:
   ```javascript
   const TataCliqScraper = require('./scrapers/tatacliq.scraper');
   providerManager.register('tatacliq', new TataCliqScraper());
   ```
3. Add store metadata to `server/src/config/providers.js`.
