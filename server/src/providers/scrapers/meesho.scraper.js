'use strict';

const cheerio = require('cheerio');
const BaseProvider = require('../BaseProvider');

class MeeshoScraper extends BaseProvider {
  constructor() {
    super('meesho', 'Meesho', 'https://www.meesho.com', 'https://logo.clearbit.com/meesho.com');
  }

  getBrowserHeaders() {
    return {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate',
      'Sec-Ch-Ua': '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1'
    };
  }

  async searchProducts(query, options = {}) {
    const t0 = Date.now();
    const q = String(query || '').trim();
    if (!q) {
      return { store: this.name, status: 'unavailable', productsFound: 0, products: [] };
    }

    const encodedQ = encodeURIComponent(q);
    const url = `https://www.meesho.com/search?q=${encodedQ}`;

    const res = await this.safeGet(url, { headers: this.getBrowserHeaders() });

    if (!res.ok) {
      this.log.warn(`Meesho search unavailable (status=${res.status}) for query="${q}"`);
      return {
        store: this.name,
        status: res.status === 'blocked' ? 'blocked' : (res.status === 'timeout' ? 'timeout' : 'unavailable'),
        productsFound: 0,
        products: [],
        durationMs: Date.now() - t0,
        scrapedAt: new Date().toISOString()
      };
    }

    const $ = cheerio.load(res.data);
    const products = [];

    // Method 1: Extract from __NEXT_DATA__ JSON (Meesho is a Next.js app)
    try {
      const nextDataStr = $('#__NEXT_DATA__').html();
      if (nextDataStr) {
        const parsed = JSON.parse(nextDataStr);
        const rawItems =
          parsed.props?.pageProps?.initialData?.products ||
          parsed.props?.pageProps?.data?.products ||
          parsed.props?.pageProps?.searchResults?.products ||
          [];

        for (const item of rawItems) {
          const title = item.name || item.title || '';
          const price = Number(item.price || item.discountedPrice || 0);
          const mrp = Number(item.mrp || item.originalPrice || price);
          const rating = item.rating != null ? Number(item.rating) : null;
          const reviewCount = item.ratingCount != null ? Number(item.ratingCount) : null;
          const img = (Array.isArray(item.images) ? item.images[0] : null) || item.productImage || null;
          const productId = String(item.id || item.productId || '');
          const link = productId ? `https://www.meesho.com/s/p/${productId}` : this.homepage;

          const discount = mrp > price && mrp > 0
            ? Math.round(((mrp - price) / mrp) * 100)
            : (Number(item.discount) || 0);

          if (title && price > 0) {
            const norm = this.normalizeProduct({
              title,
              price,
              mrp: mrp > price ? mrp : price,
              originalPrice: mrp > price ? mrp : price,
              discount,
              url: link,
              image: img,
              rating,
              reviewCount,
              seller: 'Meesho',
              availability: 'In Stock'
            });
            norm.productId = productId || norm.productId;
            norm.id = productId || norm.id;
            products.push(norm);
          }
          if (options.limit && products.length >= options.limit) break;
        }
      }
    } catch {
      // Fall through to DOM parsing
    }

    // Method 2: DOM parsing fallback
    if (products.length === 0) {
      $('div[data-testid="product-card"], a[href*="/p/"]').each((_, el) => {
        const $el = $(el);
        const title = $el.find('p, h5, span').first().text().trim();
        const priceText = $el.find('h5, h4, [class*="Price"]').text().replace(/[^\d]/g, '');
        const img = $el.find('img').attr('src') || null;
        let link = $el.attr('href') || $el.find('a').attr('href');

        if (title && priceText && title.length > 3) {
          const price = parseInt(priceText, 10);
          if (isNaN(price) || price <= 0) return;
          const cleanUrl = link ? (link.startsWith('http') ? link : `https://www.meesho.com${link}`) : this.homepage;

          products.push(this.normalizeProduct({
            title,
            price,
            mrp: price,
            url: cleanUrl,
            image: img,
            seller: 'Meesho',
            availability: 'In Stock'
          }));

          if (options.limit && products.length >= options.limit) return false;
        }
      });
    }

    this.log.info(`Meesho search "${q}" → ${products.length} products in ${Date.now() - t0}ms`);

    const status = products.length > 0 ? 'success' : 'unavailable';
    return {
      store: this.name,
      status,
      productsFound: products.length,
      products,
      durationMs: Date.now() - t0,
      scrapedAt: new Date().toISOString()
    };
  }

  async getProductDetails(url) {
    const t0 = Date.now();
    const res = await this.safeGet(url, { headers: this.getBrowserHeaders() });
    if (!res.ok) {
      return { store: this.name, status: res.status, product: null };
    }

    const $ = cheerio.load(res.data);

    // Method 1: __NEXT_DATA__ JSON (preferred)
    try {
      const nextDataStr = $('#__NEXT_DATA__').html();
      if (nextDataStr) {
        const parsed = JSON.parse(nextDataStr);
        const item =
          parsed.props?.pageProps?.productData ||
          parsed.props?.pageProps?.data?.product ||
          parsed.props?.pageProps?.initialData?.product ||
          null;

        if (item) {
          const title = item.name || item.title || '';
          const price = Number(item.price || item.discountedPrice || 0);
          const mrp = Number(item.mrp || item.originalPrice || price);
          const img = (Array.isArray(item.images) ? item.images[0] : null) || item.productImage || null;
          const rating = item.rating != null ? Number(item.rating) : null;
          const reviewCount = item.ratingCount != null ? Number(item.ratingCount) : null;
          const productId = String(item.id || item.productId || '');
          const discount = mrp > price && mrp > 0
            ? Math.round(((mrp - price) / mrp) * 100)
            : (Number(item.discount) || 0);

          if (title && price > 0) {
            const norm = this.normalizeProduct({
              title, price,
              mrp: mrp > price ? mrp : price,
              originalPrice: mrp > price ? mrp : price,
              discount, url, image: img,
              rating, reviewCount,
              seller: 'Meesho',
              availability: 'In Stock'
            });
            norm.productId = productId || norm.productId;
            norm.id = productId || norm.id;
            return {
              store: this.name,
              status: 'success',
              product: norm,
              durationMs: Date.now() - t0,
              scrapedAt: new Date().toISOString()
            };
          }
        }
      }
    } catch {
      // Fall through to DOM
    }

    // Method 2: DOM fallback
    const title = $('h1').first().text().trim();
    const priceText = $('h4').first().text().replace(/[^\d]/g, '');

    if (!title || !priceText) {
      return { store: this.name, status: 'partial', product: null };
    }

    const price = parseInt(priceText, 10);

    return {
      store: this.name,
      status: 'success',
      product: this.normalizeProduct({
        title,
        price,
        mrp: price,
        url,
        seller: 'Meesho',
        availability: 'In Stock'
      }),
      durationMs: Date.now() - t0,
      scrapedAt: new Date().toISOString()
    };
  }
}

module.exports = MeeshoScraper;
