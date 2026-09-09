'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('PRICE_DROP', 'TARGET_REACHED', 'BACK_IN_STOCK', 'WISHLIST_UPDATE', 'NEW_DEAL'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  link: {
    type: DataTypes.STRING(500),
    defaultValue: null
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  indexes: [
    { fields: ['userId', 'isRead'] },
    { fields: ['createdAt'] }
  ]
});

Notification.prototype.toJSON = function() {
  const json = Object.assign({}, this.get());
  json._id = json.id;
  return json;
};

Notification.findById = async function(id) {
  if (!id) return null;
  return Notification.findByPk(id);
};

Notification.countDocuments = async function(where = {}) {
  return Notification.count({ where });
};

Notification.deleteMany = async function(where = {}) {
  return Notification.destroy({ where });
};

module.exports = Notification;
