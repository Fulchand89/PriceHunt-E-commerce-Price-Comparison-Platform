'use strict';

const cheerio = require('cheerio');
const BaseProvider = require('../BaseProvider');

class CromaScraper extends BaseProvider {
  constructor() {
    super('croma', 'Croma', 'https://www.croma.com', 'https://logo.clearbit.com/croma.com');
  }

  async searchProducts(query, options = {}) {
    const t0 = Date.now();
    const q = encodeURIComponent(String(query).trim());
    const url = `https://www.croma.com/searchB?q=${q}`;

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

    // Parse product cards or JSON-LD
    $('li.product-item, div.cp-product, div[data-testid="product-card"]').each((_, el) => {
      const $el = $(el);
      const title = $el.find('h3.product-title, .product-title a, a[data-testid="product-title"]').first().text().trim();
      const priceText = $el.find('.amount, .new-price, span[data-testid="new-price"]').first().text().replace(/[^\d]/g, '');
      const mrpText = $el.find('.old-price, span[data-testid="old-price"]').first().text().replace(/[^\d]/g, '');
      const img = $el.find('img').attr('src') || $el.find('img').attr('data-src') || null;
      let link = $el.find('a[href*="/p/"], a.product-title').attr('href');

      if (title && priceText) {
        const price = parseInt(priceText, 10);
        const mrp = mrpText ? parseInt(mrpText, 10) : price;
        const cleanUrl = link ? (link.startsWith('http') ? link : `https://www.croma.com${link}`) : this.homepage;

        products.push(this.normalizeProduct({
          title,
          price,
          mrp: mrp > price ? mrp : price,
          url: cleanUrl,
          image: img,
          seller: 'Croma',
          availability: 'In Stock'
        }));

        if (options.limit && products.length >= options.limit) return false;
      }
    });

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
    const title = $('h1.pd-title').text().trim();
    const priceText = $('span.amount').first().text().replace(/[^\d]/g, '');
    const mrpText = $('span.old-price').first().text().replace(/[^\d]/g, '');
    const img = $('div.product-zoom img').attr('src') || null;

    if (!title || !priceText) {
      return { store: this.name, status: 'partial', product: null };
    }

    const price = parseInt(priceText, 10);
    const mrp = mrpText ? parseInt(mrpText, 10) : price;

    return {
      store: this.name,
      status: 'success',
      product: this.normalizeProduct({
        title,
        price,
        mrp,
        url,
        image: img,
        seller: 'Croma',
        availability: 'In Stock'
      }),
      durationMs: Date.now() - t0,
      scrapedAt: new Date().toISOString()
    };
  }
}

module.exports = CromaScraper;
