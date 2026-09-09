'use strict';

// Load .env from server root
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const fs = require('fs');
const path = require('path');
const { DataTypes } = require('sequelize');
const { connectDB, disconnectDB, sequelize } = require('../config/database');
const logger = require('../utils/logger');
const log = logger.child('Migration');

// Define Migration model to track applied migrations in MySQL
const Migration = sequelize.define('Migration', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  batch: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  appliedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'migrations',
  timestamps: false
});

async function runMigrations() {
  const args = process.argv.slice(2);
  const isFresh = args.includes('--fresh');
  const isStatus = args.includes('--status');

  try {
    console.log('----------------------------------------------------');
    console.log('   PriceHunt Database Migration Runner (MySQL)');
    console.log('----------------------------------------------------');

    await connectDB();

    if (isFresh) {
      console.log('\n[!] --fresh specified: Dropping all tables in MySQL database...');
      await sequelize.drop();
      console.log('[✓] All MySQL tables dropped.\n');
    }

    // Sync all model tables
    console.log('Synchronizing Sequelize models with MySQL...');
    await sequelize.sync();
    await Migration.sync();

    // Get list of migration files in directory
    const migrationsDir = __dirname;
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f !== 'migrate.js' && f.endsWith('.js'))
      .sort();

    const appliedRecords = await Migration.findAll({ order: [['batch', 'ASC'], ['name', 'ASC']] });
    const appliedNames = new Set(appliedRecords.map(r => r.name));

    if (isStatus) {
      console.log('\nMigration Status:');
      console.log('=================');
      files.forEach(f => {
        const applied = appliedNames.has(f);
        console.log(` [${applied ? 'X' : ' '}] ${f}`);
      });
      console.log('');
      await disconnectDB();
      process.exit(0);
    }

    const pending = files.filter(f => !appliedNames.has(f));

    if (pending.length === 0) {
      console.log('\n[✓] Nothing to migrate. All migrations are already up to date!\n');
      await disconnectDB();
      process.exit(0);
    }

    const lastBatch = appliedRecords.length > 0 ? Math.max(...appliedRecords.map(r => r.batch)) : 0;
    const currentBatch = lastBatch + 1;

    console.log(`\nRunning ${pending.length} pending migration(s) (Batch #${currentBatch}):`);

    for (const file of pending) {
      const filePath = path.join(migrationsDir, file);
      const migrationModule = require(filePath);

      console.log(`\n  ▶ Migrating: ${file}...`);
      const startTime = Date.now();

      if (typeof migrationModule.up === 'function') {
        await migrationModule.up(sequelize);
      } else {
        throw new Error(`Migration ${file} does not export an "up" function`);
      }

      const duration = Date.now() - startTime;
      await Migration.create({ name: file, batch: currentBatch });
      console.log(`  ✔ Completed: ${file} (${duration}ms)`);
    }

    console.log('\n----------------------------------------------------');
    console.log(' [✓] All migrations completed successfully!');
    console.log('----------------------------------------------------\n');

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('\n[✕] Migration failed with error:');
    console.error(err.message || err);
    try {
      await disconnectDB();
    } catch (e) {}
    process.exit(1);
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
