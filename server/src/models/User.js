'use strict';

const { DataTypes, Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(80),
    allowNull: false,
    validate: { len: [2, 80] }
  },
  email: {
    type: DataTypes.STRING(120),
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('user', 'admin', 'superadmin'),
    defaultValue: 'user'
  },
  avatar: {
    type: DataTypes.STRING(500),
    defaultValue: null
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  watchlist: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  lastLogin: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  resetPasswordToken: {
    type: DataTypes.STRING(255),
    defaultValue: null
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    defaultValue: null
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 12);
      }
      if (user.email) {
        user.email = user.email.toLowerCase().trim();
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
      if (user.changed('email') && user.email) {
        user.email = user.email.toLowerCase().trim();
      }
    }
  }
});

// Instance methods
User.prototype.comparePassword = function(plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

User.prototype.toPublicJSON = function() {
  const json = this.toJSON();
  delete json.password;
  delete json.resetPasswordToken;
  delete json.resetPasswordExpires;
  json._id = json.id; // Compatibility mapping for _id
  return json;
};

// Static Mongoose-compatible helper methods for backward compatibility
User.findById = async function(id) {
  if (!id) return null;
  const user = await User.findByPk(id);
  if (!user) return null;
  user.select = function() { return user; }; // chain syntax support
  return user;
};

User.countDocuments = async function(where = {}) {
  return User.count({ where });
};

module.exports = User;
