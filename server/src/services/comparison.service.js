'use strict';

const { Op } = require('sequelize');
const { cacheGet, cacheSet } = require('../config/redis');
const { buildCacheKey, getRangeStartDate } = require('../utils/helpers');
const Product        = require('../models/Product');
const ProductListing = require('../models/ProductListing');
const PriceHistory   = require('../models/PriceHistory');

const CACHE_TTL = () => parseInt(process.env.COMPARISON_CACHE_TTL || '300', 10);

const compareProduct = async (productId) => {
  const cacheKey = buildCacheKey('compare', productId);
  const cached   = await cacheGet(cacheKey);
  if (cached) return { ...cached, fromCache: true };

  const productRaw = await Product.findByPk(productId);
  if (!productRaw) { const e = new Error('Product not found'); e.status = 404; throw e; }
  const product = productRaw.toJSON();

  const listingsRaw = await ProductListing.findAll({ where: { productId, isActive: true } });
  let listings = listingsRaw.map(l => l.toJSON());

  // If no external listings in DB, trigger live search fallback on Amazon
  if (!listings.length) {
    try {
      const amazonRes = await amazonService.search(product.title, { limit: 5 });
      if (amazonRes && amazonRes.products && amazonRes.products.length > 0) {
        listings = amazonRes.products.slice(0, 3).map((ap, idx) => ({
          id: `live-amazon-${idx}`,
          productId: product.id,
          provider: 'amazon',
          seller: 'Amazon India',
          title: ap.title,
          image: ap.image || product.image,
          price: ap.price,
          mrp: ap.originalPrice || ap.price,
          originalPrice: ap.originalPrice || ap.price,
          discount: ap.discount || 0,
          shippingCost: 0,
          deliveryInfo: 'Amazon Prime / Standard Delivery',
          availability: ap.availability || 'In Stock',
          productUrl: ap.url || `https://www.amazon.in/dp/${ap.asin}`,
          affiliateUrl: ap.url || `https://www.amazon.in/dp/${ap.asin}`,
          rating: ap.rating || 4.5,
          reviewCount: ap.reviewCount || 100,
          lastScrapedAt: new Date().toISOString()
        }));
      }
    } catch {
      // non-fatal
    }
  }

  // Canonical Direct Store Offer ("Mera Store / Direct Store")
  const storePrice = product.price != null ? product.price : (product.lowestPrice || 0);
  const ourStoreOffer = {
    id: `direct-store-${product.id}`,
    provider: 'my_store',
    providerName: 'Our Direct Store (Mera Store)',
    store: 'Our Direct Store (Mera Store)',
    title: product.title,
    image: product.image,
    price: storePrice,
    mrp: product.originalPrice || storePrice,
    originalPrice: product.originalPrice || storePrice,
    discount: product.originalPrice && product.originalPrice > storePrice
      ? Math.round(((product.originalPrice - storePrice) / product.originalPrice) * 100)
      : 0,
    shippingCost: 0,
    totalCost: storePrice,
    deliveryInfo: 'Direct Store Express Delivery',
    availability: product.availability !== false && product.availability !== 'Out of Stock',
    seller: 'Our Direct Store',
    productUrl: `/products/${product.slug || product.id}`,
    affiliateUrl: `/products/${product.slug || product.id}`,
    rating: product.rating || 4.9,
    reviewCount: product.reviewCount || 12,
    variant: product.model || null,
    lastScrapedAt: product.updatedAt || new Date().toISOString(),
    lastUpdated: product.updatedAt || new Date().toISOString(),
    isOurStore: true
  };

  const combinedOffers = [ourStoreOffer, ...listings];
  const sorted   = [...combinedOffers].sort((a, b) => (a.price + (a.shippingCost || 0)) - (b.price + (b.shippingCost || 0)));
  const costs    = sorted.map(l => l.price + (l.shippingCost || 0));
  const lowest   = Math.min(...costs);
  const highest  = Math.max(...costs);
  const bestDeal = sorted[0];

  const since   = getRangeStartDate('30d');
  const historyRaw = await PriceHistory.findAll({
    where: { productId, date: { [Op.gte]: since } },
    attributes: ['provider', 'price', 'shippingCost', 'date'],
    order: [['date', 'ASC']]
  });
  const history = historyRaw.map(h => h.toJSON());
  const byProv  = {};
  for (const h of history) {
    if (!byProv[h.provider]) byProv[h.provider] = [];
    byProv[h.provider].push({ date: h.date, price: h.price + (h.shippingCost || 0) });
  }

  const atlRaw = await PriceHistory.findAll({
    where: { productId },
    attributes: ['price', 'shippingCost'],
    order: [['price', 'ASC']],
    limit: 1
  });
  const atl = atlRaw.map(a => a.toJSON());
  const allTimeLow = atl.length ? atl[0].price + (atl[0].shippingCost || 0) : lowest;

  const result = {
    success: true,
    product: { id: product.id, title: product.title, brand: product.brand, image: product.image, category: product.category, description: product.description, specifications: product.specifications, price: storePrice, originalPrice: product.originalPrice },
    analytics: { lowestPrice: lowest, highestPrice: highest, priceDifference: highest - lowest, maxSavings: highest - lowest, allTimeLow, totalProviders: combinedOffers.length, availableProviders: combinedOffers.filter(l => l.availability).length },
    bestDeal: bestDeal ? { store: bestDeal.seller || bestDeal.provider, provider: bestDeal.provider, price: bestDeal.price, totalCost: bestDeal.price + (bestDeal.shippingCost || 0), productUrl: bestDeal.productUrl, affiliateUrl: bestDeal.affiliateUrl, seller: bestDeal.seller } : null,
    offers: sorted.map(l => {
      const tc = l.price + (l.shippingCost || 0);
      return {
        id: l.id,
        provider: l.provider,
        providerName: l.providerName || l.seller || l.provider,
        store: l.store || l.seller || l.provider,
        title: l.title,
        image: l.image,
        price: l.price,
        mrp: l.mrp || l.originalPrice || l.price,
        originalPrice: l.mrp || l.originalPrice || l.price,
        discount: l.discount,
        shippingCost: l.shippingCost || 0,
        totalCost: tc,
        deliveryInfo: l.deliveryInfo,
        availability: l.availability !== false && l.availability !== 'Out of Stock',
        seller: l.seller || l.provider,
        productUrl: l.productUrl,
        affiliateUrl: l.affiliateUrl || l.productUrl,
        rating: l.rating,
        reviewCount: l.reviewCount,
        variant: l.variant,
        lastScrapedAt: l.lastScrapedAt || l.lastUpdated,
        lastUpdated: l.lastUpdated || l.lastScrapedAt,
        isLowest: tc === lowest,
        isHighest: tc === highest,
        savings: Math.round(highest - tc),
        isOurStore: Boolean(l.isOurStore)
      };
    }),
    priceHistory: { range: '30d', byProvider: byProv },
    fromCache: false,
  };

  await cacheSet(cacheKey, result, CACHE_TTL());
  return result;
};

