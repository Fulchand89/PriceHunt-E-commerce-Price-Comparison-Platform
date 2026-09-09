'use strict';

const logger = require('../utils/logger');

let redisClient   = null;
let redisAvailable = false;

// ---------- in-memory fallback ----------
const memStore = new Map();
const memTTL   = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [k, exp] of memTTL) { if (now > exp) { memStore.delete(k); memTTL.delete(k); } }
}, 60_000).unref();

// ---------- connect ----------
const connectRedis = async () => {
  const url = process.env.REDIS_URL;
  if (!url) { logger.warn('REDIS_URL not set — using in-memory cache'); return null; }

  try {
    const { createClient } = require('redis');
    redisClient = createClient({
      url,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (n) => (n > 5 ? (redisAvailable = false, false) : Math.min(n * 200, 3000)),
      },
    });
    redisClient.on('error',       (e) => { logger.error('Redis error: ' + e.message); redisAvailable = false; });
    redisClient.on('connect',     ()  => { logger.info('Redis connected');  redisAvailable = true;  });
    redisClient.on('reconnecting',()  => logger.warn('Redis reconnecting…'));
    await redisClient.connect();
    return redisClient;
  } catch (e) {
    logger.warn('Redis unavailable — in-memory fallback: ' + e.message);
    redisClient = null; redisAvailable = false;
    return null;
  }
};

// ---------- cache helpers ----------
const cacheGet = async (key) => {
  try {
    if (redisAvailable && redisClient) {
      const v = await redisClient.get(key);
      return v ? JSON.parse(v) : null;
    }
    if (memStore.has(key)) {
      const exp = memTTL.get(key);
      if (exp && Date.now() > exp) { memStore.delete(key); memTTL.delete(key); return null; }
      return memStore.get(key);
    }
  } catch (e) { logger.warn('cacheGet error: ' + e.message); }
  return null;
};

const cacheSet = async (key, value, ttl = 600) => {
  try {
    if (redisAvailable && redisClient) { await redisClient.setEx(key, ttl, JSON.stringify(value)); return; }
    memStore.set(key, value);
    memTTL.set(key, Date.now() + ttl * 1000);
  } catch (e) { logger.warn('cacheSet error: ' + e.message); }
};

const cacheDel = async (key) => {
  try {
    if (redisAvailable && redisClient) await redisClient.del(key);
    memStore.delete(key); memTTL.delete(key);
  } catch (e) { logger.warn('cacheDel error: ' + e.message); }
};

const cacheDelPattern = async (pattern) => {
  try {
    if (redisAvailable && redisClient) {
      const keys = await redisClient.keys(pattern);
      if (keys.length) await redisClient.del(keys);
    }
    const prefix = pattern.replace(/\*/g, '');
    for (const k of memStore.keys()) { if (k.startsWith(prefix)) { memStore.delete(k); memTTL.delete(k); } }
  } catch (e) { logger.warn('cacheDelPattern error: ' + e.message); }
};

const getRedisStatus = () => ({
  available: redisAvailable,
  connected: redisAvailable && redisClient !== null,
  mode: redisAvailable ? 'redis' : 'in-memory',
});

module.exports = { connectRedis, cacheGet, cacheSet, cacheDel, cacheDelPattern, getRedisStatus };
