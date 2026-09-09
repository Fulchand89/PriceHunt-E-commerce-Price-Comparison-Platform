'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FAQ = sequelize.define('FAQ', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  question: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  answer: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(150),
    defaultValue: 'General'
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'faqs',
  timestamps: true
});

FAQ.prototype.toJSON = function() {
  const json = Object.assign({}, this.get());
  json._id = json.id;
  return json;
};

FAQ.findById = async function(id) {
  if (!id) return null;
  return FAQ.findByPk(id);
};

FAQ.deleteMany = async function(where = {}) {
  return FAQ.destroy({ where });
};

module.exports = FAQ;