const getPriceHistory = async (productId, range = '30d') => {
  const cacheKey = buildCacheKey('price-history', productId, range);
  const cached   = await cacheGet(cacheKey);
  if (cached) return { ...cached, fromCache: true };

  const productRaw = await Product.findByPk(productId, { attributes: ['id', 'title', 'brand', 'image'] });
  if (!productRaw) { const e = new Error('Product not found'); e.status = 404; throw e; }
  const product = productRaw.toJSON();

  const since   = getRangeStartDate(range);
  const historyRaw = await PriceHistory.findAll({
    where: { productId, date: { [Op.gte]: since } },
    attributes: ['provider', 'price', 'originalPrice', 'shippingCost', 'discount', 'availability', 'date'],
    order: [['date', 'ASC']]
  });
  const history = historyRaw.map(h => h.toJSON());

  const byProv = {};
  for (const h of history) {
    if (!byProv[h.provider]) byProv[h.provider] = [];
    byProv[h.provider].push({ date: h.date, price: h.price, totalCost: h.price + (h.shippingCost || 0), originalPrice: h.originalPrice, discount: h.discount, availability: h.availability });
  }

  const all    = history.map(h => h.price + (h.shippingCost || 0));
  const stats  = all.length ? { lowest: Math.min(...all), highest: Math.max(...all), average: Math.round(all.reduce((s, p) => s + p, 0) / all.length) } : { lowest: null, highest: null, average: null };

  const result = { success: true, product: { id: product.id, title: product.title, brand: product.brand, image: product.image }, range, stats, dataPoints: history.length, byProvider: byProv, fromCache: false };
  await cacheSet(cacheKey, result, 300);
  return result;
};

