'use strict';

const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { normalizeTitle } = require('../utils/helpers');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  canonicalTitle: {
    type: DataTypes.STRING(500),
    defaultValue: ''
  },
  slug: {
    type: DataTypes.STRING(255),
    unique: true
  },
  normalizedTitle: {
    type: DataTypes.STRING(500),
    defaultValue: ''
  },
  brand: {
    type: DataTypes.STRING(150),
    defaultValue: ''
  },
  model: {
    type: DataTypes.STRING(150),
    defaultValue: ''
  },
  category: {
    type: DataTypes.STRING(150),
    defaultValue: ''
  },
  storage: {
    type: DataTypes.STRING(100),
    defaultValue: ''
  },
  ram: {
    type: DataTypes.STRING(100),
    defaultValue: ''
  },
  color: {
    type: DataTypes.STRING(100),
    defaultValue: ''
  },
  modelNumber: {
    type: DataTypes.STRING(100),
    defaultValue: ''
  },
  sku: {
    type: DataTypes.STRING(100),
    defaultValue: ''
  },
  gtin: {
    type: DataTypes.STRING(100),
    defaultValue: ''
  },
  ean: {
    type: DataTypes.STRING(100),
    defaultValue: ''
  },
  upc: {
    type: DataTypes.STRING(100),
    defaultValue: ''
  },
  mpn: {
    type: DataTypes.STRING(100),
    defaultValue: ''
  },
  asin: {
    type: DataTypes.STRING(50),
    defaultValue: ''
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  image: {
    type: DataTypes.STRING(1000),
    defaultValue: null
  },
  images: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  specifications: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  variants: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 4.5
  },
  reviewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  price: {
    type: DataTypes.FLOAT,
    defaultValue: null
  },
  originalPrice: {
    type: DataTypes.FLOAT,
    defaultValue: null
  },
  discount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  availability: {
    type: DataTypes.STRING(50),
    defaultValue: 'In Stock'
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  lowestPrice: {
    type: DataTypes.FLOAT,
    defaultValue: null
  },
  highestPrice: {
    type: DataTypes.FLOAT,
    defaultValue: null
  },
  currency: {
    type: DataTypes.STRING(10),
    defaultValue: 'INR'
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastScrapedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'products',
  timestamps: true,
  hooks: {
    beforeCreate: (product) => {
      if (product.title) {
        product.normalizedTitle = normalizeTitle(product.title);
        if (!product.slug) {
          const baseSlug = product.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
          product.slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;
        }
      }
      if (product.price != null && product.lowestPrice == null) {
        product.lowestPrice = product.price;
      }
      if (product.originalPrice != null && product.highestPrice == null) {
        product.highestPrice = product.originalPrice;
      }
    },
    beforeUpdate: (product) => {
      if (product.changed('title')) {
        product.normalizedTitle = normalizeTitle(product.title);
      }
      if (product.changed('price')) {
        product.lowestPrice = product.price;
      }
      if (product.changed('originalPrice')) {
        product.highestPrice = product.originalPrice;
      }
    }
  }
});

// Helper for _id getter in JSON
Product.prototype.toJSON = function() {
  const json = Object.assign({}, this.get());
  json._id = json.id;
  json.price = json.price != null ? json.price : (json.lowestPrice || 0);
  json.originalPrice = json.originalPrice != null ? json.originalPrice : (json.highestPrice || null);
  if (json.originalPrice && json.originalPrice > json.price && (!json.discount || json.discount === 0)) {
    json.discount = Math.round(((json.originalPrice - json.price) / json.originalPrice) * 100);
  }
  json.availability = json.availability || (json.isActive ? 'In Stock' : 'Out of Stock');
  return json;
};

// Static helper methods
Product.findById = async function(id) {
  if (!id) return null;
  return Product.findByPk(id);
};

Product.countDocuments = async function(where = {}) {
  return Product.count({ where });
};

Product.deleteMany = async function(where = {}) {
  return Product.destroy({ where });
};

module.exports = Product;
