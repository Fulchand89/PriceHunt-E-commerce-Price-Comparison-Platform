'use strict';

const path = require('path');
const cp = require('child_process');
const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');
const logger = require('../utils/logger');
const log = logger.child('Database');

let isConnected = false;
let activeDialect = 'mysql';
let sequelizeInstance = null;

function isMysqlAvailable(host = '127.0.0.1', port = 3308) {
  try {
    const cmd = `const net=require('net');const s=net.connect(${port},'${host}',()=>process.exit(0));s.on('error',()=>process.exit(1));setTimeout(()=>process.exit(1),400);`;
    cp.execSync(`node -e "${cmd}"`, { stdio: 'ignore', timeout: 500 });
    return true;
  } catch {
    return false;
  }
}

const createMysqlInstance = () => {
  const host = process.env.MYSQL_HOST || '127.0.0.1';
  const port = parseInt(process.env.MYSQL_PORT || '3308', 10);
  const user = process.env.MYSQL_USER || 'root';
  const password = process.env.MYSQL_PASSWORD || '';
  const database = process.env.MYSQL_DATABASE || 'pricehunt';

  return new Sequelize(database, user, password, {
    host,
    port,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      charset: 'utf8mb4'
    },
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      timestamps: true,
      underscored: false
    },
  });
};

const createSqliteInstance = () => {
  const storagePath = path.join(__dirname, '..', '..', 'pricehunt.sqlite');
  const instance = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false,
    retry: {
      match: [/SQLITE_BUSY/],
      max: 5
    },
    pool: {
      max: 5,
      min: 0,
      idle: 10000,
      acquire: 20000
    },
    define: {
      timestamps: true,
      underscored: false
    }
  });

  instance.query('PRAGMA journal_mode = WAL;').catch(() => {});
  instance.query('PRAGMA busy_timeout = 5000;').catch(() => {});

  return instance;
};

const getSequelize = () => {
  if (!sequelizeInstance) {
    const host = process.env.MYSQL_HOST || '127.0.0.1';
    const port = parseInt(process.env.MYSQL_PORT || '3308', 10);
    const dbType = (process.env.DB_TYPE || '').toLowerCase();

    if (dbType === 'sqlite' || !isMysqlAvailable(host, port)) {
      activeDialect = 'sqlite';
      sequelizeInstance = createSqliteInstance();
      log.info(`Using embedded SQLite database (${activeDialect})`);
    } else {
      activeDialect = 'mysql';
      sequelizeInstance = createMysqlInstance();
    }
  }
  return sequelizeInstance;
};

// Initialize sequelizeInstance eagerly on module load
sequelizeInstance = getSequelize();

const connectDB = async () => {
  if (isConnected) return sequelizeInstance;

  if (activeDialect === 'sqlite') {
    await sequelizeInstance.sync();
    isConnected = true;
    log.info('SQLite database connected and synced successfully');
    return sequelizeInstance;
  }

  const host = process.env.MYSQL_HOST || '127.0.0.1';
  const port = parseInt(process.env.MYSQL_PORT || '3308', 10);
  const user = process.env.MYSQL_USER || 'root';
  const password = process.env.MYSQL_PASSWORD || '';
  const database = process.env.MYSQL_DATABASE || 'pricehunt';

  try {
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      connectTimeout: 2000
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.end();

    await sequelizeInstance.authenticate();
    await sequelizeInstance.sync({ alter: true });
    isConnected = true;
    log.info(`MySQL connected successfully to ${host}:${port}/${database}`);
    return sequelizeInstance;
  } catch (err) {
    log.warn(`MySQL connection failed on ${host}:${port}: ${err.message}. Switching to SQLite fallback...`);
    activeDialect = 'sqlite';
    sequelizeInstance = createSqliteInstance();
    await sequelizeInstance.sync();
    isConnected = true;
    log.info('SQLite fallback database connected and synced successfully');
    return sequelizeInstance;
  }
};

const disconnectDB = async () => {
  if (sequelizeInstance) {
    await sequelizeInstance.close();
    sequelizeInstance = null;
    isConnected = false;
    log.info('Database connection closed');
  }
};

const getConnectionStatus = () => {
  const host = process.env.MYSQL_HOST || '127.0.0.1';
  const port = parseInt(process.env.MYSQL_PORT || '3308', 10);
  const name = process.env.MYSQL_DATABASE || 'pricehunt';

  return {
    status: isConnected ? 'connected' : 'disconnected',
    isConnected,
    host,
    port,
    name,
    dialect: activeDialect,
    mode: activeDialect === 'sqlite' ? 'embedded' : 'external'
  };
};

module.exports = {
  sequelize: sequelizeInstance,
  getSequelize: () => sequelizeInstance,
  connectDB,
  disconnectDB,
  getConnectionStatus
};