const _empty = (product) => ({
  success: true, product: { id: product.id, title: product.title, brand: product.brand, image: product.image },
  analytics: { lowestPrice: null, highestPrice: null, priceDifference: 0, maxSavings: 0, allTimeLow: null, totalProviders: 0, availableProviders: 0 },
  bestDeal: null, offers: [], priceHistory: { range: '30d', byProvider: {} }, fromCache: false,
});

const amazonService = require('./amazon/amazonService');
const flipkartService = require('./flipkart/flipkartService');
const { matchProducts } = require('./productMatcher.service');

const compareAdminProductWithAmazon = async (productId) => {
  const productRaw = await Product.findByPk(productId);
  if (!productRaw) {
    const e = new Error('Product not found');
    e.status = 404;
    throw e;
  }
  const myProduct = productRaw.toJSON();
  myProduct.price = myProduct.price != null ? myProduct.price : (myProduct.lowestPrice || 0);

  let amazonMatch = null;
  let amazonScore = 0;
  let flipkartMatch = null;
  let flipkartScore = 0;

  // 1. Parallel search on Amazon & Flipkart
  const [amazonSearchRes, flipkartSearchRes] = await Promise.all([
    (async () => {
      if (myProduct.asin) {
        const asinRes = await amazonService.getProductByAsin(myProduct.asin);
        if (asinRes && asinRes.product) return [asinRes.product];
      }
      const res = await amazonService.search(myProduct.title, { limit: 10 });
      return res.products || [];
    })().catch(() => []),
    (async () => {
      const res = await flipkartService.search(myProduct.title, { limit: 10 });
      return res.products || [];
    })().catch(() => [])
  ]);

  // Match Amazon candidate
  for (const cand of amazonSearchRes) {
    const matchRes = matchProducts(myProduct, cand);
    if (matchRes.matched && matchRes.confidence > amazonScore) {
      amazonScore = matchRes.confidence;
      amazonMatch = cand;
    } else if (!amazonMatch && matchRes.confidence >= 40 && matchRes.confidence > amazonScore) {
      amazonScore = matchRes.confidence;
      amazonMatch = cand;
    }
  }
  if (!amazonMatch && amazonSearchRes.length > 0) {
    amazonMatch = amazonSearchRes[0];
  }

  // Match Flipkart candidate
  for (const cand of flipkartSearchRes) {
    const matchRes = matchProducts(myProduct, cand);
    if (matchRes.matched && matchRes.confidence > flipkartScore) {
      flipkartScore = matchRes.confidence;
      flipkartMatch = cand;
    } else if (!flipkartMatch && matchRes.confidence >= 40 && matchRes.confidence > flipkartScore) {
      flipkartScore = matchRes.confidence;
      flipkartMatch = cand;
    }
  }
  if (!flipkartMatch && flipkartSearchRes.length > 0) {
    flipkartMatch = flipkartSearchRes[0];
  }

  // Fetch extra active listings from DB
  let extraListings = [];
  try {
    const rawListings = await ProductListing.findAll({ where: { productId, isActive: true } });
    extraListings = rawListings.map(l => l.toJSON());
  } catch {
    // non-fatal
  }

  const myPrice = myProduct.price != null ? myProduct.price : 0;
  const ourStoreOffer = {
    id: `store-${myProduct.id}`,
    store: 'Our Direct Store (Mera Store)',
    provider: 'my_store',
    providerName: 'Our Direct Store',
    providerLogo: null,
    title: myProduct.title,
    price: myPrice,
    originalPrice: myProduct.originalPrice || myPrice,
    mrp: myProduct.originalPrice || myPrice,
    discount: myProduct.originalPrice && myProduct.originalPrice > myPrice
      ? Math.round(((myProduct.originalPrice - myPrice) / myProduct.originalPrice) * 100)
      : 0,
    shippingCost: 0,
    totalCost: myPrice,
    availability: myProduct.availability || 'In Stock',
    productUrl: `/products/${myProduct.slug || myProduct.id}`,
    affiliateUrl: `/products/${myProduct.slug || myProduct.id}`,
    rating: myProduct.rating || 4.9,
    reviewCount: myProduct.reviewCount || 10,
    isOurStore: true,
    isLowest: false
  };

  const allLiveOffers = [ourStoreOffer];

  if (amazonMatch) {
    const amazonPrice = amazonMatch.price != null ? amazonMatch.price : 0;
    allLiveOffers.push({
      id: `amazon-${amazonMatch.asin || 'live'}`,
      store: 'Amazon India',
      provider: 'amazon',
      providerName: 'Amazon India',
      providerLogo: 'https://logo.clearbit.com/amazon.in',
      title: amazonMatch.title,
      price: amazonPrice,
      originalPrice: amazonMatch.originalPrice || amazonPrice,
      mrp: amazonMatch.originalPrice || amazonPrice,
      discount: amazonMatch.discount || 0,
      shippingCost: 0,
      totalCost: amazonPrice,
      availability: amazonMatch.availability || 'In Stock',
      productUrl: amazonMatch.url || `https://www.amazon.in/dp/${amazonMatch.asin}`,
      affiliateUrl: amazonMatch.url || `https://www.amazon.in/dp/${amazonMatch.asin}`,
      rating: amazonMatch.rating || 4.3,
      reviewCount: amazonMatch.reviewCount || 50,
      isOurStore: false,
      isLowest: false
    });
  }

  if (flipkartMatch) {
    const flipkartPrice = flipkartMatch.price != null ? flipkartMatch.price : 0;
    allLiveOffers.push({
      id: `flipkart-${flipkartMatch.id || flipkartMatch.productId || 'live'}`,
      store: 'Flipkart',
      provider: 'flipkart',
      providerName: 'Flipkart',
      providerLogo: 'https://logo.clearbit.com/flipkart.com',
      title: flipkartMatch.title,
      price: flipkartPrice,
      originalPrice: flipkartMatch.originalPrice || flipkartMatch.mrp || flipkartPrice,
      mrp: flipkartMatch.originalPrice || flipkartMatch.mrp || flipkartPrice,
      discount: flipkartMatch.discount || 0,
      shippingCost: 0,
      totalCost: flipkartPrice,
      availability: flipkartMatch.availability || 'In Stock',
      productUrl: flipkartMatch.url || flipkartMatch.productUrl || 'https://www.flipkart.com',
      affiliateUrl: flipkartMatch.url || flipkartMatch.productUrl || 'https://www.flipkart.com',
      rating: flipkartMatch.rating || 4.2,
      reviewCount: flipkartMatch.reviewCount || 30,
      isOurStore: false,
      isLowest: false
    });
  }

  // Include extra DB listings avoiding duplicates
  for (const l of extraListings) {
    if (l.provider !== 'amazon' && l.provider !== 'flipkart' && l.provider !== 'my_store') {
      allLiveOffers.push({
        id: l.id,
        store: l.seller || l.provider,
        provider: l.provider,
        providerName: l.seller || l.provider,
        providerLogo: `https://logo.clearbit.com/${l.provider}.com`,
        title: l.title,
        price: l.price,
        originalPrice: l.mrp || l.originalPrice || l.price,
        mrp: l.mrp || l.originalPrice || l.price,
        discount: l.discount || 0,
        shippingCost: l.shippingCost || 0,
        totalCost: l.price + (l.shippingCost || 0),
        availability: l.availability !== false && l.availability !== 'Out of Stock',
        productUrl: l.productUrl,
        affiliateUrl: l.affiliateUrl || l.productUrl,
        rating: l.rating,
        reviewCount: l.reviewCount,
        isOurStore: false,
        isLowest: false
      });
    }
  }

  // Calculate lowest price across all offers
  const validCosts = allLiveOffers.map(o => o.totalCost).filter(c => c > 0);
  const lowestPrice = validCosts.length ? Math.min(...validCosts) : myPrice;
  const highestPrice = validCosts.length ? Math.max(...validCosts) : myPrice;

  allLiveOffers.forEach(o => {
    o.isLowest = o.totalCost === lowestPrice;
    o.savings = Math.max(0, highestPrice - o.totalCost);
  });

  allLiveOffers.sort((a, b) => a.totalCost - b.totalCost);

  const bestOffer = allLiveOffers[0];
  const cheaperStore = bestOffer ? bestOffer.provider : 'my_store';
  const diff = Math.max(0, highestPrice - lowestPrice);

  return {
    success: true,
    matched: Boolean(amazonMatch || flipkartMatch),
    myProduct,
    amazonProduct: amazonMatch,
    flipkartProduct: flipkartMatch,
    allLiveOffers,
    comparison: {
      priceDifference: diff,
      cheaperStore,
      savingsAmount: diff,
      myPrice,
      amazonPrice: amazonMatch?.price ?? null,
      flipkartPrice: flipkartMatch?.price ?? null,
      isOurStoreCheaper: myPrice <= lowestPrice,
      percentageSavings: highestPrice > 0 ? Math.round((diff / highestPrice) * 100) : 0
    },
    message: (amazonMatch || flipkartMatch) ? null : 'Live market comparison unavailable. No matching live product found.'
  };
};

