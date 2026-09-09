'use strict';

const cheerio = require('cheerio');
const BaseProvider = require('../BaseProvider');

class MyntraScraper extends BaseProvider {
  constructor() {
    super('myntra', 'Myntra', 'https://www.myntra.com', 'https://logo.clearbit.com/myntra.com');
  }

  async searchProducts(query, options = {}) {
    const t0 = Date.now();
    const cleanQuery = String(query).trim().replace(/\s+/g, '-');
    const url = `https://www.myntra.com/${encodeURIComponent(cleanQuery)}`;

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

    // Method 1: parse window.__myx script object
    try {
      const scriptStart = html.indexOf('window.__myx =');
      if (scriptStart !== -1) {
        const jsonStart = html.indexOf('{', scriptStart);
        const scriptEnd = html.indexOf('</script>', scriptStart);
        if (jsonStart !== -1 && scriptEnd !== -1) {
          // Find the matching closing brace or slice up to the last semicolon
          let jsonCandidate = html.slice(jsonStart, scriptEnd).trim();
          if (jsonCandidate.endsWith(';')) jsonCandidate = jsonCandidate.slice(0, -1);

          const myx = JSON.parse(jsonCandidate);
          const rawItems = myx.searchData?.results?.products || [];

          for (const item of rawItems) {
            const title = `${item.brand || ''} ${item.productName || item.product || ''}`.trim();
            const price = Number(item.price) || 0;
            const mrp = Number(item.mrp) || price;
            const img = item.images?.[0]?.src || item.searchImage || null;
            const link = item.landingPageUrl ? `https://www.myntra.com/${item.landingPageUrl}` : this.homepage;

            if (title && price > 0) {
              products.push(this.normalizeProduct({
                title,
                price,
                mrp: mrp > price ? mrp : price,
                brand: item.brand || '',
                url: link,
                image: img,
                rating: item.rating != null ? parseFloat(item.rating) : null,
                reviewCount: item.ratingCount || null,
                seller: 'Myntra',
                availability: 'In Stock'
              }));
            }
            if (options.limit && products.length >= options.limit) break;
          }
        }
      }
    } catch {
      // Fall through to DOM parsing
    }

    // Method 2: DOM parsing fallback
    if (products.length === 0) {
      const $ = cheerio.load(html);
      $('li.product-base').each((_, el) => {
        const $el = $(el);
        const brand = $el.find('h3.product-brand').text().trim();
        const prod = $el.find('h4.product-product').text().trim();
        const title = `${brand} ${prod}`.trim();
        const priceText = $el.find('.product-discountedPrice').text().replace(/[^\d]/g, '') ||
                          $el.find('.product-price').text().replace(/[^\d]/g, '');
        const mrpText = $el.find('.product-strike').text().replace(/[^\d]/g, '');
        const img = $el.find('img').attr('src') || null;
        const href = $el.find('a').attr('href');

        if (title && priceText) {
          const price = parseInt(priceText, 10);
          const mrp = mrpText ? parseInt(mrpText, 10) : price;
          const cleanUrl = href ? (href.startsWith('http') ? href : `https://www.myntra.com/${href}`) : this.homepage;

          products.push(this.normalizeProduct({
            title,
            brand,
            price,
            mrp: mrp > price ? mrp : price,
            url: cleanUrl,
            image: img,
            seller: 'Myntra',
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
    const title = $('h1.pdp-title, h1.pdp-name').text().trim();
    const priceText = $('span.pdp-price strong').text().replace(/[^\d]/g, '');
    const mrpText = $('span.pdp-mrp s').text().replace(/[^\d]/g, '');
    const img = $('div.image-grid-image').attr('style') || $('img.image-grid-image').attr('src') || null;

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
        seller: 'Myntra',
        availability: 'In Stock'
      }),
      durationMs: Date.now() - t0,
      scrapedAt: new Date().toISOString()
    };
  }
}

module.exports = MyntraScraper;
