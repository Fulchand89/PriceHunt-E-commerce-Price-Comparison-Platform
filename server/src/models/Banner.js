'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Banner = sequelize.define('Banner', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  subtitle: {
    type: DataTypes.STRING(255),
    defaultValue: ''
  },
  image: {
    type: DataTypes.STRING(1000),
    allowNull: false
  },
  link: {
    type: DataTypes.STRING(500),
    defaultValue: '/'
  },
  position: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'banners',
  timestamps: true
});

Banner.prototype.toJSON = function() {
  const json = Object.assign({}, this.get());
  json._id = json.id;
  return json;
};

Banner.findById = async function(id) {
  if (!id) return null;
  return Banner.findByPk(id);
};

Banner.deleteMany = async function(where = {}) {
  return Banner.destroy({ where });
};

module.exports = Banner;
