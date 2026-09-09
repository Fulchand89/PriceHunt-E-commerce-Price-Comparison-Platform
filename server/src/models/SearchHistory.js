'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SearchHistory = sequelize.define('SearchHistory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  query: {
    type: DataTypes.STRING(300),
    allowNull: false
  },
  normalizedQuery: {
    type: DataTypes.STRING(300),
    allowNull: true
  },
  resultCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  successfulProviders: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  failedProviders: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  fromCache: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  ipAddress: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  searchedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'search_histories',
  timestamps: true,
  indexes: [
    { fields: ['userId', 'searchedAt'] },
    { fields: ['normalizedQuery', 'searchedAt'] }
  ]
});

SearchHistory.prototype.toJSON = function() {
  const json = Object.assign({}, this.get());
  json._id = json.id;
  return json;
};

SearchHistory.findById = async function(id) {
  if (!id) return null;
  return SearchHistory.findByPk(id);
};

SearchHistory.countDocuments = async function(where = {}) {
  return SearchHistory.count({ where });
};

SearchHistory.deleteMany = async function(where = {}) {
  return SearchHistory.destroy({ where });
};

module.exports = SearchHistory;
