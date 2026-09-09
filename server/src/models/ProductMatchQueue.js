'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProductMatchQueue = sequelize.define('ProductMatchQueue', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  productA: {
    type: DataTypes.JSON,
    allowNull: false
  },
  productB: {
    type: DataTypes.JSON,
    allowNull: false
  },
  confidenceScore: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  breakdown: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  reviewedBy: {
    type: DataTypes.UUID,
    allowNull: true
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'product_match_queues',
  timestamps: true,
  indexes: [
    { fields: ['status'] },
    { fields: ['confidenceScore'] }
  ]
});

ProductMatchQueue.prototype.toJSON = function() {
  const json = Object.assign({}, this.get());
  json._id = json.id;
  return json;
};

ProductMatchQueue.findById = async function(id) {
  if (!id) return null;
  return ProductMatchQueue.findByPk(id);
};

ProductMatchQueue.countDocuments = async function(where = {}) {
  return ProductMatchQueue.count({ where });
};

ProductMatchQueue.deleteMany = async function(where = {}) {
  return ProductMatchQueue.destroy({ where });
};

module.exports = ProductMatchQueue;
