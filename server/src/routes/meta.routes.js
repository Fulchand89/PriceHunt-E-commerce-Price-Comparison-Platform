'use strict';

/**
 * Meta & Content Routes — Categories, Brands, Stores, Sellers, Banners, Blog, FAQs, Offers.
 * Full CRUD (Create, Read, Update, Delete) + Public GET endpoints.
 */

const router   = require('express').Router();
const { Op }   = require('sequelize');
const Category = require('../models/Category');
const Brand    = require('../models/Brand');
const Store    = require('../models/Store');
const Seller   = require('../models/Seller');
const Banner   = require('../models/Banner');
const BlogPost = require('../models/BlogPost');
const FAQ      = require('../models/FAQ');
const Product  = require('../models/Product');
const Provider = require('../models/Provider');
const Offer    = require('../models/Offer');

const { protect }       = require('../middleware/auth.middleware');
const { requireAdmin }  = require('../middleware/admin.middleware');
const { success, created, notFound } = require('../utils/apiResponse');
const { cacheDelPattern }       = require('../config/redis');

// ── CATEGORIES ─────────────────────────────────────────────────────────────
router.get('/categories', async (req, res, next) => {
  try {
    const rawCategories = await Category.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']]
    });
    let categories = rawCategories.map(c => c.toJSON());

    if (!categories.length) {
      const products = await Product.findAll({
        attributes: ['category'],
        where: { isActive: true },
        group: ['category']
      });
      const distinct = products.map(p => p.category).filter(Boolean);
      categories = distinct.sort().map(c => ({
        id: c,
        _id: c,
        name: c,
        slug: c.toLowerCase().replace(/\s+/g, '-'),
        productCount: 0,
        image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=300&auto=format&fit=crop&q=80',
      }));
    }
    return success(res, categories);
  } catch (e) { next(e); }
});

router.post('/categories', protect, requireAdmin, async (req, res, next) => {
  try {
    const { name, description, image } = req.body;
    const slug = (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const category = await Category.create({ name, slug, description, image });
    await cacheDelPattern('meta:*');
    return created(res, category, 'Category created');
  } catch (e) { next(e); }
});

router.put('/categories/:id', protect, requireAdmin, async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return notFound(res, 'Category not found');
    await category.update(req.body);
    await cacheDelPattern('meta:*');
    return success(res, category, 'Category updated');
  } catch (e) { next(e); }
});

router.delete('/categories/:id', protect, requireAdmin, async (req, res, next) => {
  try {
    await Category.destroy({ where: { id: req.params.id } });
    await cacheDelPattern('meta:*');
    return success(res, {}, 'Category deleted');
  } catch (e) { next(e); }
});

// ── BRANDS ─────────────────────────────────────────────────────────────────
router.get('/brands', async (req, res, next) => {
  try {
    const rawBrands = await Brand.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']]
    });
    let brands = rawBrands.map(b => b.toJSON());

    if (!brands.length) {
      const products = await Product.findAll({
        attributes: ['brand'],
        where: { isActive: true },
        group: ['brand']
      });
      const distinct = products.map(p => p.brand).filter(Boolean);
      brands = distinct.sort().map(b => ({
        id: b,
        _id: b,
        name: b,
        slug: b.toLowerCase().replace(/\s+/g, '-'),
        logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
        description: 'Verified Manufacturer',
      }));
    }
    return success(res, brands);
  } catch (e) { next(e); }
});

router.post('/brands', protect, requireAdmin, async (req, res, next) => {
  try {
    const { name, logo, description, website } = req.body;
    const slug = (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const brand = await Brand.create({ name, slug, logo, description, website });
    await cacheDelPattern('meta:*');
    return created(res, brand, 'Brand created');
  } catch (e) { next(e); }
});

router.put('/brands/:id', protect, requireAdmin, async (req, res, next) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return notFound(res, 'Brand not found');
    await brand.update(req.body);
    await cacheDelPattern('meta:*');
    return success(res, brand, 'Brand updated');
  } catch (e) { next(e); }
});

router.delete('/brands/:id', protect, requireAdmin, async (req, res, next) => {
  try {
    await Brand.destroy({ where: { id: req.params.id } });
    await cacheDelPattern('meta:*');
    return success(res, {}, 'Brand deleted');
  } catch (e) { next(e); }
});

