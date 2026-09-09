'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ScraperLog = sequelize.define('ScraperLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  store: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  storeKey: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('success', 'partial', 'timeout', 'blocked', 'rate_limited', 'unavailable', 'error'),
    allowNull: false
  },
  query: {
    type: DataTypes.STRING(300),
    defaultValue: ''
  },
  url: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  productsFound: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  durationMs: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  errorMessage: {
    type: DataTypes.TEXT,
    defaultValue: null
  },
  scrapedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'scraper_logs',
  timestamps: true,
  indexes: [
    { fields: ['storeKey', 'scrapedAt'] },
    { fields: ['status', 'scrapedAt'] }
  ],
  hooks: {
    beforeCreate: (log) => {
      if (log.storeKey) log.storeKey = log.storeKey.toLowerCase().trim();
    }
  }
});

ScraperLog.prototype.toJSON = function() {
  const json = Object.assign({}, this.get());
  json._id = json.id;
  return json;
};

ScraperLog.findById = async function(id) {
  if (!id) return null;
  return ScraperLog.findByPk(id);
};

ScraperLog.countDocuments = async function(where = {}) {
  return ScraperLog.count({ where });
};

ScraperLog.deleteMany = async function(where = {}) {
  return ScraperLog.destroy({ where });
};

module.exports = ScraperLog;
