'use strict';

const {
  compareProduct,
  getPriceHistory,
  compareAdminProductWithAmazon,
  compareAmazonProductWithAdmin,
  compareFlipkartProductWithAdmin,
  getComparisonCatalog
} = require('../services/comparison.service');
const { isValidObjectId } = require('../utils/helpers');
const { error:apiErr }    = require('../utils/apiResponse');

exports.getCatalog = async (req, res, next) => {
  try {
    const result = await getComparisonCatalog(req.query.q || req.query.query || '');
    return res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

exports.compareProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!isValidObjectId(productId)) return apiErr(res, 'Invalid product ID', 400);
    const result = await compareProduct(productId);
    return res.status(200).json(result);
  } catch (e) { if (e.status===404) return apiErr(res, e.message, 404); next(e); }
};

exports.getPriceHistory = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!isValidObjectId(productId)) return apiErr(res, 'Invalid product ID', 400);
    const result = await getPriceHistory(productId, req.query.range||'30d');
    return res.status(200).json(result);
  } catch (e) { if (e.status===404) return apiErr(res, e.message, 404); next(e); }
};

exports.compareAdminWithAmazon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await compareAdminProductWithAmazon(id);
    return res.status(200).json(result);
  } catch (e) { if (e.status===404) return apiErr(res, e.message, 404); next(e); }
};

exports.compareAmazonWithAdmin = async (req, res, next) => {
  try {
    const { asin } = req.params;
    const result = await compareAmazonProductWithAdmin(asin);
    return res.status(200).json(result);
  } catch (e) { if (e.status===404) return apiErr(res, e.message, 404); next(e); }
};

exports.compareFlipkartWithAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await compareFlipkartProductWithAdmin(id);
    return res.status(200).json(result);
  } catch (e) { if (e.status===404) return apiErr(res, e.message, 404); next(e); }
};
