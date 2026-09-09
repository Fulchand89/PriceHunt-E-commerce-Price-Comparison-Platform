'use strict';

const PriceAlert     = require('../models/PriceAlert');
const Product        = require('../models/Product');
const ProductListing = require('../models/ProductListing');
const { success, created, paginated, notFound, error:apiErr, forbidden } = require('../utils/apiResponse');
const { parsePagination, omitEmpty } = require('../utils/helpers');
const logger = require('../utils/logger');
const log    = logger.child('AlertCtrl');

exports.getAlerts = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const where = { userId: req.user.id };
    if (req.query.active !== undefined) where.isActive = req.query.active === 'true';

    const { rows: alertsRaw, count: total } = await PriceAlert.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: skip,
      limit
    });

    const alerts = await Promise.all(alertsRaw.map(async a => {
      const aJson = a.toJSON();
      const product = await Product.findByPk(aJson.productId, {
        attributes: ['id', 'title', 'brand', 'image', 'lowestPrice']
      });
      return { ...aJson, productId: product ? product.toJSON() : null };
    }));

    return paginated(res, { data: alerts, total, page, limit });
  } catch (e) { next(e); }
};

exports.createAlert = async (req, res, next) => {
  try {
    const { productId, targetPrice, provider, currency, retriggerAfterDays } = req.body;
    const product = await Product.findOne({ where: { id: productId, isActive: true } });
    if (!product) return notFound(res, 'Product not found');

    const dup = await PriceAlert.findOne({
      where: { userId: req.user.id, productId, provider: provider || null, isActive: true }
    });
    if (dup) return res.status(409).json({ success: false, message: 'Active alert already exists', existingAlertId: dup.id });

    const best = await ProductListing.findOne({
      where: { productId, availability: true, isActive: true },
      order: [['price', 'ASC']],
      attributes: ['price', 'shippingCost']
    });
    const currentPrice = best ? best.price + (best.shippingCost || 0) : product.lowestPrice || null;

    const alert = await PriceAlert.create({
      userId: req.user.id,
      productId,
      targetPrice,
      currentPrice,
      provider: provider || null,
      currency: currency || 'INR',
      retriggerAfterDays: retriggerAfterDays || 0
    });

    log.info(`Alert created user=${req.user.id} product=${productId} target=${targetPrice}`);
    const alertJson = alert.toJSON();
    alertJson.productId = product.toJSON();

    return created(res, { alert: alertJson }, 'Price alert created');
  } catch (e) { next(e); }
};

exports.getAlertById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alert = await PriceAlert.findByPk(id);
    if (!alert) return notFound(res, 'Alert not found');
    if (alert.userId !== req.user.id && req.user.role !== 'admin') return forbidden(res);

    const alertJson = alert.toJSON();
    const product = await Product.findByPk(alertJson.productId, {
      attributes: ['id', 'title', 'brand', 'image', 'lowestPrice']
    });
    alertJson.productId = product ? product.toJSON() : null;

    return success(res, { alert: alertJson });
  } catch (e) { next(e); }
};

exports.updateAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alert = await PriceAlert.findByPk(id);
    if (!alert) return notFound(res, 'Alert not found');
    if (alert.userId !== req.user.id) return forbidden(res);

    const updates = omitEmpty({ targetPrice: req.body.targetPrice, isActive: req.body.isActive, retriggerAfterDays: req.body.retriggerAfterDays });
    if (updates.targetPrice && updates.targetPrice !== alert.targetPrice) {
      updates.notificationSent = false;
      updates.notificationSentAt = null;
    }

    await alert.update(updates);

    const alertJson = alert.toJSON();
    const product = await Product.findByPk(alertJson.productId, {
      attributes: ['id', 'title', 'brand', 'image', 'lowestPrice']
    });
    alertJson.productId = product ? product.toJSON() : null;

    return success(res, { alert: alertJson }, 'Alert updated');
  } catch (e) { next(e); }
};

exports.deleteAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const alert = await PriceAlert.findByPk(id);
    if (!alert) return notFound(res, 'Alert not found');
    if (alert.userId !== req.user.id && req.user.role !== 'admin') return forbidden(res);
    await alert.destroy();
    return success(res, {}, 'Alert deleted');
  } catch (e) { next(e); }
};

exports.getAlertStats = async (req, res, next) => {
  try {
    const uid = req.user.id;
    const [total, active, triggered] = await Promise.all([
      PriceAlert.count({ where: { userId: uid } }),
      PriceAlert.count({ where: { userId: uid, isActive: true } }),
      PriceAlert.count({ where: { userId: uid, notificationSent: true } })
    ]);
    return success(res, { stats: { total, active, triggered, inactive: total - active } });
  } catch (e) { next(e); }
};
