'use strict';

const User           = require('../models/User');
const Product        = require('../models/Product');
const ProductListing = require('../models/ProductListing');
const Store          = require('../models/Store');
const Category       = require('../models/Category');
const Brand          = require('../models/Brand');
const PriceAlert     = require('../models/PriceAlert');
const PriceHistory   = require('../models/PriceHistory');
const SearchHistory  = require('../models/SearchHistory');
const Settings       = require('../models/Settings');
const Banner         = require('../models/Banner');
const FAQ            = require('../models/FAQ');
const Offer          = require('../models/Offer');

exports.up = async (sequelize) => {
  console.log('    - Synchronizing model schemas on MySQL...');

  const models = [
    { name: 'User', model: User },
    { name: 'Product', model: Product },
    { name: 'ProductListing', model: ProductListing },
    { name: 'Store', model: Store },
    { name: 'Category', model: Category },
    { name: 'Brand', model: Brand },
    { name: 'PriceAlert', model: PriceAlert },
    { name: 'PriceHistory', model: PriceHistory },
    { name: 'SearchHistory', model: SearchHistory },
    { name: 'Settings', model: Settings },
    { name: 'Banner', model: Banner },
    { name: 'FAQ', model: FAQ },
    { name: 'Offer', model: Offer },
  ];

  for (const { name, model } of models) {
    try {
      await model.sync();
      console.log(`      ✓ Synchronized table: ${name}`);
    } catch (err) {
      console.warn(`      ! Sync warning on ${name}: ${err.message}`);
    }
  }
};

exports.down = async (sequelize) => {
  console.log('    - Reverting initial schema tables...');
};
