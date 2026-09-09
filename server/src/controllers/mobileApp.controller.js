'use strict';

const { Op }          = require('sequelize');
const Product        = require('../models/Product');
const ProductListing = require('../models/ProductListing');
const Category       = require('../models/Category');
const Store          = require('../models/Store');
const Banner         = require('../models/Banner');
const Offer          = require('../models/Offer');
const User           = require('../models/User');
const { search }     = require('../services/productSearch.service');
const { success, notFound, error: apiErr } = require('../utils/apiResponse');
const logger         = require('../utils/logger');
const log            = logger.child('MobileAppCtrl');

exports.getAppConfig = async (req, res, next) => {
  try {
    const config = {
      app: {
        name: 'PriceHunt',
        latestVersion: '2.0.0',
        minSupportedVersion: '1.0.0',
        forceUpdate: false,
        maintenanceMode: false,
        updateMessage: 'A new version of PriceHunt with faster search is available!',
      },
      features: {
        barcodeScanner: true,
        voiceSearch: true,
        priceDropAlerts: true,
        offlineWishlist: true,
      },
      supportedStores: ['amazon', 'flipkart', 'croma', 'relianceDigital', 'myntra', 'ajio', 'meesho', 'vijaySales'],
    };
    return success(res, config, 'Mobile app config retrieved');
  } catch (e) { next(e); }
};

exports.getHomeFeed = async (req, res, next) => {
  try {
    const [bannersRaw, categoriesRaw, topProductsRaw, offersRaw] = await Promise.all([
      Banner.findAll({ where: { isActive: true }, order: [['position', 'ASC']] }),
      Category.findAll({ where: { isActive: true }, order: [['name', 'ASC']], limit: 10 }),
      Product.findAll({ where: { isActive: true }, order: [['viewCount', 'DESC'], ['createdAt', 'DESC']], limit: 10 }),
      Offer.findAll({ where: { isActive: true }, limit: 5 }),
    ]);

    const banners = bannersRaw.map(b => b.toJSON());
    const categories = categoriesRaw.map(c => c.toJSON());
    const topProducts = topProductsRaw.map(p => p.toJSON());
    const offers = offersRaw.map(o => o.toJSON());

    const formattedProducts = await Promise.all(
      topProducts.map(async (p) => {
        const listingsRaw = await ProductListing.findAll({ where: { productId: p.id, isActive: true } });
        const listings = listingsRaw.map(l => l.toJSON());
        const prices = listings.map(l => l.price).filter(price => price > 0);
        return {
          id: p.id,
          title: p.title,
          brand: p.brand,
          category: p.category,
          image: p.image,
          lowestPrice: prices.length ? Math.min(...prices) : p.lowestPrice || 0,
          highestPrice: prices.length ? Math.max(...prices) : p.highestPrice || 0,
          storeCount: listings.length || 1,
        };
      })
    );

    const payload = {
      banners: banners.length ? banners : [
        {
          _id: 'b1',
          id: 'b1',
          title: 'Mega Savings Week',
          subtitle: 'Compare prices on iPhone 16 & Galaxy S24',
          image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1000&auto=format&fit=crop&q=80',
          linkUrl: '/search?q=iPhone',
        }
      ],
      categories: categories.length ? categories : [
        { _id: 'cat1', id: 'cat1', name: 'Mobiles', slug: 'mobiles', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=80' },
        { _id: 'cat2', id: 'cat2', name: 'Laptops', slug: 'laptops', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&auto=format&fit=crop&q=80' },
        { _id: 'cat3', id: 'cat3', name: 'Audio', slug: 'electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80' },
        { _id: 'cat4', id: 'cat4', name: 'Fashion', slug: 'fashion', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=80' },
      ],
      trendingProducts: formattedProducts,
      offers,
    };

    return success(res, payload, 'Mobile home feed retrieved');
  } catch (e) { next(e); }
};

exports.scanBarcode = async (req, res, next) => {
  try {
    const { barcode, query } = req.body;
    const searchCode = (barcode || query || '').trim();

    if (!searchCode) return apiErr(res, 'Barcode or product code is required', 400);

    log.info(`Mobile Barcode Scan query: "${searchCode}"`);

    let product = await Product.findOne({
      where: {
        [Op.or]: [
          { gtin: searchCode },
          { mpn: searchCode },
          { title: { [Op.like]: `%${searchCode}%` } }
        ]
      }
    });

    if (!product) {
      const searchResult = await search(searchCode, { limit: 5 });
      if (searchResult.results && searchResult.results.length > 0) {
        return success(res, {
          matched: true,
          product: searchResult.results[0],
          allMatches: searchResult.results,
        }, 'Barcode product matched via live search');
      }
      return notFound(res, 'Product not found for scanned barcode');
    }

    const pJson = product.toJSON();
    const listingsRaw = await ProductListing.findAll({ where: { productId: pJson.id, isActive: true } });
    return success(res, {
      matched: true,
      product: {
        ...pJson,
        listings: listingsRaw.map(l => l.toJSON()),
      }
    }, 'Barcode product found');
  } catch (e) { next(e); }
};

exports.registerPushToken = async (req, res, next) => {
  try {
    const { pushToken, platform } = req.body;
    if (!pushToken) return apiErr(res, 'Push token is required', 400);

    if (req.user) {
      const user = await User.findByPk(req.user.id);
      if (user) {
        await user.update({ pushToken, devicePlatform: platform || 'android' });
      }
    }

    log.info(`Push token registered for platform: ${platform || 'android'}`);
    return success(res, { registered: true }, 'Push token registered successfully');
  } catch (e) { next(e); }
};

exports.getDealOfTheDay = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      where: { isActive: true },
      order: [['viewCount', 'DESC']]
    });
    if (!product) return notFound(res, 'No deal of the day available');

    const pJson = product.toJSON();
    const listingsRaw = await ProductListing.findAll({ where: { productId: pJson.id, isActive: true } });
    const listings = listingsRaw.map(l => l.toJSON());
    const prices = listings.map(l => l.price).filter(p => p > 0);

    return success(res, {
      id: pJson.id,
      title: pJson.title,
      image: pJson.image,
      lowestPrice: prices.length ? Math.min(...prices) : pJson.lowestPrice,
      highestPrice: prices.length ? Math.max(...prices) : pJson.highestPrice,
      discount: 25,
      listings,
    }, 'Deal of the day retrieved');
  } catch (e) { next(e); }
};
