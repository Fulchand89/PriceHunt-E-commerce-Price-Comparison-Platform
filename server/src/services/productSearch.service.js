'use strict';

const { Op } = require('sequelize');
const logger = require('../utils/logger');
const { cacheGet, cacheSet } = require('../config/redis');
const { buildCacheKey, normalizeTitle, parsePagination } = require('../utils/helpers');
const scraperOrchestrator = require('./scraperOrchestrator.service');
const Product = require('../models/Product');
const ProductListing = require('../models/ProductListing');
const SearchHistory = require('../models/SearchHistory');

const CACHE_TTL = () => parseInt(process.env.SCRAPER_CACHE_TTL || process.env.SEARCH_CACHE_TTL || '600', 10);
const log = logger.child ? logger.child('ProductSearch') : logger;

const Category = require('../models/Category');

const inferCategory = (title = '', fallback = '') => {
  const t = String(title || '').toLowerCase();
  if (/phone|iphone|mobile|smartphone|galaxy|redmi|realme|oneplus|vivo|oppo|tablet|pad|ipad/i.test(t)) {
    return 'Mobiles & Tablets';
  }
  if (/laptop|macbook|notebook|chromebook|thinkpad|desktop|computer/i.test(t)) {
    return 'Laptops & Computers';
  }
  if (/headphone|earphone|airpod|earbud|speaker|soundbar|audio|headset|sony wh/i.test(t)) {
    return 'Electronics & Audio';
  }
  if (/tv|television|oled|qled|refrigerator|fridge|washing machine|air conditioner|microwave|geyser/i.test(t)) {
    return 'TVs & Home Appliances';
  }
  if (/shirt|shoes|sneaker|jeans|dress|kurta|jacket|footwear|saree|tshirt/i.test(t)) {
    return 'Fashion & Footwear';
  }
  return fallback || '';
};

