'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Seller = sequelize.define('Seller', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  storeKey: {
    type: DataTypes.STRING(100),
    defaultValue: ''
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 4.5
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'sellers',
  timestamps: true
});

Seller.prototype.toJSON = function() {
  const json = Object.assign({}, this.get());
  json._id = json.id;
  return json;
};

Seller.findById = async function(id) {
  if (!id) return null;
  return Seller.findByPk(id);
};

Seller.deleteMany = async function(where = {}) {
  return Seller.destroy({ where });
};

module.exports = Seller;
