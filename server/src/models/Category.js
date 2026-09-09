'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Category = sequelize.define('Category', {
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
  image: {
    type: DataTypes.STRING(1000),
    defaultValue: null
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  productCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'categories',
  timestamps: true,
  hooks: {
    beforeCreate: (cat) => {
      if (cat.name && !cat.slug) {
        cat.slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
    },
    beforeUpdate: (cat) => {
      if (cat.changed('name')) {
        cat.slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
    }
  }
});

Category.prototype.toJSON = function() {
  const json = Object.assign({}, this.get());
  json._id = json.id;
  return json;
};

Category.findById = async function(id) {
  if (!id) return null;
  return Category.findByPk(id);
};

Category.deleteMany = async function(where = {}) {
  return Category.destroy({ where });
};

module.exports = Category;
