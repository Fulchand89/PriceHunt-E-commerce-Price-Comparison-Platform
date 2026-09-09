'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Settings = sequelize.define('Settings', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  siteName: {
    type: DataTypes.STRING(150),
    defaultValue: 'PriceHunt'
  },
  contactEmail: {
    type: DataTypes.STRING(150),
    defaultValue: 'support@pricehunt.app'
  },
  autoMatchThreshold: {
    type: DataTypes.INTEGER,
    defaultValue: 85
  },
  searchCacheTTL: {
    type: DataTypes.INTEGER,
    defaultValue: 600
  },
  comparisonCacheTTL: {
    type: DataTypes.INTEGER,
    defaultValue: 300
  },
  enableMockProviders: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  currency: {
    type: DataTypes.STRING(10),
    defaultValue: 'INR'
  },
  maintenanceMode: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'settings',
  timestamps: true
});

Settings.prototype.toJSON = function() {
  const json = Object.assign({}, this.get());
  json._id = json.id;
  return json;
};

Settings.findById = async function(id) {
  if (!id) return null;
  return Settings.findByPk(id);
};

Settings.deleteMany = async function(where = {}) {
  return Settings.destroy({ where });
};

module.exports = Settings;