// ── STORES ─────────────────────────────────────────────────────────────────
router.get('/stores', async (req, res, next) => {
  try {
    const rawStores = await Store.findAll({ where: { isActive: true } });
    let stores = rawStores.map(s => s.toJSON());

    if (!stores.length) {
      const rawProviders = await Provider.findAll({ where: { enabled: true } });
      const providers = rawProviders.map(p => p.toJSON());
      stores = providers.map(p => ({
        id: p.id || p.key,
        _id: p.id || p.key,
        key: p.key,
        name: p.name,
        logo: p.logo,
        websiteUrl: p.homepage || 'https://example.com',
        affiliateUrl: p.homepage ? `${p.homepage}/?tag=pricehunt` : 'https://example.com',
        status: p.status === 'ready' || p.status === 'healthy',
      }));
    }
    return success(res, stores);
  } catch (e) { next(e); }
});

router.post('/stores', protect, requireAdmin, async (req, res, next) => {
  try {
    const { name, websiteUrl, affiliateUrl, logo } = req.body;
    const key = name.toLowerCase().replace(/[^a-z0-9]+/g, '');
    const store = await Store.create({ key, name, websiteUrl, affiliateUrl, logo });
    return created(res, store, 'Store created');
  } catch (e) { next(e); }
});

router.put('/stores/:id', protect, requireAdmin, async (req, res, next) => {
  try {
    const store = await Store.findByPk(req.params.id);
    if (!store) return notFound(res, 'Store not found');
    await store.update(req.body);
    return success(res, store, 'Store updated');
  } catch (e) { next(e); }
});

router.delete('/stores/:id', protect, requireAdmin, async (req, res, next) => {
  try {
    await Store.destroy({ where: { id: req.params.id } });
    return success(res, {}, 'Store deleted');
  } catch (e) { next(e); }
});

// ── SELLERS ────────────────────────────────────────────────────────────────
router.get('/sellers', async (req, res, next) => {
  try {
    const sellersRaw = await Seller.findAll({ where: { isActive: true } });
    return success(res, sellersRaw.map(s => s.toJSON()));
  } catch (e) { next(e); }
});

router.post('/sellers', protect, requireAdmin, async (req, res, next) => {
  try {
    const seller = await Seller.create(req.body);
    return created(res, seller, 'Seller added');
  } catch (e) { next(e); }
});

router.put('/sellers/:id', protect, requireAdmin, async (req, res, next) => {
  try {
    const seller = await Seller.findByPk(req.params.id);
    if (!seller) return notFound(res, 'Seller not found');
    await seller.update(req.body);
    return success(res, seller, 'Seller updated');
  } catch (e) { next(e); }
});

router.delete('/sellers/:id', protect, requireAdmin, async (req, res, next) => {
  try {
    await Seller.destroy({ where: { id: req.params.id } });
    return success(res, {}, 'Seller deleted');
  } catch (e) { next(e); }
});

// ── BANNERS ────────────────────────────────────────────────────────────────
router.get('/banners', async (req, res, next) => {
  try {
    const bannersRaw = await Banner.findAll({
      where: { isActive: true },
      order: [['position', 'ASC']]
    });
    return success(res, bannersRaw.map(b => b.toJSON()));
  } catch (e) { next(e); }
});

router.post('/banners', protect, requireAdmin, async (req, res, next) => {
  try {
    const banner = await Banner.create(req.body);
    return created(res, banner, 'Banner created');
  } catch (e) { next(e); }
});

router.put('/banners/:id', protect, requireAdmin, async (req, res, next) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return notFound(res, 'Banner not found');
    await banner.update(req.body);
    return success(res, banner, 'Banner updated');
  } catch (e) { next(e); }
});

router.delete('/banners/:id', protect, requireAdmin, async (req, res, next) => {
  try {
    await Banner.destroy({ where: { id: req.params.id } });
    return success(res, {}, 'Banner deleted');
  } catch (e) { next(e); }
});

// ── BLOG ───────────────────────────────────────────────────────────────────
router.get('/blog', async (req, res, next) => {
  try {
    const postsRaw = await BlogPost.findAll({
      where: { isPublished: true },
      order: [['publishedAt', 'DESC']]
    });
    return success(res, postsRaw.map(p => p.toJSON()));
  } catch (e) { next(e); }
});

router.get('/blog/:slug', async (req, res, next) => {
  try {
    const post = await BlogPost.findOne({ where: { slug: req.params.slug, isPublished: true } });
    if (!post) return notFound(res, 'Article not found');
    await post.increment('views').catch(() => {});
    return success(res, post.toJSON());
  } catch (e) { next(e); }
});

