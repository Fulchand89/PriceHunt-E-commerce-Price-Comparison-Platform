'use strict';

const cheerio = require('cheerio');
const BaseProvider = require('../BaseProvider');

class RelianceDigitalScraper extends BaseProvider {
  constructor() {
    super('reliancedigital', 'Reliance Digital', 'https://www.reliancedigital.in', 'https://logo.clearbit.com/reliancedigital.in');
  }

  async searchProducts(query, options = {}) {
    const t0 = Date.now();
    const q = encodeURIComponent(String(query).trim());
    const url = `https://www.reliancedigital.in/search?q=${q}`;

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

    $('.sp__product, .product-card, div.plp__container li, div[data-testid="product-card"]').each((_, el) => {
      const $el = $(el);
      const title = $el.find('.sp__name, .product-title, h3, a.sp__name').first().text().trim();
      const priceText = $el.find('.sp__price, .gKNbTv, .TextWeb__Text-sc-1cyx778-0').first().text().replace(/[^\d]/g, '');
      const mrpText = $el.find('.sp__mrp, .mrp-price').first().text().replace(/[^\d]/g, '');
      const img = $el.find('img').attr('data-srcset') || $el.find('img').attr('src') || null;
      let link = $el.find('a').attr('href');

      if (title && priceText) {
        const price = parseInt(priceText, 10);
        const mrp = mrpText ? parseInt(mrpText, 10) : price;
        const cleanUrl = link ? (link.startsWith('http') ? link : `https://www.reliancedigital.in${link}`) : this.homepage;

        products.push(this.normalizeProduct({
          title,
          price,
          mrp: mrp > price ? mrp : price,
          url: cleanUrl,
          image: img,
          seller: 'Reliance Digital',
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
    const title = $('h1.pdp__title').text().trim();
    const priceText = $('span.pdp__offerPrice').text().replace(/[^\d]/g, '');
    const mrpText = $('span.pdp__mrpPrice').text().replace(/[^\d]/g, '');
    const img = $('div.pdp__mainImage img').attr('src') || null;

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
        seller: 'Reliance Digital',
        availability: 'In Stock'
      }),
      durationMs: Date.now() - t0,
      scrapedAt: new Date().toISOString()
    };
  }
}

module.exports = RelianceDigitalScraper;
