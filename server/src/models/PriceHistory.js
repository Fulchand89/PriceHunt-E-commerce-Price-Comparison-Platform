'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PriceHistory = sequelize.define('PriceHistory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  productListingId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  storeId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  store: {
    type: DataTypes.STRING(150),
    defaultValue: ''
  },
  provider: {
    type: DataTypes.STRING(100),
    defaultValue: ''
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
  shippingCost: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  discount: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  availability: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'price_histories',
  timestamps: true,
  indexes: [
    { fields: ['productId', 'date'] },
    { fields: ['productId', 'provider'] }
  ],
  hooks: {
    beforeSave: (history) => {
      if (!history.store && history.provider) history.store = history.provider;
      if (!history.provider && history.store) history.provider = history.store.toLowerCase();
      if (history.mrp && !history.originalPrice) history.originalPrice = history.mrp;
      if (history.originalPrice && !history.mrp) history.mrp = history.originalPrice;
      if (history.timestamp && !history.date) history.date = history.timestamp;
      if (history.date && !history.timestamp) history.timestamp = history.date;
    }
  }
});

PriceHistory.prototype.toJSON = function() {
  const json = Object.assign({}, this.get());
  json._id = json.id;
  return json;
};

PriceHistory.findById = async function(id) {
  if (!id) return null;
  return PriceHistory.findByPk(id);
};

PriceHistory.deleteMany = async function(where = {}) {
  return PriceHistory.destroy({ where });
};

module.exports = PriceHistory;
