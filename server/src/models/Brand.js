'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Brand = sequelize.define('Brand', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true
  },
  slug: {
    type: DataTypes.STRING(150),
    unique: true
  },
  logo: {
    type: DataTypes.STRING(1000),
    defaultValue: null
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  website: {
    type: DataTypes.STRING(500),
    defaultValue: ''
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'brands',
  timestamps: true,
  hooks: {
    beforeCreate: (brand) => {
      if (brand.name && !brand.slug) {
        brand.slug = brand.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
    },
    beforeUpdate: (brand) => {
      if (brand.changed('name')) {
        brand.slug = brand.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
    }
  }
});

Brand.prototype.toJSON = function() {
  const json = Object.assign({}, this.get());
  json._id = json.id;
  return json;
};

Brand.findById = async function(id) {
  if (!id) return null;
  return Brand.findByPk(id);
};

Brand.deleteMany = async function(where = {}) {
  return Brand.destroy({ where });
};

module.exports = Brand;
