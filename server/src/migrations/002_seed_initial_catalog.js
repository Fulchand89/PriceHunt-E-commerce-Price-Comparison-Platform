'use strict';

const Category = require('../models/Category');
const Brand    = require('../models/Brand');
const Store    = require('../models/Store');

const categories = [
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

const brands = [
  { name: 'Apple', slug: 'apple', description: 'Premium tech & smart devices' },
  { name: 'Samsung', slug: 'samsung', description: 'Innovations in displays & smartphones' },
  { name: 'Sony', slug: 'sony', description: 'Industry leading audio & entertainment' },
  { name: 'Dell', slug: 'dell', description: 'High performance PCs & laptops' },
  { name: 'Nike', slug: 'nike', description: 'Global sports footwear & apparel' },
  { name: 'LG', slug: 'lg', description: 'Home appliances & OLED displays' }
];

const stores = [
  { key: 'amazon', name: 'Amazon', websiteUrl: 'https://amazon.in', affiliateUrl: 'https://amazon.in/?tag=pricehunt-21', status: 'active' }
];

exports.up = async (sequelize) => {
  console.log('    - Migrating categories to MySQL...');
  for (const cat of categories) {
    const [c] = await Category.findOrCreate({ where: { slug: cat.slug }, defaults: cat });
    if (c) await c.update(cat);
  }

  console.log('    - Migrating brands to MySQL...');
  for (const b of brands) {
    const [brand] = await Brand.findOrCreate({ where: { name: b.name }, defaults: b });
    if (brand) await brand.update(b);
  }

  console.log('    - Migrating stores to MySQL (Amazon only)...');
  for (const s of stores) {
    const [store] = await Store.findOrCreate({ where: { key: s.key }, defaults: s });
    if (store) await store.update(s);
  }

  console.log('    ✓ Catalog migration completed successfully (ZERO mock products).');
};

exports.down = async (sequelize) => {
  console.log('    - Reverting catalog...');
};
