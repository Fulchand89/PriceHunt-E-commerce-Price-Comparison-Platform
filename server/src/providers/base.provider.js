'use strict';

const axios  = require('axios');
const logger = require('../utils/logger');
const { isProviderEnabled, isProviderConfigured, getMissingKeys, getProviderConfig } = require('../config/providers');

class BaseProvider {
  constructor(providerKey) {
    if (!providerKey) throw new Error('BaseProvider: providerKey is required');
    this.key    = providerKey;
    this.config = getProviderConfig(providerKey);
    if (!this.config) throw new Error(`BaseProvider: unknown provider "${providerKey}"`);

    this.name       = this.config.name;
    this.logo       = this.config.logo;
    this.homepage   = this.config.homepage;
    this.currency   = this.config.currency || 'INR';
    this.timeout    = this.config.timeout  || 10000;
    this.maxRetries = this.config.maxRetries || 2;
    this.log        = logger.child(this.name);
  }

  isEnabled() {
    return isProviderEnabled(this.key);
  }

  isConfigured() {
    return isProviderConfigured(this.key);
  }

  isMockAllowed() {
    return false;
  }

  getConfigurationError() {
    if (!this.isEnabled()) return { configured: false, reason: `${this.name} is disabled` };
    return null;
  }

  getStatus() {
    return {
      key: this.key,
      name: this.name,
      logo: this.logo,
      enabled: this.isEnabled(),
      configured: true,
      isMock: false,
      status: this.isEnabled() ? 'ready' : 'disabled',
      error: null
    };
  }

  // Legacy fallback: NO MOCK DATA ALLOWED in production flow
  getMockSearch() {
    this.log.warn(`Mock data generation blocked for ${this.name}`);
    return [];
  }

  // ── HTTP helpers ────────────────────────────────────────────────────────
  async _get(url, params = {}, headers = {}) {
    let last;
    for (let i = 0; i <= this.maxRetries; i++) {
      try {
        const t0  = Date.now();
        const res = await axios.get(url, { params, headers: { 'Content-Type':'application/json', Accept:'application/json', 'User-Agent':'PriceHunt/2.0', ...headers }, timeout: this.timeout });
        this.log.debug(`GET ${url} ${res.status} (${Date.now()-t0}ms)`);
        return res.data;
      } catch (err) {
        last = err;
        const status = err.response?.status;
        if (status && status < 500 && status !== 429) break;
        if (i < this.maxRetries) await new Promise(r => setTimeout(r, 500 * 2**i));
      }
    }
    throw this._wrap(last);
  }

  async _post(url, body = {}, headers = {}) {
    let last;
    for (let i = 0; i <= this.maxRetries; i++) {
      try {
        const res = await axios.post(url, body, { headers: { 'Content-Type':'application/json', Accept:'application/json', 'User-Agent':'PriceHunt/2.0', ...headers }, timeout: this.timeout });
        return res.data;
      } catch (err) {
        last = err;
        const status = err.response?.status;
        if (status && status < 500 && status !== 429) break;
        if (i < this.maxRetries) await new Promise(r => setTimeout(r, 500 * 2**i));
      }
    }
    throw this._wrap(last);
  }

  _wrap(err) {
    if (!err) return new Error('Unknown provider error');
    const msg  = err.response?.data?.message || err.message || 'Provider request failed';
    const e    = new Error(`[${this.name}] ${msg}`);
    e.provider = this.key;
    e.statusCode = err.response?.status || 503;
    return e;
  }

  // ── Normalisation helper ─────────────────────────────────────────────────
  _normalizeListing(raw) {
    const price         = Number(raw.price)         || 0;
    const originalPrice = Number(raw.originalPrice || raw.mrp) || price;
    const shippingCost  = Number(raw.shippingCost)  || 0;
    const discount      = originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : (Number(raw.discount) || 0);

    const isMock = !this.isConfigured() && this.isMockAllowed();

    return {
      provider:          this.key,
      providerName:      isMock ? `${this.name} (Mock)` : this.name,
      providerLogo:      this.logo,
      providerProductId: String(raw.providerProductId || raw.id || raw.asin || raw.url || ''),
      title:             String(raw.title || '').trim(),
      image:             raw.image      || null,
      price,
      originalPrice,
      discount,
      currency:          raw.currency   || this.currency,
      shippingCost,
      deliveryInfo:      raw.deliveryInfo || null,
      availability:      raw.availability !== false && raw.availability !== 'Out of Stock',
      seller:            raw.seller      || (isMock ? `${this.name} (Mock)` : this.name),
      productUrl:        raw.productUrl  || raw.url || null,
      affiliateUrl:      raw.affiliateUrl|| raw.productUrl || raw.url || null,
      lastUpdated:       new Date(),
      isMock,
    };
  }

  // ── Abstract interface ───────────────────────────────────────────────────
  async searchProducts()          { throw new Error(`${this.name}.searchProducts() not implemented`); }
  async getProductDetails()       { throw new Error(`${this.name}.getProductDetails() not implemented`); }
  async getCurrentPrice()         { throw new Error(`${this.name}.getCurrentPrice() not implemented`); }
  async getProductAvailability()  { throw new Error(`${this.name}.getProductAvailability() not implemented`); }
}

module.exports = BaseProvider;
