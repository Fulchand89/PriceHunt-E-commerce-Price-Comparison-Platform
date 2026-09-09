'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Store = sequelize.define('Store', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  key: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  logo: {
    type: DataTypes.STRING(1000),
    defaultValue: null
  },
  website: {
    type: DataTypes.STRING(500),
    defaultValue: ''
  },
  websiteUrl: {
    type: DataTypes.STRING(500),
    defaultValue: ''
  },
  affiliateUrl: {
    type: DataTypes.STRING(1000),
    defaultValue: ''
  },
  currency: {
    type: DataTypes.STRING(10),
    defaultValue: 'INR'
  },
  scraperEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'active'
  },
  lastSuccessfulRun: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  lastError: {
    type: DataTypes.TEXT,
    defaultValue: null
  },
  productsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'stores',
  timestamps: true,
  hooks: {
    beforeCreate: (store) => {
      if (store.key) store.key = store.key.toLowerCase().trim();
      if (!store.slug) store.slug = store.key;
      if (!store.website && store.websiteUrl) store.website = store.websiteUrl;
      if (!store.websiteUrl && store.website) store.websiteUrl = store.website;
    }
  }
});

Store.prototype.toJSON = function() {
  const json = Object.assign({}, this.get());
  json._id = json.id;
  return json;
};

Store.findById = async function(id) {
  if (!id) return null;
  return Store.findByPk(id);
};

Store.deleteMany = async function(where = {}) {
  return Store.destroy({ where });
};

module.exports = Store;
