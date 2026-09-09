'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Provider = sequelize.define('Provider', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  key: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  logo: {
    type: DataTypes.STRING(1000),
    allowNull: true
  },
  homepage: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  currency: {
    type: DataTypes.STRING(10),
    defaultValue: 'INR'
  },
  enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  configured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM('healthy', 'degraded', 'unavailable', 'unconfigured', 'disabled', 'ready'),
    defaultValue: 'unconfigured'
  },
  successCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  errorCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  avgResponseTimeMs: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  lastCheckedAt: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  lastErrorMessage: {
    type: DataTypes.TEXT,
    defaultValue: null
  }
}, {
  tableName: 'providers',
  timestamps: true,
  hooks: {
    beforeCreate: (prov) => {
      if (prov.key) prov.key = prov.key.trim();
    }
  }
});

Provider.prototype.toJSON = function() {
  const json = Object.assign({}, this.get());
  json._id = json.id;
  return json;
};

Provider.findById = async function(id) {
  if (!id) return null;
  return Provider.findByPk(id);
};

Provider.deleteMany = async function(where = {}) {
  return Provider.destroy({ where });
};

module.exports = Provider;