const search = async (query, options = {}) => {
  const { page, limit } = parsePagination({ page: options.page, limit: options.limit });
  const q = String(query || '').trim();

  // Resolve category if slug or name passed
  let targetCategory = null;
  if (options.category) {
    try {
      const catRecord = await Category.findOne({
        where: {
          [Op.or]: [
            { slug: options.category },
            { name: options.category }
          ]
        }
      });
      targetCategory = catRecord ? catRecord.name : options.category;
    } catch {
      targetCategory = options.category;
    }
  }

  const minPriceNum = options.minPrice !== undefined && options.minPrice !== '' && !isNaN(Number(options.minPrice)) ? Number(options.minPrice) : null;
  const maxPriceNum = options.maxPrice !== undefined && options.maxPrice !== '' && !isNaN(Number(options.maxPrice)) ? Number(options.maxPrice) : null;
  const sortBy = options.sort || options.sortBy || 'lowestPrice';

  // If both q and category are empty, and no min/max price, return active products from DB
  const searchKeyword = q || targetCategory || '';

  const nq = normalizeTitle(q || targetCategory || 'all');
  const cacheKey = buildCacheKey('search:v3', nq, targetCategory || 'all', minPriceNum ?? '', maxPriceNum ?? '', sortBy, page, limit);

  // 1. Fast Cache Check
  const cached = await cacheGet(cacheKey);
  if (cached) {
    _saveHistory(q || targetCategory || '', nq, cached, options, true);
    return { ...cached, fromCache: true };
  }

  // 2. Check recent DB products if scraped within CACHE_TTL
  const tenMinutesAgo = new Date(Date.now() - CACHE_TTL() * 1000);
  let existingMatches = [];
  try {
    const dbWhere = { isActive: true };
    if (q) {
      dbWhere[Op.or] = [
        { title: { [Op.like]: `%${q}%` } },
        { brand: { [Op.like]: `%${q}%` } }
      ];
    }
    if (targetCategory) {
      dbWhere[Op.or] = [
        ...(dbWhere[Op.or] || []),
        { category: { [Op.like]: `%${targetCategory}%` } }
      ];
    }

    const rawMatches = await Product.findAll({
      where: dbWhere,
      limit: 100
    });
    existingMatches = rawMatches.map(m => m.toJSON());
  } catch (err) {
    log.warn(`DB search error: ${err.message}`);
  }

  let storeStatuses = [];
  let allItems = [];

  if (existingMatches.length > 0 && q) {
    log.info(`Found ${existingMatches.length} matching products in DB for query="${q}", running live scrapers in parallel...`);
    try {
      const [dbItems, scrapeResult] = await Promise.all([
        _buildItemsFromDb(existingMatches),
        scraperOrchestrator.searchAcrossStores(q, { page, limit }).catch(err => {
          log.warn(`Live scraper background error: ${err.message}`);
          return { products: [], storeStatuses: [] };
        })
      ]);
      storeStatuses = scrapeResult.storeStatuses || [];
      const scrapedItems = (scrapeResult.products || []).filter(Boolean).map(_buildItem);
      allItems = [...dbItems, ...scrapedItems];
    } catch (err) {
      log.warn(`Parallel search error: ${err.message}`);
      allItems = await _buildItemsFromDb(existingMatches);
    }
  } else if (existingMatches.length > 0) {
    log.info(`Found ${existingMatches.length} matching products in DB for query="${q}" category="${targetCategory}"`);
    allItems = await _buildItemsFromDb(existingMatches);
  } else if (q) {
    // Run Live Scraping Orchestrator across all enabled stores for query q
    log.info(`Triggering live scraping orchestrator for keyword: "${q}"`);
    const scrapeResult = await scraperOrchestrator.searchAcrossStores(q, { page, limit });
    storeStatuses = scrapeResult.storeStatuses || [];
    allItems = (scrapeResult.products || []).filter(Boolean).map(_buildItem);
  } else {
    // If no specific match found, fetch active products from DB and filter in memory
    try {
      const rawAll = await Product.findAll({ where: { isActive: true }, limit: 100 });
      allItems = await _buildItemsFromDb(rawAll.map(m => m.toJSON()));
    } catch {
      allItems = [];
    }
  }

  // 4. Filter items in memory according to filters
  let filtered = allItems.filter(item => {
    const p = item.product || {};
    const itemCategory = p.category || inferCategory(p.title);
    
    // Category filter
    if (targetCategory) {
      const itemCat = String(itemCategory).toLowerCase();
      const targetCatLower = targetCategory.toLowerCase();
      if (!itemCat.includes(targetCatLower) && !targetCatLower.includes(itemCat)) {
        return false;
      }
    }
    // Min Price filter
    if (minPriceNum !== null) {
      if (!item.lowestPrice || item.lowestPrice < minPriceNum) return false;
    }
    // Max Price filter
    if (maxPriceNum !== null) {
      if (!item.lowestPrice || item.lowestPrice > maxPriceNum) return false;
    }
    // Brand filter
    if (options.brand && p.brand) {
      if (!String(p.brand).toLowerCase().includes(options.brand.toLowerCase())) {
        return false;
      }
    }
    // Store filter
    if (options.store && item.offers?.length) {
      const matchStore = item.offers.some(o =>
        String(o.store || '').toLowerCase().includes(options.store.toLowerCase()) ||
        String(o.provider || '').toLowerCase() === options.store.toLowerCase()
      );
      if (!matchStore) return false;
    }
    // Discount filter
    if (options.discount && Number(options.discount) > 0) {
      const reqDisc = Number(options.discount);
      const hasDiscount = (item.offers || []).some(o => (o.discount || 0) >= reqDisc) ||
        (item.highestPrice > item.lowestPrice && ((item.highestPrice - item.lowestPrice) / item.highestPrice) * 100 >= reqDisc);
      if (!hasDiscount) return false;
    }
    return true;
  });

  // 5. Sort items
  if (sortBy === 'highestPrice' || sortBy === 'price_desc') {
    filtered.sort((a, b) => (b.lowestPrice || 0) - (a.lowestPrice || 0));
  } else if (sortBy === 'highestDiscount' || sortBy === 'discount') {
    filtered.sort((a, b) => (b.priceDifference || 0) - (a.priceDifference || 0));
  } else if (sortBy === 'recentlyUpdated') {
    filtered.sort((a, b) => new Date(b.scrapedAt || 0) - new Date(a.scrapedAt || 0));
  } else {
    // Default lowestPrice / price_asc
    filtered.sort((a, b) => (a.lowestPrice || Infinity) - (b.lowestPrice || Infinity));
  }

  const total = filtered.length;
  const pageSlice = filtered.slice((page - 1) * limit, page * limit);

  const payload = {
    success: true,
    query: q,
    category: targetCategory,
    minPrice: minPriceNum,
    maxPrice: maxPriceNum,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
    results: pageSlice,
    storeStatuses,
    fromCache: false,
    scrapedAt: new Date().toISOString()
  };

  // Cache response
  await cacheSet(cacheKey, payload, CACHE_TTL());

  // Save history if keyword was searched
  if (q) {
    _saveHistory(q, nq, payload, options, false);
  }

  return payload;
};

