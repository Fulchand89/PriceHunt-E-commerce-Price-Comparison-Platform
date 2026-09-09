'use strict';

const { Op, Sequelize } = require('sequelize');
const { search }    = require('../services/productSearch.service');
const SearchHistory = require('../models/SearchHistory');
const Product       = require('../models/Product');
const { success, paginated } = require('../utils/apiResponse');
const { parsePagination, normalizeTitle } = require('../utils/helpers');

const Category     = require('../models/Category');

exports.search = async (req, res, next) => {
  try {
    const { q, page, limit, category, brand, store, minPrice, maxPrice, sort, sortBy, discount } = req.query;
    const result = await search(q, {
      page,
      limit,
      category,
      brand,
      store,
      minPrice,
      maxPrice,
      sort: sortBy || sort,
      discount,
      userId: req.user?.id || null,
      ipAddress: req.headers['x-forwarded-for']?.split(',')[0] || req.ip
    });
    return res.status(200).json(result);
  } catch (e) { next(e); }
};

exports.getSuggestions = async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    if (q.length < 2) return success(res, { suggestions: [], products: [], categories: [] });

    const nQ = normalizeTitle(q);

    const [recent, products, matchingCategories] = await Promise.all([
      SearchHistory.findAll({
        attributes: ['query', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
        where: { normalizedQuery: { [Op.like]: `%${nQ}%` } },
        group: ['query'],
        order: [[Sequelize.literal('count'), 'DESC']],
        limit: 5
      }),
      Product.findAll({
        where: {
          isActive: true,
          [Op.or]: [
            { title: { [Op.like]: `%${q}%` } },
            { brand: { [Op.like]: `%${q}%` } }
          ]
        },
        attributes: ['id', 'title', 'brand', 'image', 'lowestPrice'],
        limit: 6
      }),
      Category.findAll({
        where: {
          isActive: true,
          [Op.or]: [
            { name: { [Op.like]: `%${q}%` } },
            { slug: { [Op.like]: `%${nQ}%` } }
          ]
        },
        attributes: ['id', 'name', 'slug', 'image'],
        limit: 4
      })
    ]);

    const mappedProducts = products.map(p => {
      const json = p.toJSON();
      return {
        id: json.id,
        _id: json.id,
        title: json.title,
        brand: json.brand,
        image: json.image,
        lowestPrice: json.lowestPrice,
        type: 'product'
      };
    });

    const mappedCategories = matchingCategories.map(c => {
      const json = c.toJSON();
      return {
        id: json.id,
        _id: json.id,
        name: json.name,
        slug: json.slug,
        image: json.image
      };
    });

    const suggestions = [
      ...recent.map(s => ({ type: 'recent', text: s.query })),
      ...mappedProducts.map(p => ({ type: 'product', text: p.title, id: p.id, image: p.image, lowestPrice: p.lowestPrice }))
    ];

    return success(res, {
      suggestions,
      products: mappedProducts,
      categories: mappedCategories
    });
  } catch (e) { next(e); }
};

exports.getSearchHistory = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { rows: records, count: total } = await SearchHistory.findAndCountAll({
      where: { userId: req.user.id },
      attributes: ['query', 'resultCount', 'fromCache', 'searchedAt'],
      order: [['searchedAt', 'DESC']],
      offset: skip,
      limit
    });
    return paginated(res, { data: records.map(r => r.toJSON()), total, page, limit });
  } catch (e) { next(e); }
};

exports.clearSearchHistory = async (req, res, next) => {
  try {
    await SearchHistory.destroy({ where: { userId: req.user.id } });
    return success(res, {}, 'Search history cleared');
  } catch (e) { next(e); }
};
