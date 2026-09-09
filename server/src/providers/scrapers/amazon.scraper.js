'use strict';

const cheerio = require('cheerio');
const BaseProvider = require('../BaseProvider');

class AmazonScraper extends BaseProvider {
  constructor() {
    super('amazon', 'Amazon', 'https://www.amazon.in', 'https://logo.clearbit.com/amazon.in');
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
    const url = `https://www.amazon.in/s?k=${encodedQ}`;

    const res = await this.safeGet(url, {
      headers: this.getBrowserHeaders()
    });

    const products = [];

    if (res.ok && res.data) {
      const $ = cheerio.load(res.data);

      $('div[data-component-type="s-search-result"]').each((_, el) => {
        const asin = $(el).attr('data-asin');
        if (!asin || asin.length < 6) return;

        // Title extraction: prioritize full product title link inside h2 / s-line-clamp
        let titleEl = $(el).find('a.a-link-normal h2 span, a.a-text-normal h2 span, h2.a-size-medium span, h2:not(.a-size-mini) span').first();
        if (!titleEl.length) {
          titleEl = $(el).find('h2 a span, h2 span, h2 a, h2').last();
        }
        let title = titleEl.text().trim();
        if (!title || title.length < 2) return;

        // Price extraction
        const priceWhole = $(el).find('.a-price .a-price-whole').first().text().replace(/[^\d]/g, '');
        if (!priceWhole) return;

        const price = parseInt(priceWhole, 10);
        if (isNaN(price) || price <= 0) return;

        // MRP / Original Price extraction
        const mrpText = $(el).find('.a-price.a-text-price .a-offscreen, span.a-text-price span').first().text().replace(/[^\d]/g, '');
        const originalPrice = mrpText ? parseInt(mrpText, 10) : null;
        const discount = (originalPrice && originalPrice > price)
          ? Math.round(((originalPrice - price) / originalPrice) * 100)
          : null;

        // Image extraction
        const image = $(el).find('img.s-image').attr('src') || null;

        // Product Link: clean direct link to /dp/{asin}
        let link = $(el).find('a.a-link-normal.s-line-clamp-2, a.a-link-normal[href*="/dp/"], h2 a').attr('href') || `/dp/${asin}`;
        if (!link.startsWith('http')) {
          link = `https://www.amazon.in${link.startsWith('/') ? '' : '/'}${link}`;
        }
        const cleanUrl = asin ? `https://www.amazon.in/dp/${asin}` : link.split('?')[0];

        // Rating extraction
        const ratingText = $(el).find('i.a-icon-star-small span, span[aria-label*="out of 5 stars"]').first().text() ||
                           $(el).find('[aria-label*="out of 5 stars"]').attr('aria-label') || '';
        const ratingMatch = ratingText.match(/(\d+(?:\.\d+)?)\s*out/i);
        const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;

        // Review Count extraction
        const reviewText = $(el).find('span.a-size-base.s-underline-text, [aria-label*="ratings"]').first().text() ||
                           $(el).find('[aria-label*="ratings"]').attr('aria-label') || '';
        const reviewDigits = reviewText.replace(/[^\d]/g, '');
        const reviewCount = reviewDigits ? parseInt(reviewDigits, 10) : null;

        const availability = 'In Stock';

        const norm = this.normalizeProduct({
          title,
          price,
          originalPrice: originalPrice && originalPrice > price ? originalPrice : price,
          mrp: originalPrice && originalPrice > price ? originalPrice : price,
          discount,
          image,
          rating,
          reviewCount,
          asin,
          url: cleanUrl || link,
          availability,
          seller: 'Amazon.in'
        });
        norm.asin = asin;
        norm.productId = asin;
        norm.id = asin;
        norm.originalPrice = originalPrice && originalPrice > price ? originalPrice : null;
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

  async getProductDetails(urlOrAsin) {
    const t0 = Date.now();
    let url = urlOrAsin;
    if (!url.startsWith('http')) {
      url = `https://www.amazon.in/dp/${urlOrAsin}`;
    }

    const res = await this.safeGet(url, {
      headers: this.getBrowserHeaders()
    });

    if (res.ok && res.data) {
      const $ = cheerio.load(res.data);
      const title = $('#productTitle').text().trim();
      const priceText = $('.a-price .a-price-whole').first().text().replace(/[^\d]/g, '');
      const mrpText = $('.a-price.a-text-price .a-offscreen, span.a-text-price span').first().text().replace(/[^\d]/g, '');
      const image = $('#landingImage, #imgBlkFront, #main-image').attr('src') || null;

      const ratingText = $('#acrPopover').attr('title') || $('span[data-hook="rating-out-of-text"]').text();
      const ratingMatch = ratingText ? ratingText.match(/(\d+(?:\.\d+)?)\s*out/i) : null;
      const rating = ratingMatch ? parseFloat(ratingMatch[1]) : null;

      const reviewText = $('#acrCustomerReviewText').text().replace(/[^\d]/g, '');
      const reviewCount = reviewText ? parseInt(reviewText, 10) : null;

      const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/i);
      const asin = asinMatch ? asinMatch[1] : (urlOrAsin.length === 10 ? urlOrAsin : null);

      if (title && priceText) {
        const price = parseInt(priceText, 10);
        const originalPrice = mrpText ? parseInt(mrpText, 10) : null;
        const discount = (originalPrice && originalPrice > price)
          ? Math.round(((originalPrice - price) / originalPrice) * 100)
          : null;

        const availText = $('#availability').text().trim();
        const availability = availText ? (availText.toLowerCase().includes('in stock') || availText.toLowerCase().includes('left in stock') ? 'In Stock' : 'Out of Stock') : 'In Stock';

        const norm = this.normalizeProduct({
          title,
          price,
          originalPrice: originalPrice && originalPrice > price ? originalPrice : price,
          mrp: originalPrice && originalPrice > price ? originalPrice : price,
          discount,
          image,
          rating,
          reviewCount,
          asin,
          url: url.split('?')[0],
          availability,
          seller: 'Amazon.in'
        });
        norm.asin = asin;
        norm.productId = asin;
        norm.id = asin;
        norm.originalPrice = originalPrice && originalPrice > price ? originalPrice : null;

        return {
          store: this.name,
          status: 'success',
          product: norm,
          durationMs: Date.now() - t0,
          scrapedAt: new Date().toISOString()
        };
      }
    }

    return {
      store: this.name,
      status: 'unavailable',
      product: null,
      durationMs: Date.now() - t0,
      scrapedAt: new Date().toISOString()
    };
  }
}

module.exports = AmazonScraper;
