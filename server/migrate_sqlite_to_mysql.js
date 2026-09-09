'use strict';

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const sqlitePath = path.join(__dirname, 'pricehunt.sqlite');

async function migrate() {
  console.log('Starting migration from pricehunt.sqlite to MySQL 3308...');

  const db = new sqlite3.Database(sqlitePath);
  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: parseInt(process.env.MYSQL_PORT || '3308', 10),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'pricehunt',
    charset: 'utf8mb4'
  });

  // Query helper for sqlite
  const querySqlite = (sql) => new Promise((resolve, reject) => {
    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  // Tables in dependency order
  const tables = [
    'users',
    'categories',
    'brands',
    'stores',
    'providers',
    'sellers',
    'products',
    'product_listings',
    'product_match_queues',
    'price_histories',
    'price_alerts',
    'offers',
    'faqs',
    'banners',
    'blog_posts',
    'notifications',
    'scraper_logs',
    'search_histories',
    'settings'
  ];

  await conn.query('ALTER DATABASE `pricehunt` CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;');
  await conn.query('SET NAMES utf8mb4;');
  await conn.query('SET FOREIGN_KEY_CHECKS = 0;');

  for (const table of tables) {
    await conn.query(`ALTER TABLE \`${table}\` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`).catch(e => console.warn(`Could not convert ${table}:`, e.message));
  }

  for (const table of tables) {
    const sqliteRows = await querySqlite(`SELECT * FROM ${table}`);
    console.log(`Table [${table}]: found ${sqliteRows.length} rows in SQLite`);

    if (sqliteRows.length === 0) continue;

    // Get MySQL table columns and column types
    const [mysqlCols] = await conn.query(`DESCRIBE \`${table}\``);
    const colMap = {};
    for (const c of mysqlCols) {
      colMap[c.Field] = c.Type.toLowerCase();
    }
    const validColNames = Object.keys(colMap);

    // Clear existing dummy/partial rows in MySQL table before importing full SQLite dataset
    await conn.query(`TRUNCATE TABLE \`${table}\``);

    for (const row of sqliteRows) {
      const keys = [];
      const values = [];

      for (const [key, val] of Object.entries(row)) {
        if (!validColNames.includes(key)) continue;

        keys.push(`\`${key}\``);

        const colType = colMap[key] || '';

        if (val === null || val === undefined) {
          values.push(null);
        } else if (colType.includes('datetime') || colType.includes('timestamp')) {
          const d = new Date(val);
          values.push(isNaN(d.getTime()) ? null : d);
        } else if (colType.includes('json')) {
          if (typeof val === 'string') {
            try {
              // Ensure valid json
              JSON.parse(val);
              values.push(val);
            } catch {
              values.push(JSON.stringify(val));
            }
          } else {
            values.push(JSON.stringify(val));
          }
        } else if (colType.includes('tinyint(1)') || colType.includes('boolean')) {
          values.push(val ? 1 : 0);
        } else {
          values.push(val);
        }
      }

      if (keys.length > 0) {
        const placeholders = keys.map(() => '?').join(', ');
        const sql = `INSERT INTO \`${table}\` (${keys.join(', ')}) VALUES (${placeholders})`;
        await conn.query(sql, values);
      }
    }
    console.log(`  -> Successfully migrated ${sqliteRows.length} rows into MySQL [${table}]`);
  }

  await conn.query('SET FOREIGN_KEY_CHECKS = 1;');

  console.log('\n--- VERIFICATION OF MYSQL TABLES ---');
  for (const table of tables) {
    const [[{ count }]] = await conn.query(`SELECT count(*) as count FROM \`${table}\``);
    console.log(`MySQL [${table}]: ${count} rows`);
  }

  await conn.end();
  db.close();
  console.log('\nMigration complete!');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
