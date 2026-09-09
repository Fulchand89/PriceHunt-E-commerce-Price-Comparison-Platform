'use strict';

const normalizeTitle = (t = '') =>
  t.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

const buildCacheKey = (...parts) =>
  parts.map(p => String(p).toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')).join(':');

const parsePagination = (q) => {
  const page  = Math.max(1, parseInt(q.page  || '1',  10));
  const limit = Math.min(100, Math.max(1, parseInt(q.limit || '20', 10)));
  return { page, limit, skip: (page - 1) * limit };
};

const calcDiscountPct = (orig, curr) => {
  const o = Number(orig) || 0, c = Number(curr) || 0;
  return (!o || o <= c) ? 0 : Math.round(((o - c) / o) * 100);
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const retryAsync = async (fn, attempts = 3, base = 500) => {
  let last;
  for (let i = 0; i < attempts; i++) {
    try { return await fn(); }
    catch (e) { last = e; if (i < attempts - 1) await sleep(base * 2 ** i); }
  }
  throw last;
};

const isValidObjectId = (id) => /^[a-f\d]{24}$/i.test(String(id));

const omitEmpty = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ''));

const getRangeStartDate = (range) => {
  const map = { '7d': 7, '30d': 30, '3m': 90, '90d': 90, '6m': 180, '180d': 180, '1y': 365 };
  const d   = new Date();
  d.setDate(d.getDate() - (map[range] || 30));
  return d;
};

const formatCurrency = (amount, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style:'currency', currency, minimumFractionDigits:0 }).format(amount);

module.exports = {
  normalizeTitle, buildCacheKey, parsePagination, calcDiscountPct,
  sleep, retryAsync, isValidObjectId, omitEmpty, getRangeStartDate, formatCurrency,
};
