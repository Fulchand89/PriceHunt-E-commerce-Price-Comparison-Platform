'use strict';

const BaseProvider = require('./base.provider');
const FlipkartScraper = require('./scrapers/flipkart.scraper');

class FlipkartProvider extends BaseProvider {
  constructor() {
    super('flipkart');
    this.scraper = new FlipkartScraper();
  }

  async searchProducts(query, options = {}) {
    const res = await this.scraper.searchProducts(query, options);
    return (res.products || []).map(p => this._normalizeListing(p));
  }

  async getProductDetails(url) {
    const res = await this.scraper.getProductDetails(url);
    return res.product ? this._normalizeListing(res.product) : null;
  }

  async getCurrentPrice(url) {
    const listing = await this.getProductDetails(url);
    return listing ? { price: listing.price, originalPrice: listing.originalPrice, discount: listing.discount, availability: listing.availability, lastUpdated: listing.lastUpdated } : null;
  }

  async getProductAvailability(url) {
    const listing = await this.getProductDetails(url);
    return { available: listing?.availability !== false, message: listing ? 'Available' : 'Unavailable' };
  }
}

module.exports = FlipkartProvider;
