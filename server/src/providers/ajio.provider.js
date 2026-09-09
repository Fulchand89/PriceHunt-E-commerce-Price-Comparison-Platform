'use strict';

const BaseProvider = require('./base.provider');
const AjioScraper = require('./scrapers/ajio.scraper');

class AjioProvider extends BaseProvider {
  constructor() {
    super('ajio');
    this.scraper = new AjioScraper();
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

module.exports = AjioProvider;