const compareAmazonProductWithAdmin = async (asinOrQuery) => {
  const cleanKey = String(asinOrQuery || '').trim();
  if (!cleanKey) {
    const e = new Error('ASIN or search term required');
    e.status = 400;
    throw e;
  }

  let amazonProduct = null;
  const asinRes = await amazonService.getProductByAsin(cleanKey);
  if (asinRes && asinRes.product) {
    amazonProduct = asinRes.product;
  } else {
    const searchRes = await amazonService.search(cleanKey, { limit: 5 });
    if (searchRes && searchRes.products && searchRes.products.length > 0) {
      amazonProduct = searchRes.products[0];
    }
  }

  if (!amazonProduct) {
    return {
      success: true,
      matched: false,
      amazonProduct: null,
      myProduct: null,
      flipkartProduct: null,
      comparison: null,
      message: 'Amazon product details unavailable.'
    };
  }

  const activeAdminProducts = await Product.findAll({ where: { isActive: true } });
  let bestMatch = null;
  let bestScore = 0;

  for (const p of activeAdminProducts) {
    const myProd = p.toJSON();
    myProd.price = myProd.price != null ? myProd.price : (myProd.lowestPrice || 0);

    const matchRes = matchProducts(myProd, amazonProduct);
    if (matchRes.matched && matchRes.confidence > bestScore) {
      bestScore = matchRes.confidence;
      bestMatch = myProd;
    } else if (!bestMatch && matchRes.confidence >= 50 && matchRes.confidence > bestScore) {
      bestScore = matchRes.confidence;
      bestMatch = myProd;
    }
  }

  // Also query Flipkart for live comparison if title available
  let flipkartProduct = null;
  try {
    const fkQuery = bestMatch ? bestMatch.title : amazonProduct.title;
    const fkRes = await flipkartService.search(fkQuery, { limit: 5 });
    if (fkRes && fkRes.products && fkRes.products.length > 0) {
      flipkartProduct = fkRes.products[0];
    }
  } catch {
    // non-fatal
  }

  const amazonPrice = amazonProduct.price != null ? amazonProduct.price : 0;
  const myPrice = bestMatch ? (bestMatch.price != null ? bestMatch.price : 0) : null;
  const flipkartPrice = flipkartProduct?.price != null ? flipkartProduct.price : null;

  const allLiveOffers = [
    {
      id: `amazon-${amazonProduct.asin || 'live'}`,
      store: 'Amazon India',
      provider: 'amazon',
      providerName: 'Amazon India',
      providerLogo: 'https://logo.clearbit.com/amazon.in',
      title: amazonProduct.title,
      price: amazonPrice,
      originalPrice: amazonProduct.originalPrice || amazonPrice,
      mrp: amazonProduct.originalPrice || amazonPrice,
      discount: amazonProduct.discount || 0,
      shippingCost: 0,
      totalCost: amazonPrice,
      availability: amazonProduct.availability || 'In Stock',
      productUrl: amazonProduct.url || `https://www.amazon.in/dp/${amazonProduct.asin}`,
      affiliateUrl: amazonProduct.url || `https://www.amazon.in/dp/${amazonProduct.asin}`,
      rating: amazonProduct.rating || 4.3,
      reviewCount: amazonProduct.reviewCount || 50,
      isOurStore: false,
      isLowest: false
    }
  ];

  if (bestMatch && myPrice !== null) {
    allLiveOffers.push({
      id: `store-${bestMatch.id}`,
      store: 'Our Direct Store (Mera Store)',
      provider: 'my_store',
      providerName: 'Our Direct Store',
      providerLogo: null,
      title: bestMatch.title,
      price: myPrice,
      originalPrice: bestMatch.originalPrice || myPrice,
      mrp: bestMatch.originalPrice || myPrice,
      discount: bestMatch.originalPrice && bestMatch.originalPrice > myPrice
        ? Math.round(((bestMatch.originalPrice - myPrice) / bestMatch.originalPrice) * 100)
        : 0,
      shippingCost: 0,
      totalCost: myPrice,
      availability: bestMatch.availability || 'In Stock',
      productUrl: `/products/${bestMatch.slug || bestMatch.id}`,
      affiliateUrl: `/products/${bestMatch.slug || bestMatch.id}`,
      rating: bestMatch.rating || 4.9,
      reviewCount: bestMatch.reviewCount || 10,
      isOurStore: true,
      isLowest: false
    });
  }

  if (flipkartProduct && flipkartPrice !== null) {
    allLiveOffers.push({
      id: `flipkart-${flipkartProduct.id || flipkartProduct.productId || 'live'}`,
      store: 'Flipkart',
      provider: 'flipkart',
      providerName: 'Flipkart',
      providerLogo: 'https://logo.clearbit.com/flipkart.com',
      title: flipkartProduct.title,
      price: flipkartPrice,
      originalPrice: flipkartProduct.originalPrice || flipkartProduct.mrp || flipkartPrice,
      mrp: flipkartProduct.originalPrice || flipkartProduct.mrp || flipkartPrice,
      discount: flipkartProduct.discount || 0,
      shippingCost: 0,
      totalCost: flipkartPrice,
      availability: flipkartProduct.availability || 'In Stock',
      productUrl: flipkartProduct.url || flipkartProduct.productUrl || 'https://www.flipkart.com',
      affiliateUrl: flipkartProduct.url || flipkartProduct.productUrl || 'https://www.flipkart.com',
      rating: flipkartProduct.rating || 4.2,
      reviewCount: flipkartProduct.reviewCount || 30,
      isOurStore: false,
      isLowest: false
    });
  }

  const validCosts = allLiveOffers.map(o => o.totalCost).filter(c => c > 0);
  const lowestPrice = validCosts.length ? Math.min(...validCosts) : amazonPrice;
  const highestPrice = validCosts.length ? Math.max(...validCosts) : amazonPrice;

  allLiveOffers.forEach(o => {
    o.isLowest = o.totalCost === lowestPrice;
    o.savings = Math.max(0, highestPrice - o.totalCost);
  });

  allLiveOffers.sort((a, b) => a.totalCost - b.totalCost);
  const bestOffer = allLiveOffers[0];
  const diff = Math.max(0, highestPrice - lowestPrice);

  return {
    success: true,
    matched: Boolean(bestMatch),
    amazonProduct,
    myProduct: bestMatch,
    flipkartProduct,
    allLiveOffers,
    comparison: {
      priceDifference: diff,
      cheaperStore: bestOffer ? bestOffer.provider : 'amazon',
      savingsAmount: diff,
      myPrice,
      amazonPrice,
      flipkartPrice,
      isOurStoreCheaper: myPrice !== null && myPrice <= lowestPrice,
      percentageSavings: highestPrice > 0 ? Math.round((diff / highestPrice) * 100) : 0
    },
    message: bestMatch ? null : 'Comparison unavailable. This Amazon product does not currently have a matching product in our store.'
  };
};

