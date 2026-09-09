'use strict';

const User           = require('../models/User');
const Category       = require('../models/Category');
const Brand          = require('../models/Brand');
const Store          = require('../models/Store');
const Product        = require('../models/Product');
const ProductListing = require('../models/ProductListing');
const logger         = require('./logger');
const log = logger.child ? logger.child('Seeder') : logger;

const seedCategories = [
  {
    name: 'Mobiles & Tablets',
    slug: 'mobiles',
    description: 'Smartphones, iPhones, iPads and accessories',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
    productCount: 0
  },
  {
    name: 'Laptops & Computers',
    slug: 'laptops',
    description: 'MacBooks, Gaming Laptops, Ultrabooks & Monitors',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    productCount: 0
  },
  {
    name: 'Electronics & Audio',
    slug: 'electronics',
    description: 'Headphones, Wireless Earbuds, Soundbars & Speakers',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    productCount: 0
  },
  {
    name: 'Fashion & Footwear',
    slug: 'fashion',
    description: 'Sneakers, Watches, Casual & Formal Apparel',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    productCount: 0
  },
  {
    name: 'TVs & Home Appliances',
    slug: 'appliances',
    description: '4K OLED TVs, Refrigerators, Washing Machines',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&auto=format&fit=crop&q=80',
    productCount: 0
  }
];

const seedBrands = [
  { name: 'Apple', slug: 'apple', description: 'Premium tech & smart devices' },
  { name: 'Samsung', slug: 'samsung', description: 'Innovations in displays & smartphones' },
  { name: 'Sony', slug: 'sony', description: 'Industry leading audio & entertainment' },
  { name: 'Dell', slug: 'dell', description: 'High performance PCs & laptops' },
  { name: 'Nike', slug: 'nike', description: 'Global sports footwear & apparel' },
  { name: 'LG', slug: 'lg', description: 'Home appliances & OLED displays' }
];

const seedStores = [
  { key: 'amazon', name: 'Amazon', websiteUrl: 'https://amazon.in', affiliateUrl: 'https://amazon.in/?tag=pricehunt-21', status: 'active' },
  { key: 'flipkart', name: 'Flipkart', websiteUrl: 'https://www.flipkart.com', affiliateUrl: 'https://www.flipkart.com/?affid=pricehunt', status: 'active' }
];

async function seedInitialData() {
  try {
    // 1. Ensure Default Admin User exists
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@pricehunt.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
    let admin = await User.findOne({ where: { email: adminEmail } });
    if (!admin) {
      admin = await User.create({
        name: 'System Administrator',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isActive: true
      });
      log.info(`Default Admin account created: ${adminEmail} (password: ${adminPassword})`);
    } else if (admin.role !== 'admin' && admin.role !== 'superadmin') {
      await admin.update({ role: 'admin' });
      log.info(`Existing user ${adminEmail} promoted to admin`);
    }

    // 2. Seed Categories
    for (const cat of seedCategories) {
      const [c] = await Category.findOrCreate({ where: { slug: cat.slug }, defaults: cat });
      if (c) await c.update(cat);
    }

    // 3. Seed Brands
    for (const b of seedBrands) {
      const [brand] = await Brand.findOrCreate({ where: { name: b.name }, defaults: b });
      if (brand) await brand.update(b);
    }

    // 4. Seed Amazon Store (Only Amazon)
    for (const s of seedStores) {
      const [store] = await Store.findOrCreate({ where: { key: s.key }, defaults: s });
      if (store) await store.update(s);
    }

    // 5. Purge any previous mock/static products containing fake ASINs or dummy titles
    try {
      const { Op } = require('sequelize');
      const mockListings = await ProductListing.findAll({
        where: {
          [Op.or]: [
            { productUrl: { [Op.like]: '%B0D123456%' } },
            { productUrl: { [Op.like]: '%B0S24ULTRA%' } },
            { productUrl: { [Op.like]: '%B0M3AIR15%' } },
            { productUrl: { [Op.like]: '%B0SONYXM5%' } },
            { provider: { [Op.ne]: 'amazon' } }
          ]
        }
      });

      if (mockListings.length > 0) {
        const productIdsToClean = [...new Set(mockListings.map(l => l.productId))];
        await ProductListing.destroy({
          where: {
            id: mockListings.map(l => l.id)
          }
        });
        log.info(`Purged ${mockListings.length} mock/non-Amazon product listings.`);

        for (const pid of productIdsToClean) {
          const remaining = await ProductListing.count({ where: { productId: pid } });
          if (remaining === 0) {
            await Product.destroy({ where: { id: pid } });
          }
        }
      }
    } catch (cleanErr) {
      log.warn('Mock product cleanup notice: ' + cleanErr.message);
    }

    log.info('System meta seeding verified. ZERO mock products seeded.');
  } catch (err) {
    log.error('Seeding failed: ' + err.message);
  }
}

module.exports = { seedInitialData };
