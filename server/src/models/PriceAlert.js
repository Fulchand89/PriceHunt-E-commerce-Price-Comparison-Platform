'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PriceAlert = sequelize.define('PriceAlert', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  targetPrice: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  currentPrice: {
    type: DataTypes.FLOAT,
    defaultValue: null
  },
  provider: {
    type: DataTypes.STRING(100),
    defaultValue: null
  },
  currency: {
    type: DataTypes.STRING(10),
    defaultValue: 'INR'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  notificationSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  notificationSentAt: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  retriggerAfterDays: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'price_alerts',
  timestamps: true,
  indexes: [
    { fields: ['userId', 'productId'] },
    { fields: ['isActive', 'notificationSent'] }
  ]
});

PriceAlert.prototype.toJSON = function() {
  const json = Object.assign({}, this.get());
  json._id = json.id;
  return json;
};

PriceAlert.findById = async function(id) {
  if (!id) return null;
  return PriceAlert.findByPk(id);
};

PriceAlert.countDocuments = async function(where = {}) {
  return PriceAlert.count({ where });
};

PriceAlert.deleteMany = async function(where = {}) {
  return PriceAlert.destroy({ where });
};

module.exports = PriceAlert;