const compareFlipkartProductWithAdmin = async (idOrQuery) => {
  const cleanKey = String(idOrQuery || '').trim();
  if (!cleanKey) {
    const e = new Error('Product ID or search term required');
    e.status = 400;
    throw e;
  }

  let flipkartProduct = null;
  const idRes = await flipkartService.getProductById(cleanKey);
  if (idRes && idRes.product) {
    flipkartProduct = idRes.product;
  } else {
    const searchRes = await flipkartService.search(cleanKey, { limit: 5 });
    if (searchRes && searchRes.products && searchRes.products.length > 0) {
      flipkartProduct = searchRes.products[0];
    }
  }

  if (!flipkartProduct) {
    return {
      success: true,
      matched: false,
      flipkartProduct: null,
      myProduct: null,
      amazonProduct: null,
      comparison: null,
      message: 'Flipkart product details unavailable.'
    };
  }

  const activeAdminProducts = await Product.findAll({ where: { isActive: true } });
  let bestMatch = null;
  let bestScore = 0;

  for (const p of activeAdminProducts) {
    const myProd = p.toJSON();
    myProd.price = myProd.price != null ? myProd.price : (myProd.lowestPrice || 0);

    const matchRes = matchProducts(myProd, flipkartProduct);
    if (matchRes.matched && matchRes.confidence > bestScore) {
      bestScore = matchRes.confidence;
      bestMatch = myProd;
    } else if (!bestMatch && matchRes.confidence >= 40 && matchRes.confidence > bestScore) {
      bestScore = matchRes.confidence;
      bestMatch = myProd;
    }
  }

  // Search Amazon live product in parallel for comparison
  let amazonProduct = null;
  try {
    const query = bestMatch ? bestMatch.title : flipkartProduct.title;
    const amzRes = await amazonService.search(query, { limit: 5 });
    if (amzRes && amzRes.products && amzRes.products.length > 0) {
      amazonProduct = amzRes.products[0];
    }
  } catch {
    // non-fatal
  }

  const flipkartPrice = flipkartProduct.price != null ? flipkartProduct.price : 0;
  const myPrice = bestMatch ? (bestMatch.price != null ? bestMatch.price : 0) : null;
  const amazonPrice = amazonProduct?.price != null ? amazonProduct.price : null;

  const allLiveOffers = [
    {
      id: `flipkart-${flipkartProduct.id || flipkartProduct.productId || 'live'}`,
      store: 'Flipkart',
      provider: 'flipkart',
      providerName: 'Flipkart',
      providerLogo: 'https://logo.clearbit.com/flipkart.com',
      title: flipkartProduct.title,
      price: flipkartPrice,
      originalPrice: flipkartProduct.originalPrice || flipkartProduct.mrp || flipkartPrice,
      mrp: flipkartProduct.originalPrice || flipkartProduct.mrp || flipkartPrice,
      discount: flipkartProduct.discount || 0,
      shippingCost: 0,
      totalCost: flipkartPrice,
      availability: flipkartProduct.availability || 'In Stock',
      productUrl: flipkartProduct.url || flipkartProduct.productUrl || 'https://www.flipkart.com',
      affiliateUrl: flipkartProduct.url || flipkartProduct.productUrl || 'https://www.flipkart.com',
      rating: flipkartProduct.rating || 4.2,
      reviewCount: flipkartProduct.reviewCount || 30,
      isOurStore: false,
      isLowest: false
    }
  ];

  if (bestMatch && myPrice !== null) {
    allLiveOffers.push({
      id: `store-${bestMatch.id}`,
      store: 'Our Direct Store (Mera Store)',
      provider: 'my_store',
      providerName: 'Our Direct Store',
      providerLogo: null,
      title: bestMatch.title,
      price: myPrice,
      originalPrice: bestMatch.originalPrice || myPrice,
      mrp: bestMatch.originalPrice || myPrice,
      discount: bestMatch.originalPrice && bestMatch.originalPrice > myPrice
        ? Math.round(((bestMatch.originalPrice - myPrice) / bestMatch.originalPrice) * 100)
        : 0,
      shippingCost: 0,
      totalCost: myPrice,
      availability: bestMatch.availability || 'In Stock',
      productUrl: `/products/${bestMatch.slug || bestMatch.id}`,
      affiliateUrl: `/products/${bestMatch.slug || bestMatch.id}`,
      rating: bestMatch.rating || 4.9,
      reviewCount: bestMatch.reviewCount || 10,
      isOurStore: true,
      isLowest: false
    });
  }

  if (amazonProduct && amazonPrice !== null) {
    allLiveOffers.push({
      id: `amazon-${amazonProduct.asin || 'live'}`,
      store: 'Amazon India',
      provider: 'amazon',
      providerName: 'Amazon India',
      providerLogo: 'https://logo.clearbit.com/amazon.in',
      title: amazonProduct.title,
      price: amazonPrice,
      originalPrice: amazonProduct.originalPrice || amazonPrice,
      mrp: amazonProduct.originalPrice || amazonPrice,
      discount: amazonProduct.discount || 0,
      shippingCost: 0,
      totalCost: amazonPrice,
      availability: amazonProduct.availability || 'In Stock',
      productUrl: amazonProduct.url || `https://www.amazon.in/dp/${amazonProduct.asin}`,
      affiliateUrl: amazonProduct.url || `https://www.amazon.in/dp/${amazonProduct.asin}`,
      rating: amazonProduct.rating || 4.3,
      reviewCount: amazonProduct.reviewCount || 50,
      isOurStore: false,
      isLowest: false
    });
  }

  const validCosts = allLiveOffers.map(o => o.totalCost).filter(c => c > 0);
  const lowestPrice = validCosts.length ? Math.min(...validCosts) : flipkartPrice;
  const highestPrice = validCosts.length ? Math.max(...validCosts) : flipkartPrice;

  allLiveOffers.forEach(o => {
    o.isLowest = o.totalCost === lowestPrice;
    o.savings = Math.max(0, highestPrice - o.totalCost);
  });

  allLiveOffers.sort((a, b) => a.totalCost - b.totalCost);
  const bestOffer = allLiveOffers[0];
  const diff = Math.max(0, highestPrice - lowestPrice);

  return {
    success: true,
    matched: Boolean(bestMatch),
    flipkartProduct,
    myProduct: bestMatch,
    amazonProduct,
    allLiveOffers,
    comparison: {
      priceDifference: diff,
      cheaperStore: bestOffer ? bestOffer.provider : 'flipkart',
      savingsAmount: diff,
      myPrice,
      amazonPrice,
      flipkartPrice,
      isOurStoreCheaper: myPrice !== null && myPrice <= lowestPrice,
      percentageSavings: highestPrice > 0 ? Math.round((diff / highestPrice) * 100) : 0
    },
    message: bestMatch ? null : 'Comparison unavailable. This Flipkart product does not currently have a matching product in our store.'
  };
};

const getComparisonCatalog = async (query = '') => {
  const where = { isActive: true };
  if (query && String(query).trim()) {
    const q = String(query).trim();
    where[Op.or] = [
      { title: { [Op.like]: `%${q}%` } },
      { brand: { [Op.like]: `%${q}%` } },
      { category: { [Op.like]: `%${q}%` } }
    ];
  }
  const products = await Product.findAll({
    where,
    attributes: ['id', 'title', 'brand', 'image', 'category', 'price', 'originalPrice', 'availability', 'asin', 'slug'],
    limit: 60,
    order: [['updatedAt', 'DESC']]
  });
  return {
    success: true,
    total: products.length,
    products: products.map(p => p.toJSON())
  };
};

module.exports = {
  compareProduct,
  getPriceHistory,
  compareAdminProductWithAmazon,
  compareAmazonProductWithAdmin,
  compareFlipkartProductWithAdmin,
  getComparisonCatalog
};

