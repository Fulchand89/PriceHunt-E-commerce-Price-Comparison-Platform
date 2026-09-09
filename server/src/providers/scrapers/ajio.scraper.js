'use strict';

const cheerio = require('cheerio');
const BaseProvider = require('../BaseProvider');

class AjioScraper extends BaseProvider {
  constructor() {
    super('ajio', 'AJIO', 'https://www.ajio.com', 'https://logo.clearbit.com/ajio.com');
  }

  async searchProducts(query, options = {}) {
    const t0 = Date.now();
    const q = encodeURIComponent(String(query).trim());
    const url = `https://www.ajio.com/search/?text=${q}`;

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

    const html = res.data;
    const products = [];

    // Check window.__PRELOADED_STATE__
    try {
      const match = html.match(/window\.__PRELOADED_STATE__\s*=\s*(\{.+?\});<\/script>/s);
      if (match) {
        const state = JSON.parse(match[1]);
        const rawItems = state.grid?.entities || state.search?.results || [];
        for (const item of Object.values(rawItems)) {
          const title = `${item.brandName || ''} ${item.name || ''}`.trim();
          const price = item.price?.value || item.price || 0;
          const mrp = item.wasPriceData?.value || price;
          const img = item.images?.[0]?.url || item.fnlColorVariantData?.outfitPictureURL || null;
          const link = item.url ? `https://www.ajio.com${item.url}` : this.homepage;

          if (title && price > 0) {
            products.push(this.normalizeProduct({
              title,
              brand: item.brandName || '',
              price,
              mrp: mrp > price ? mrp : price,
              url: link,
              image: img,
              seller: 'AJIO',
              availability: 'In Stock'
            }));
          }
          if (options.limit && products.length >= options.limit) break;
        }
      }
    } catch {
      // Fall through to DOM parsing
    }

    // DOM fallback
    if (products.length === 0) {
      const $ = cheerio.load(html);
      $('div.item, div.rilrtl-products-list__item').each((_, el) => {
        const $el = $(el);
        const brand = $el.find('.brand').text().trim();
        const name = $el.find('.nameCls').text().trim();
        const title = `${brand} ${name}`.trim();
        const priceText = $el.find('.price').text().replace(/[^\d]/g, '');
        const mrpText = $el.find('.orginal-price').text().replace(/[^\d]/g, '');
        const img = $el.find('img.rilrtl-lazy-img').attr('src') || null;
        const link = $el.find('a').attr('href');

        if (title && priceText) {
          const price = parseInt(priceText, 10);
          const mrp = mrpText ? parseInt(mrpText, 10) : price;
          const cleanUrl = link ? (link.startsWith('http') ? link : `https://www.ajio.com${link}`) : this.homepage;

          products.push(this.normalizeProduct({
            title,
            brand,
            price,
            mrp: mrp > price ? mrp : price,
            url: cleanUrl,
            image: img,
            seller: 'AJIO',
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
    const brand = $('h2.brand-name').text().trim();
    const name = $('h1.prod-title').text().trim();
    const title = `${brand} ${name}`.trim();
    const priceText = $('div.prod-sp').text().replace(/[^\d]/g, '');
    const mrpText = $('span.prod-cp').text().replace(/[^\d]/g, '');
    const img = $('img.rilrtl-lazy-img').attr('src') || null;

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
        seller: 'AJIO',
        availability: 'In Stock'
      }),
      durationMs: Date.now() - t0,
      scrapedAt: new Date().toISOString()
    };
  }
}

module.exports = AjioScraper;