const _buildItem = ({ product, listings }) => {
  let combinedListings = [...(listings || [])];
  const prodId = product.id || product._id;
  const storePrice = product.price != null ? product.price : (product.lowestPrice || null);

  // If this product belongs to our catalog and has a price, ensure Our Direct Store is represented
  if (storePrice != null && storePrice > 0 && !combinedListings.some(l => l.isOurStore || l.provider === 'my_store')) {
    combinedListings.unshift({
      id: `my-store-${prodId}`,
      store: 'Our Direct Store (Mera Store)',
      provider: 'my_store',
      seller: 'Our Direct Store',
      title: product.title,
      price: storePrice,
      mrp: product.originalPrice || storePrice,
      originalPrice: product.originalPrice || storePrice,
      discount: product.originalPrice && product.originalPrice > storePrice
        ? Math.round(((product.originalPrice - storePrice) / product.originalPrice) * 100)
        : 0,
      shippingCost: 0,
      totalCost: storePrice,
      availability: product.availability !== false && product.availability !== 'Out of Stock',
      rating: product.rating || 4.9,
      reviewCount: product.reviewCount || 10,
      productUrl: `/products/${product.slug || prodId}`,
      affiliateUrl: `/products/${product.slug || prodId}`,
      isOurStore: true,
      lastScrapedAt: product.updatedAt || new Date().toISOString()
    });
  }

  const active = combinedListings.filter(l => l.availability !== false && l.availability !== 'Out of Stock');
  const validListings = active.length > 0 ? active : combinedListings;
  const costs = validListings.map(l => l.price + (l.shippingCost || 0)).filter(p => p > 0);

  const lowest = costs.length ? Math.min(...costs) : (storePrice || 0);
  const highest = costs.length ? Math.max(...costs) : (product.highestPrice || lowest);
  const diff = lowest > 0 && highest > lowest ? highest - lowest : 0;

  const sorted = [...combinedListings].sort((a, b) => (a.price + (a.shippingCost || 0)) - (b.price + (b.shippingCost || 0)));
  const bestDeal = sorted[0] || null;

  return {
    product: {
      id: prodId,
      _id: prodId,
      title: product.canonicalTitle || product.title,
      canonicalTitle: product.canonicalTitle || product.title,
      brand: product.brand,
      model: product.model,
      category: product.category,
      image: product.image,
      images: product.images || [],
      price: storePrice,
      originalPrice: product.originalPrice,
      lastScrapedAt: product.lastScrapedAt || product.updatedAt
    },
    offers: sorted.map(l => {
      const tc = l.price + (l.shippingCost || 0);
      const lId = l.id || l._id;
      return {
        id: lId,
        store: l.store || l.seller || l.provider,
        provider: l.provider,
        title: l.title,
        price: l.price,
        mrp: l.mrp || l.originalPrice || l.price,
        originalPrice: l.originalPrice || l.mrp || l.price,
        discount: l.discount || 0,
        shippingCost: l.shippingCost || 0,
        totalCost: tc,
        availability: l.availability !== false && l.availability !== 'Out of Stock',
        rating: l.rating,
        reviewCount: l.reviewCount,
        productUrl: l.productUrl,
        affiliateUrl: l.affiliateUrl || l.productUrl,
        seller: l.seller,
        variant: l.variant,
        lastScrapedAt: l.lastScrapedAt || l.lastUpdated,
        lastUpdated: l.lastUpdated || l.lastScrapedAt,
        isLowest: tc === lowest,
        isHighest: tc === highest,
        isOurStore: Boolean(l.isOurStore)
      };
    }),
    lowestPrice: lowest,
    highestPrice: highest,
    priceDifference: diff,
    potentialSavings: diff,
    bestDeal: bestDeal ? {
      store: bestDeal.seller || bestDeal.provider,
      provider: bestDeal.provider,
      price: bestDeal.price,
      totalCost: bestDeal.price + (bestDeal.shippingCost || 0),
      productUrl: bestDeal.productUrl,
      affiliateUrl: bestDeal.affiliateUrl || bestDeal.productUrl
    } : null,
    totalOffers: combinedListings.length,
    scrapedAt: product.lastScrapedAt || new Date().toISOString()
  };
};

const _buildItemsFromDb = async (products) => {
  const pIds = products.map(p => p.id || p._id);
  const allListingsRaw = await ProductListing.findAll({
    where: { productId: { [Op.in]: pIds }, isActive: true }
  });
  const allListings = allListingsRaw.map(l => l.toJSON());

  return products.map(p => {
    const pId = p.id || p._id;
    const listings = allListings.filter(l => String(l.productId) === String(pId));
    return _buildItem({ product: p, listings });
  });
};

const _saveHistory = async (query, nq, result, options, fromCache) => {
  try {
    await SearchHistory.create({
      userId: options.userId || null,
      query,
      normalizedQuery: nq,
      resultCount: result.total || 0,
      fromCache,
      ipAddress: options.ipAddress || null,
    });
  } catch {
    // Non-critical
  }
};

module.exports = { search };
