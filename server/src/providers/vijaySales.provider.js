'use strict';

const BaseProvider = require('./base.provider');
const VijaySalesScraper = require('./scrapers/vijaySales.scraper');

class VijaySalesProvider extends BaseProvider {
  constructor() {
    super('vijaySales');
    this.scraper = new VijaySalesScraper();
  }

  async searchProducts(query, options = {}) {
    const res = await this.scraper.searchProducts(query, options);
    return (res.products || []).map(p => this._normalizeListing(p));
  }

  async getProductDetails(url) {
    const res = await this.scraper.getProductDetails(url);
    return res.product ? this._normalizeListing(res.product) : null;
  }
}

module.exports = VijaySalesProvider;
