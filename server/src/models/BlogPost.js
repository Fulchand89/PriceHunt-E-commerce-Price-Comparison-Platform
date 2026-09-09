'use strict';

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BlogPost = sequelize.define('BlogPost', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(300),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(300),
    unique: true
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: false
  },
  excerpt: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  image: {
    type: DataTypes.STRING(1000),
    defaultValue: null
  },
  author: {
    type: DataTypes.STRING(150),
    defaultValue: 'PriceHunt Team'
  },
  category: {
    type: DataTypes.STRING(150),
    defaultValue: 'Buying Guides'
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  publishedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'blog_posts',
  timestamps: true,
  hooks: {
    beforeCreate: (post) => {
      if (post.title && !post.slug) {
        const baseSlug = post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        post.slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;
      }
    }
  }
});

BlogPost.prototype.toJSON = function() {
  const json = Object.assign({}, this.get());
  json._id = json.id;
  return json;
};

BlogPost.findById = async function(id) {
  if (!id) return null;
  return BlogPost.findByPk(id);
};

BlogPost.deleteMany = async function(where = {}) {
  return BlogPost.destroy({ where });
};

module.exports = BlogPost;
