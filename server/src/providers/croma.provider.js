'use strict';

const BaseProvider = require('./base.provider');
const CromaScraper = require('./scrapers/croma.scraper');

class CromaProvider extends BaseProvider {
  constructor() {
    super('croma');
    this.scraper = new CromaScraper();
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

module.exports = CromaProvider;
