'use strict';

const cheerio = require('cheerio');
const BaseProvider = require('../BaseProvider');

class FlipkartScraper extends BaseProvider {
  constructor() {
    super('flipkart', 'Flipkart', 'https://www.flipkart.com', 'https://logo.clearbit.com/flipkart.com');
  }

  getBrowserHeaders() {
    return {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-IN,en-GB;q=0.9,en;q=0.8',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    };
  }

  extractPid(url = '') {
    if (!url) return null;
    const pidMatch = url.match(/[?&]pid=([A-Z0-9]{10,16})/i) || url.match(/\/p\/([a-z0-9]+)/i);
    return pidMatch ? pidMatch[1] : null;
  }

  async searchProducts(query, options = {}) {
    const t0 = Date.now();
    const q = encodeURIComponent(String(query).trim());
    const url = `https://www.flipkart.com/search?q=${q}`;

    const res = await this.safeGet(url, {
      headers: this.getBrowserHeaders()
    });

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
    const seenTitles = new Set();

    // Method 1: Extract from window.__INITIAL_STATE__ if available
    try {
      const match = html.match(/window\.__INITIAL_STATE__\s*=\s*(\{.+?\});<\/script>/s);
      if (match) {
        const state = JSON.parse(match[1]);
        const pageData = state.pageDataV4 || state.pageData || {};

        const walk = (obj) => {
          if (!obj || typeof obj !== 'object') return;
          if (obj.type === 'ProductSummaryValue' || (obj.titles && obj.pricing)) {
            const title = obj.titles?.title || obj.title || '';
            const price = obj.pricing?.finalPrice?.value || obj.pricing?.prices?.[0]?.value || 0;
            const mrp = obj.pricing?.mrp?.value || price;
            const urlPath = obj.baseUrl || obj.action?.url || '';
            const img = obj.images?.[0]?.url || obj.media?.images?.[0]?.url || null;
            const rating = obj.rating?.average || null;
            const reviewCount = obj.rating?.count || null;
            const pid = this.extractPid(urlPath) || obj.id || null;

            if (title && price > 0 && !seenTitles.has(title.toLowerCase())) {
              seenTitles.add(title.toLowerCase());
              const fullImg = img ? img.replace('{@width}', '400').replace('{@height}', '400').replace('{@quality}', '70') : null;
              const productUrl = urlPath ? (urlPath.startsWith('http') ? urlPath : `https://www.flipkart.com${urlPath}`) : this.homepage;
              
              const norm = this.normalizeProduct({
                title,
                price,
                mrp: mrp > price ? mrp : price,
                url: productUrl,
                image: fullImg,
                rating,
                reviewCount,
                seller: 'Flipkart',
                availability: obj.availability?.displayState === 'OUT_OF_STOCK' ? 'Out of Stock' : 'In Stock'
              });
              norm.productId = pid || norm.providerProductId;
              norm.id = pid || norm.providerProductId;
              norm.fsn = pid;
              products.push(norm);
            }
          }
          for (const k of Object.keys(obj)) {
            if (options.limit && products.length >= options.limit) break;
            walk(obj[k]);
          }
        };
        walk(pageData);
      }
    } catch {
      // Fall through to DOM parsing
    }

    // Method 2: DOM parsing fallback if JSON walk yielded 0 products
    if (products.length === 0) {
      const $ = cheerio.load(html);

      $('a[href*="/p/"]').each((_, el) => {
        const $a = $(el);
        const href = $a.attr('href');
        if (!href) return;

        const $container = $a.closest('div[data-id], div._1AtVbE, div._75Wvv1') || $a.parent();
        const rawTitle = $a.text().trim().replace(/^Add to Compare/i, '');
        const titleMatch = rawTitle.match(/^(.*?)(?:\d\.\d\d+,\d+|\s*₹|$)/);
        const title = (titleMatch ? titleMatch[1] : rawTitle).trim();
        if (!title || title.length < 3 || seenTitles.has(title.toLowerCase())) return;

        const containerText = $container.text();
        const priceMatch = containerText.match(/₹\s*([0-9,]+)/);
        if (!priceMatch) return;

        const price = parseInt(priceMatch[1].replace(/,/g, ''), 10);
        if (isNaN(price) || price <= 0) return;

        seenTitles.add(title.toLowerCase());

        // Find MRP if present
        const mrpMatch = containerText.match(/₹\s*[0-9,]+\s*₹\s*([0-9,]+)/);
        const mrp = mrpMatch ? parseInt(mrpMatch[1].replace(/,/g, ''), 10) : price;

        const img = $a.find('img').attr('src') || $container.find('img').attr('src') || null;
        const cleanUrl = href.startsWith('http') ? href : `https://www.flipkart.com${href}`;
        const pid = this.extractPid(cleanUrl);

        // Rating parsing
        const ratingText = $container.find('div._3LWZlK, div.XqfdR6').text().trim();
        const rating = ratingText ? parseFloat(ratingText) : null;

        const norm = this.normalizeProduct({
          title,
          price,
          mrp: mrp > price ? mrp : price,
          url: cleanUrl.split('?')[0] || cleanUrl,
          image: img,
          rating,
          seller: 'Flipkart',
          availability: 'In Stock'
        });
        norm.productId = pid || norm.providerProductId;
        norm.id = pid || norm.providerProductId;
        norm.fsn = pid;
        products.push(norm);

        if (options.limit && products.length >= options.limit) return false;
      });
    }

    const status = products.length > 0 ? 'success' : (res.ok ? 'success' : 'unavailable');
    return {
      store: this.name,
      status,
      productsFound: products.length,
      products,
      durationMs: Date.now() - t0,
      scrapedAt: new Date().toISOString()
    };
  }

  async getProductDetails(urlOrId) {
    const t0 = Date.now();
    let url = urlOrId;
    if (!url.startsWith('http')) {
      url = `https://www.flipkart.com/product/p/item?pid=${urlOrId}`;
    }

    const res = await this.safeGet(url, {
      headers: this.getBrowserHeaders()
    });

    if (!res.ok) {
      return { store: this.name, status: res.status, product: null };
    }

    const $ = cheerio.load(res.data);
    const title = $('span.B_NuCI, h1.VU-ZEz, h1._2o3T4n').text().trim();
    const priceText = $('div._30jeq3._16Jk6d, div.Nx9bqj.CxhGGd').text().replace(/[^\d]/g, '');
    const mrpText = $('div._3I9_wc._2p6Xda, div.yRaY8j.A6+E6v').text().replace(/[^\d]/g, '');
    const img = $('img._396cs4._2amPTt._3qGmMb').attr('src') || $('img.DByuf4').attr('src') || null;

    if (!title || !priceText) {
      return { store: this.name, status: 'partial', product: null };
    }

    const price = parseInt(priceText, 10);
    const mrp = mrpText ? parseInt(mrpText, 10) : price;
    const pid = this.extractPid(url) || (urlOrId.startsWith('http') ? null : urlOrId);

    const ratingText = $('div._3LWZlK, div.XqfdR6').first().text().trim();
    const rating = ratingText ? parseFloat(ratingText) : null;

    const norm = this.normalizeProduct({
      title,
      price,
      mrp: mrp > price ? mrp : price,
      url,
      image: img,
      rating,
      seller: 'Flipkart',
      availability: 'In Stock'
    });
    norm.productId = pid || norm.providerProductId;
    norm.id = pid || norm.providerProductId;
    norm.fsn = pid;

    return {
      store: this.name,
      status: 'success',
      product: norm,
      durationMs: Date.now() - t0,
      scrapedAt: new Date().toISOString()
    };
  }
}

module.exports = FlipkartScraper;

