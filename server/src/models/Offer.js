'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Offer = sequelize.define('Offer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  code: {
    type: DataTypes.STRING(100),
    defaultValue: ''
  },
  store: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  discount: {
    type: DataTypes.STRING(100),
    defaultValue: ''
  },
  category: {
    type: DataTypes.STRING(100),
    defaultValue: 'tech'
  },
  affiliateUrl: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  validUntil: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'offers',
  timestamps: true
});

Offer.prototype.toJSON = function() {
  const json = Object.assign({}, this.get());
  json._id = json.id;
  return json;
};

Offer.findById = async function(id) {
  if (!id) return null;
  return Offer.findByPk(id);
};

Offer.deleteMany = async function(where = {}) {
  return Offer.destroy({ where });
};

module.exports = Offer;
