'use strict';

const cheerio = require('cheerio');
const BaseProvider = require('../BaseProvider');

class MeeshoScraper extends BaseProvider {
  constructor() {
    super('meesho', 'Meesho', 'https://www.meesho.com', 'https://logo.clearbit.com/meesho.com');
  }

  async searchProducts(query, options = {}) {
    const t0 = Date.now();
    const q = encodeURIComponent(String(query).trim());
    const url = `https://www.meesho.com/search?q=${q}`;

    const res = await this.safeGet(url);

    if (!res.ok) {
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

    // Method 1: Check __NEXT_DATA__
    try {
      const nextDataStr = $('#__NEXT_DATA__').html();
      if (nextDataStr) {
        const parsed = JSON.parse(nextDataStr);
        const rawItems = parsed.props?.pageProps?.initialData?.products ||
                         parsed.props?.pageProps?.data?.products || [];

        for (const item of rawItems) {
          const title = item.name || item.title || '';
          const price = item.price || item.discountedPrice || 0;
          const mrp = item.mrp || item.originalPrice || price;
          const img = item.images?.[0] || item.productImage || null;
          const link = item.id ? `https://www.meesho.com/s/p/${item.id}` : this.homepage;

          if (title && price > 0) {
            products.push(this.normalizeProduct({
              title,
              price,
              mrp: mrp > price ? mrp : price,
              url: link,
              image: img,
              seller: 'Meesho',
              availability: 'In Stock'
            }));
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
    const res = await this.safeGet(url);
    if (!res.ok) {
      return { store: this.name, status: res.status, product: null };
    }
    const $ = cheerio.load(res.data);
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
