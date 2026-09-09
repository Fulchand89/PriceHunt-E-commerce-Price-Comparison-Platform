'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProductListing = sequelize.define('ProductListing', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  storeId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  provider: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  providerProductId: {
    type: DataTypes.STRING(255),
    defaultValue: ''
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  image: {
    type: DataTypes.STRING(1000),
    defaultValue: null
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  mrp: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  originalPrice: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  discount: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  currency: {
    type: DataTypes.STRING(10),
    defaultValue: 'INR'
  },
  shippingCost: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  deliveryInfo: {
    type: DataTypes.STRING(255),
    defaultValue: null
  },
  availability: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: null
  },
  reviewCount: {
    type: DataTypes.INTEGER,
    defaultValue: null
  },
  variant: {
    type: DataTypes.STRING(255),
    defaultValue: ''
  },
  seller: {
    type: DataTypes.STRING(255),
    defaultValue: ''
  },
  productUrl: {
    type: DataTypes.TEXT,
    defaultValue: null
  },
  affiliateUrl: {
    type: DataTypes.TEXT,
    defaultValue: null
  },
  lastScrapedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  lastUpdated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  rawMetadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'product_listings',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['productId', 'provider'] },
    { fields: ['provider', 'providerProductId'] },
    { fields: ['productId', 'price'] }
  ],
  hooks: {
    beforeSave: (listing) => {
      if (listing.provider) listing.provider = listing.provider.toLowerCase().trim();
      if (listing.mrp && !listing.originalPrice) listing.originalPrice = listing.mrp;
      if (listing.originalPrice && !listing.mrp) listing.mrp = listing.originalPrice;
      if (listing.originalPrice && listing.originalPrice > listing.price && !listing.discount) {
        listing.discount = Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100);
      }
      listing.lastUpdated = new Date();
      listing.lastScrapedAt = new Date();
    }
  }
});

ProductListing.prototype.toJSON = function() {
  const json = Object.assign({}, this.get());
  json._id = json.id;
  json.totalCost = (json.price || 0) + (json.shippingCost || 0);
  return json;
};

ProductListing.findById = async function(id) {
  if (!id) return null;
  return ProductListing.findByPk(id);
};

ProductListing.deleteMany = async function(where = {}) {
  return ProductListing.destroy({ where });
};

module.exports = ProductListing;
