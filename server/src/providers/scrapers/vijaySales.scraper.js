'use strict';

const cheerio = require('cheerio');
const BaseProvider = require('../BaseProvider');

class VijaySalesScraper extends BaseProvider {
  constructor() {
    super('vijaysales', 'Vijay Sales', 'https://www.vijaysales.com', 'https://logo.clearbit.com/vijaysales.com');
  }

  async searchProducts(query, options = {}) {
    const t0 = Date.now();
    const q = encodeURIComponent(String(query).trim());
    const url = `https://www.vijaysales.com/search-result?q=${q}`;

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

    $('.product-card, .vj-product-card, div.vj-tile, div.product-box').each((_, el) => {
      const $el = $(el);
      const title = $el.find('h2, .product-title, .vj-title, a.title').first().text().trim();
      const priceText = $el.find('.price, .vj-price, .offer-price').first().text().replace(/[^\d]/g, '');
      const mrpText = $el.find('.mrp, .regular-price, .old-price').first().text().replace(/[^\d]/g, '');
      const img = $el.find('img').attr('data-src') || $el.find('img').attr('src') || null;
      let link = $el.find('a').attr('href');

      if (title && priceText) {
        const price = parseInt(priceText, 10);
        const mrp = mrpText ? parseInt(mrpText, 10) : price;
        const cleanUrl = link ? (link.startsWith('http') ? link : `https://www.vijaysales.com${link}`) : this.homepage;

        products.push(this.normalizeProduct({
          title,
          price,
          mrp: mrp > price ? mrp : price,
          url: cleanUrl,
          image: img,
          seller: 'Vijay Sales',
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
    const title = $('h1.product-name, h1.vj-product-name').text().trim();
    const priceText = $('.offer-price, .vj-offer-price').first().text().replace(/[^\d]/g, '');
    const mrpText = $('.mrp-price, .vj-mrp').first().text().replace(/[^\d]/g, '');
    const img = $('.product-image-slider img, .vj-pdp-img').attr('src') || null;

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
        seller: 'Vijay Sales',
        availability: 'In Stock'
      }),
      durationMs: Date.now() - t0,
      scrapedAt: new Date().toISOString()
    };
  }
}

module.exports = VijaySalesScraper;
