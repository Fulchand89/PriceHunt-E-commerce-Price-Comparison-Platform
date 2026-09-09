'use strict';

const User     = require('../models/User');
const Banner   = require('../models/Banner');
const FAQ      = require('../models/FAQ');
const Offer    = require('../models/Offer');
const Settings = require('../models/Settings');

exports.up = async (sequelize) => {
  // 1. Admin Account
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
    console.log(`    ✓ Admin account created on MySQL: ${adminEmail}`);
  } else {
    if (admin.role !== 'admin' && admin.role !== 'superadmin') {
      await admin.update({ role: 'admin' });
    }
    console.log(`    ✓ Admin account verified on MySQL: ${adminEmail}`);
  }

  // 2. Initial Banners
  const initialBanners = [
    {
      title: 'Festival Mega Price Drops',
      subtitle: 'Compare prices on iPhone 16, MacBooks & 4K Smart TVs',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80',
      link: '/search?sortBy=highestDiscount',
      position: 1,
      isActive: true
    },
    {
      title: 'Top Audio & Noise Canceling Deals',
      subtitle: 'Sony, Bose & Apple AirPods at Lowest Recorded Prices',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80',
      link: '/search?category=electronics',
      position: 2,
      isActive: true
    }
  ];

  for (const banner of initialBanners) {
    const [b] = await Banner.findOrCreate({ where: { title: banner.title }, defaults: banner });
    if (b) await b.update(banner);
  }
  console.log('    ✓ CMS Banners migrated to MySQL');

  // 3. Initial FAQs
  const initialFAQs = [
    {
      question: 'How does PriceHunt find the cheapest price?',
      answer: 'PriceHunt connects directly to official e-commerce store feeds and product pages, retrieving live prices, shipping fees, and discounts every few minutes to show the genuine total price.',
      category: 'General',
      order: 1
    },
    {
      question: 'Are delivery charges included in the comparison?',
      answer: 'Yes! Unlike other comparison engines, PriceHunt factors in delivery charges and merchant fees to show the final checkout cost.',
      category: 'Pricing',
      order: 2
    },
    {
      question: 'How do Price Drop Alerts work?',
      answer: 'Simply set your target budget on any product page. When any store drops its price below your target, you receive an instant email and push notification.',
      category: 'Alerts',
      order: 3
    }
  ];

  for (const faq of initialFAQs) {
    const [f] = await FAQ.findOrCreate({ where: { question: faq.question }, defaults: faq });
    if (f) await f.update(faq);
  }
  console.log('    ✓ CMS FAQs migrated to MySQL');

  // 4. Initial Offers
  const initialOffers = [
    {
      title: 'Instant 10% Bank Discount on Electronics',
      code: 'HDFC10',
      discount: '10%',
      store: 'Amazon',
      description: 'Get 10% instant discount up to Rs. 1,500 on all electronics using select credit cards.',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true
    },
    {
      title: 'Flat Rs. 500 Off on Mobiles & Tablets',
      code: 'SMART500',
      discount: 'Rs. 500',
      store: 'Flipkart',
      description: 'Applicable on prepaid smartphone purchases over Rs. 15,000.',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true
    }
  ];

  for (const offer of initialOffers) {
    const [o] = await Offer.findOrCreate({ where: { code: offer.code }, defaults: offer });
    if (o) await o.update(offer);
  }
  console.log('    ✓ CMS Offers migrated to MySQL');

  // 5. Initial System Settings
  const existingSettings = await Settings.findOne();
  if (!existingSettings) {
    await Settings.create({
      siteName: 'PriceHunt',
      contactEmail: 'support@pricehunt.app',
      autoMatchThreshold: 85,
      searchCacheTTL: 600,
      comparisonCacheTTL: 300,
      enableMockProviders: true,
      currency: 'INR',
      maintenanceMode: false
    });
  }
  console.log('    ✓ System Settings migrated to MySQL');
};

exports.down = async (sequelize) => {
  console.log('    - Reverting admin and CMS...');
};
