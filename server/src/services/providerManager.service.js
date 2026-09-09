'use strict';

const logger   = require('../utils/logger');
const Provider = require('../models/Provider');
const { getAllProviderKeys, getProviderConfig } = require('../config/providers');

const PROVIDER_CLASSES = {
  amazon:          () => require('../providers/amazon.provider'),
  flipkart:        () => require('../providers/flipkart.provider'),
  myntra:          () => require('../providers/myntra.provider'),
  ajio:            () => require('../providers/ajio.provider'),
  meesho:          () => require('../providers/meesho.provider'),
  croma:           () => require('../providers/croma.provider'),
  relianceDigital: () => require('../providers/relianceDigital.provider'),
  vijaySales:      () => require('../providers/vijaySales.provider'),
};

const log = logger.child('ProviderManager');

class ProviderManager {
  constructor() { this._map = new Map(); }

  async initialize() {
    log.info('Initialising provider adapters…');
    for (const key of getAllProviderKeys()) {
      try {
        const Cls      = PROVIDER_CLASSES[key]?.();
        if (!Cls) { log.warn(`No class for provider "${key}"`); continue; }
        const instance = new Cls();
        this._map.set(key, instance);
        await this._syncToDB(instance);
        log.info(`Provider registered: ${instance.name}`, { enabled: instance.isEnabled(), configured: instance.isConfigured() });
      } catch (e) { log.error(`Failed to register "${key}": ${e.message}`); }
    }
    log.info(`${this._map.size} providers registered`);
  }

  getProvider(key)      { return this._map.get(key) || null; }
  get(key)              { return this._map.get(key) || null; }
  getAll()              { return Array.from(this._map.values()); }
  getAllProviders()      { return Array.from(this._map.values()); }
  getEnabled()          { return this.getAllProviders().filter(p => p.isEnabled()); }
  getEnabledProviders() { return this.getAllProviders().filter(p => p.isEnabled()); }
  getReadyProviders()   { return this.getAllProviders().filter(p => p.isEnabled()); }

  async toggleProvider(key, enabled) {
    const provider = this._map.get(key);
    if (!provider) throw new Error(`Unknown provider: "${key}"`);
    const status = enabled ? (provider.isConfigured() ? 'ready' : 'unconfigured') : 'disabled';

    const [doc] = await Provider.findOrCreate({ where: { key }, defaults: { key, name: provider.name, enabled, status } });
    if (doc) {
      await doc.update({ enabled, status });
    }

    const envKey = key.replace(/([A-Z])/g, '_$1').toUpperCase();
    process.env[`${envKey}_ENABLED`] = String(enabled);
    log.info(`Provider "${key}" ${enabled ? 'enabled' : 'disabled'}`);
    return provider.getStatus();
  }

  async runAcrossProviders(fn, keys = null) {
    const candidates = keys
      ? keys.map(k => this._map.get(k)).filter(Boolean)
      : this.getReadyProviders();

    if (!candidates.length) { log.warn('No ready providers'); return []; }

    const tasks = candidates.map(async provider => {
      const t0 = Date.now();
      try {
        const data = await fn(provider);
        await this._recordSuccess(provider.key, Date.now() - t0);
        return { provider: provider.key, providerName: provider.name, success: true, data };
      } catch (err) {
        await this._recordError(provider.key, err.message, Date.now() - t0);
        log.warn(`Provider "${provider.key}" failed: ${err.message}`);
        return { provider: provider.key, providerName: provider.name, success: false, error: err.providerError?.reason || err.message };
      }
    });

    const settled = await Promise.allSettled(tasks);
    return settled.map(r => r.status === 'fulfilled' ? r.value : { success: false, error: r.reason?.message });
  }

  getAllProviderStatuses() {
    const out = {};
    for (const [key, p] of this._map) out[key] = p.getStatus();
    return out;
  }

  async getDetailedStatuses() {
    const rowsRaw = await Provider.findAll();
    const rows = rowsRaw.map(r => r.toJSON());
    const dbMap = {};
    rows.forEach(r => { dbMap[r.key] = r; });
    const out = {};
    for (const [key, p] of this._map) {
      const db = dbMap[key] || {};
      out[key] = { ...p.getStatus(), successCount: db.successCount || 0, errorCount: db.errorCount || 0, avgResponseTimeMs: db.avgResponseTimeMs || 0, lastCheckedAt: db.lastCheckedAt || null };
    }
    return out;
  }

  async _syncToDB(provider) {
    const cfg    = getProviderConfig(provider.key);
    const status = provider.isConfigured() ? (provider.isEnabled() ? 'ready' : 'disabled') : 'unconfigured';
    const [doc] = await Provider.findOrCreate({
      where: { key: provider.key },
      defaults: { key: provider.key, name: provider.name, logo: provider.logo, homepage: cfg?.homepage || null, currency: cfg?.currency || 'INR', enabled: provider.isEnabled(), configured: provider.isConfigured(), status }
    });
    if (doc) {
      await doc.update({ key: provider.key, name: provider.name, logo: provider.logo, homepage: cfg?.homepage || null, currency: cfg?.currency || 'INR', enabled: provider.isEnabled(), configured: provider.isConfigured(), status });
    }
  }

  async _recordSuccess(key, ms) {
    try {
      const doc = await Provider.findOne({ where: { key } });
      if (!doc) return;
      const n   = doc.successCount || 0;
      const avg = Math.round(((doc.avgResponseTimeMs || 0) * n + ms) / (n + 1));
      await doc.update({ successCount: n + 1, avgResponseTimeMs: avg, lastCheckedAt: new Date(), status: 'healthy' });
    } catch { /* non-critical */ }
  }

  async _recordError(key, msg, ms) {
    try {
      const doc = await Provider.findOne({ where: { key } });
      if (doc) {
        await doc.update({ errorCount: (doc.errorCount || 0) + 1, lastCheckedAt: new Date(), lastErrorMessage: msg, avgResponseTimeMs: ms, status: 'degraded' });
      }
    } catch { /* non-critical */ }
  }
}

module.exports = new ProviderManager();
