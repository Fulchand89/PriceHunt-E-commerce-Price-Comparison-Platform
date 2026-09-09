'use strict';

const BaseProvider = require('./base.provider');
const RelianceDigitalScraper = require('./scrapers/relianceDigital.scraper');

class RelianceDigitalProvider extends BaseProvider {
  constructor() {
    super('relianceDigital');
    this.scraper = new RelianceDigitalScraper();
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

module.exports = RelianceDigitalProvider;
