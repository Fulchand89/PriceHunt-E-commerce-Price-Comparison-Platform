'use strict';

const BaseProvider = require('./base.provider');
const MyntraScraper = require('./scrapers/myntra.scraper');

class MyntraProvider extends BaseProvider {
  constructor() {
    super('myntra');
    this.scraper = new MyntraScraper();
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

module.exports = MyntraProvider;