router.post('/blog', protect, requireAdmin, async (req, res, next) => {
  try {
    const { title, content, excerpt, coverImage, author, tags } = req.body;
    const slug = (title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const post = await BlogPost.create({ title, slug, content, excerpt, coverImage, author: author || 'PriceHunt Editorial', tags });
    return created(res, post, 'Blog post published');
  } catch (e) { next(e); }
});

router.put('/blog/:id', protect, requireAdmin, async (req, res, next) => {
  try {
    const post = await BlogPost.findByPk(req.params.id);
    if (!post) return notFound(res, 'Blog post not found');
    await post.update(req.body);
    return success(res, post, 'Blog post updated');
  } catch (e) { next(e); }
});

router.delete('/blog/:id', protect, requireAdmin, async (req, res, next) => {
  try {
    await BlogPost.destroy({ where: { id: req.params.id } });
    return success(res, {}, 'Blog post deleted');
  } catch (e) { next(e); }
});

// ── FAQS ───────────────────────────────────────────────────────────────────
router.get('/faqs', async (req, res, next) => {
  try {
    const faqsRaw = await FAQ.findAll({
      where: { isActive: true },
      order: [['order', 'ASC']]
    });
    return success(res, faqsRaw.map(f => f.toJSON()));
  } catch (e) { next(e); }
});

router.post('/faqs', protect, requireAdmin, async (req, res, next) => {
  try {
    const faq = await FAQ.create(req.body);
    return created(res, faq, 'FAQ created');
  } catch (e) { next(e); }
});

router.put('/faqs/:id', protect, requireAdmin, async (req, res, next) => {
  try {
    const faq = await FAQ.findByPk(req.params.id);
    if (!faq) return notFound(res, 'FAQ not found');
    await faq.update(req.body);
    return success(res, faq, 'FAQ updated');
  } catch (e) { next(e); }
});

router.delete('/faqs/:id', protect, requireAdmin, async (req, res, next) => {
  try {
    await FAQ.destroy({ where: { id: req.params.id } });
    return success(res, {}, 'FAQ deleted');
  } catch (e) { next(e); }
});

// ── OFFERS & COUPONS ───────────────────────────────────────────────────────
router.get('/offers', async (req, res, next) => {
  try {
    const offersRaw = await Offer.findAll({ where: { isActive: true } });
    return success(res, offersRaw.map(o => o.toJSON()));
  } catch (e) { next(e); }
});

router.post('/offers', protect, requireAdmin, async (req, res, next) => {
  try {
    const offer = await Offer.create(req.body);
    return created(res, offer, 'Offer created');
  } catch (e) { next(e); }
});

router.put('/offers/:id', protect, requireAdmin, async (req, res, next) => {
  try {
    const offer = await Offer.findByPk(req.params.id);
    if (!offer) return notFound(res, 'Offer not found');
    await offer.update(req.body);
    return success(res, offer, 'Offer updated');
  } catch (e) { next(e); }
});

router.delete('/offers/:id', protect, requireAdmin, async (req, res, next) => {
  try {
    await Offer.destroy({ where: { id: req.params.id } });
    return success(res, {}, 'Offer deleted');
  } catch (e) { next(e); }
});

router.get('/coupons', async (req, res, next) => {
  try {
    const couponsRaw = await Offer.findAll({
      where: {
        isActive: true,
        code: { [Op.ne]: null }
      }
    });
    return success(res, couponsRaw.map(c => c.toJSON()));
  } catch (e) { next(e); }
});

// ── SEO SITEMAP & ROBOTS.TXT ───────────────────────────────────────────────
router.get('/sitemap.xml', async (req, res, next) => {
  try {
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const productsRaw = await Product.findAll({
      where: { isActive: true },
      attributes: ['id', 'slug', 'updatedAt'],
      limit: 1000
    });
    const products = productsRaw.map(p => p.toJSON());
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    xml += `  <url><loc>${baseUrl}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;
    xml += `  <url><loc>${baseUrl}/search</loc><changefreq>hourly</changefreq><priority>0.9</priority></url>\n`;
    xml += `  <url><loc>${baseUrl}/deals</loc><changefreq>hourly</changefreq><priority>0.8</priority></url>\n`;
    xml += `  <url><loc>${baseUrl}/categories</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>\n`;
    xml += `  <url><loc>${baseUrl}/blog</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>\n`;

    for (const p of products) {
      xml += `  <url><loc>${baseUrl}/products/${p.id || p._id}</loc><lastmod>${(p.updatedAt || new Date()).toISOString()}</lastmod><changefreq>daily</changefreq><priority>0.8</priority></url>\n`;
    }

    xml += `</urlset>`;
    res.header('Content-Type', 'application/xml');
    return res.send(xml);
  } catch (e) { next(e); }
});

router.get('/robots.txt', (req, res) => {
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const robots = `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /dashboard/\nSitemap: ${baseUrl}/api/sitemap.xml\n`;
  res.header('Content-Type', 'text/plain');
  return res.send(robots);
});

module.exports = router;
