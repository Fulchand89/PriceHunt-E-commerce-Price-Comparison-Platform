'use strict';

const { Op } = require('sequelize');
const User           = require('../models/User');
const Product        = require('../models/Product');
const ProductListing = require('../models/ProductListing');
const { success, notFound, error:apiErr } = require('../utils/apiResponse');

exports.getWatchlist = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return apiErr(res, 'User not found', 404);
    
    const watchlistIds = Array.isArray(user.watchlist) ? user.watchlist : [];
    if (watchlistIds.length === 0) {
      return success(res, { watchlist: [], count: 0 });
    }

    const products = await Product.findAll({
      where: { id: { [Op.in]: watchlistIds }, isActive: true },
      attributes: ['id', 'title', 'brand', 'image', 'lowestPrice', 'highestPrice', 'category']
    });

    const enriched = await Promise.all(products.map(async p => {
      const pJson = p.toJSON();
      const bestRaw = await ProductListing.findOne({
        where: { productId: pJson.id, availability: true, isActive: true },
        order: [['price', 'ASC']],
        attributes: ['provider', 'price', 'shippingCost', 'discount', 'productUrl', 'affiliateUrl', 'lastUpdated']
      });
      return { ...pJson, bestOffer: bestRaw ? bestRaw.toJSON() : null };
    }));

    return success(res, { watchlist: enriched, count: enriched.length });
  } catch (e) { next(e); }
};

exports.addToWatchlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const product = await Product.findOne({ where: { id: productId, isActive: true } });
    if (!product) return notFound(res, 'Product not found');
    const user = await User.findByPk(req.user.id);
    if (!user) return apiErr(res, 'User not found', 404);

    let watchlist = Array.isArray(user.watchlist) ? [...user.watchlist] : [];
    if (watchlist.includes(productId)) {
      return res.status(409).json({ success: false, message: 'Product already in watchlist' });
    }
    watchlist.push(productId);
    user.watchlist = watchlist;
    await user.save();
    return success(res, { productId }, 'Added to watchlist', 201);
  } catch (e) { next(e); }
};

exports.removeFromWatchlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const user = await User.findByPk(req.user.id);
    if (!user) return apiErr(res, 'User not found', 404);

    let watchlist = Array.isArray(user.watchlist) ? [...user.watchlist] : [];
    const before = watchlist.length;
    watchlist = watchlist.filter(id => id !== productId);
    if (watchlist.length === before) return notFound(res, 'Product not in watchlist');

    user.watchlist = watchlist;
    await user.save();
    return success(res, {}, 'Removed from watchlist');
  } catch (e) { next(e); }
};

exports.clearWatchlist = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (user) {
      user.watchlist = [];
      await user.save();
    }
    return success(res, {}, 'Watchlist cleared');
  } catch (e) { next(e); }
};
