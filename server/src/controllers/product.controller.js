'use strict';

const { Op } = require('sequelize');
const Product        = require('../models/Product');
const ProductListing = require('../models/ProductListing');
const { success, created, paginated, notFound, error:apiErr } = require('../utils/apiResponse');
const { parsePagination, normalizeTitle, omitEmpty } = require('../utils/helpers');
const { cacheDelPattern } = require('../config/redis');

exports.getProducts = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const where = { isActive: true };
    if (req.query.brand)    where.brand    = { [Op.like]: `%${req.query.brand}%` };
    if (req.query.category) where.category = { [Op.like]: `%${req.query.category}%` };
    if (req.query.minPrice) where.lowestPrice  = { [Op.gte]: Number(req.query.minPrice) };
    if (req.query.maxPrice) where.highestPrice = { [Op.lte]: Number(req.query.maxPrice) };
    if (req.query.q)        where.title    = { [Op.like]: `%${req.query.q}%` };

    const sortMap = {
      price_asc: [['lowestPrice', 'ASC']],
      price_desc: [['highestPrice', 'DESC']],
      popular: [['viewCount', 'DESC']]
    };
    const order = sortMap[req.query.sort] || [['createdAt', 'DESC']];

    let { rows: products, count: total } = await Product.findAndCountAll({
      where,
      order,
      offset: skip,
      limit
    });

    products = products.map(p => p.toJSON());

    // Enrich products with live listings to ensure accurate real-time prices & offers
    const pIds = products.map(p => p.id);
    const listingsRaw = await ProductListing.findAll({
      where: { productId: { [Op.in]: pIds }, isActive: true }
    });
    const allListings = listingsRaw.map(l => l.toJSON());

    products = products.map(p => {
      const pListings = allListings.filter(l => String(l.productId) === String(p.id));
      const validPrices = pListings.map(l => l.price).filter(pr => pr > 0);
      const lowest = validPrices.length ? Math.min(...validPrices) : (p.lowestPrice || 0);
      const highest = validPrices.length ? Math.max(...validPrices) : (p.highestPrice || lowest);
      return {
        ...p,
        lowestPrice: lowest,
        highestPrice: highest,
        totalOffers: pListings.length || (lowest > 0 ? 1 : 0),
        offers: pListings
      };
    });

    return paginated(res, { data: products, total, page, limit });
  } catch (e) { next(e); }
};

exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product || !product.isActive) return notFound(res, 'Product not found');
    product.increment('viewCount').catch(() => {});
    
    const listingsRaw = await ProductListing.findAll({
      where: { productId: id, isActive: true },
      order: [['price', 'ASC']]
    });
    const listings = listingsRaw.map(l => l.toJSON());

    return success(res, { product: { ...product.toJSON(), listings } });
  } catch (e) { next(e); }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { name, title, brand, category, description, image, images, specifications, price, originalPrice, stock, availability, model, modelNumber, sku, asin, isActive } = req.body;
    const finalTitle = title || name || 'New Product';
    const nTitle = normalizeTitle(finalTitle);
    const existing = await Product.findOne({ where: { normalizedTitle: nTitle } });
    if (existing) return res.status(409).json({ success:false, message:'Similar product already exists', existing:{ id:existing.id, title:existing.title } });
    
    const parsedPrice = price != null ? Number(price) : null;
    const parsedOriginalPrice = originalPrice != null ? Number(originalPrice) : null;

    const product = await Product.create({
      title: finalTitle,
      normalizedTitle: nTitle,
      brand: brand || '',
      category: category || '',
      description: description || '',
      image: image || (Array.isArray(images) ? images[0] : null) || null,
      images: Array.isArray(images) ? images : (image ? [image] : []),
      specifications: specifications || [],
      price: parsedPrice,
      lowestPrice: parsedPrice,
      originalPrice: parsedOriginalPrice,
      highestPrice: parsedOriginalPrice,
      stock: stock != null ? Number(stock) : 10,
      availability: availability || 'In Stock',
      model: model || '',
      modelNumber: modelNumber || '',
      sku: sku || '',
      asin: asin || '',
      isActive: isActive !== false
    });
    return created(res, { product: product.toJSON() }, 'Product created');
  } catch (e) { next(e); }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowed = ['name','title','brand','category','description','image','images','specifications','price','originalPrice','stock','availability','model','modelNumber','sku','asin','isActive'];
    const body = req.body;
    const updates = {};

    for (const key of allowed) {
      if (body[key] !== undefined) {
        if (key === 'name' || key === 'title') {
          updates.title = body[key];
        } else {
          updates[key] = body[key];
        }
      }
    }

    if (updates.title) updates.normalizedTitle = normalizeTitle(updates.title);
    if (updates.price != null) {
      updates.price = Number(updates.price);
      updates.lowestPrice = updates.price;
    }
    if (updates.originalPrice != null) {
      updates.originalPrice = Number(updates.originalPrice);
      updates.highestPrice = updates.originalPrice;
    }
    if (updates.image && (!updates.images || updates.images.length === 0)) {
      updates.images = [updates.image];
    }

    const product = await Product.findByPk(id);
    if (!product) return notFound(res, 'Product not found');
    await product.update(updates);
    await cacheDelPattern(`compare:${id}`); await cacheDelPattern(`price-history:${id}`);
    return success(res, { product: product.toJSON() }, 'Product updated');
  } catch (e) { next(e); }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) return notFound(res, 'Product not found');
    await product.destroy();
    await ProductListing.destroy({ where: { productId: id } });
    await cacheDelPattern(`compare:${id}`);
    return success(res, {}, 'Product deleted');
  } catch (e) { next(e); }
};

exports.getTrendingProducts = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '10', 10), 50);
    let products = await Product.findAll({
      where: { isActive: true, lowestPrice: { [Op.ne]: null } },
      order: [['viewCount', 'DESC'], ['lowestPrice', 'ASC']],
      limit
    });

    if (products.length === 0) {
      const scraperOrchestrator = require('../services/scraperOrchestrator.service');
      await scraperOrchestrator.searchAcrossStores('iPhone 16', { limit });
      products = await Product.findAll({
        where: { isActive: true, lowestPrice: { [Op.ne]: null } },
        order: [['viewCount', 'DESC'], ['lowestPrice', 'ASC']],
        limit
      });
    }

    return success(res, { products: products.map(p => p.toJSON()) });
  } catch (e) { next(e); }
};
