'use strict';

require('dotenv').config();
const { connectDB } = require('./src/config/database');
const { matchProducts, groupListings } = require('./src/services/productMatcher.service');
const { providerManager } = require('./src/providers');
const BaseProvider = require('./src/providers/BaseProvider');
const scraperOrchestrator = require('./src/services/scraperOrchestrator.service');

async function runTestSuite() {
  console.log('====================================================');
  console.log('  PriceHunt Comprehensive Automated Test Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passed++;
    } else {
      console.error(`[FAIL] ${name}`);
      failed++;
    }
  }

  // ── TEST SUITE 1: Scraper Parsing & Normalization ──
  console.log('\n--- Test Suite 1: Scraper Parsing & Normalization ---');
  const base = new BaseProvider('testStore', 'Test Store', 'https://teststore.com');
  const normalized = base.normalizeProduct({
    title: 'Apple iPhone 15 128GB Black',
    price: '57900',
    originalPrice: '69900',
    image: 'https://example.com/img.jpg',
    url: 'https://teststore.com/item1',
    availability: 'In Stock'
  });
  assert(normalized.store === 'Test Store', 'Normalization sets store name');
  assert(normalized.price === 57900, 'Price parsed as integer');
  assert(normalized.mrp === 69900, 'MRP parsed as integer');
  assert(normalized.discount === 17, 'Discount computed accurately');
  assert(normalized.currency === 'INR', 'Currency defaults to INR');
  assert(Boolean(normalized.scrapedAt), 'Timestamp scrapedAt is attached');

  // ── TEST SUITE 2: Product Matching & Incompatible Variants ──
  console.log('\n--- Test Suite 2: Product Matching & Variant Conflicts ---');
  const m1 = matchProducts(
    { title: 'Apple iPhone 15 128GB Black', brand: 'Apple' },
    { title: 'Apple iPhone 15 - 128 GB - Black', brand: 'Apple' }
  );
  assert(m1.matched === true, 'Same product matched across store titles');

  const mStorage = matchProducts(
    { title: 'Apple iPhone 15 128GB Black' },
    { title: 'Apple iPhone 15 256GB Black' }
  );
  assert(mStorage.matched === false && mStorage.conflict === 'storage', 'Storage conflict prevents merging 128GB with 256GB');

  const mRam = matchProducts(
    { title: 'Samsung Galaxy S24 8GB RAM 256GB' },
    { title: 'Samsung Galaxy S24 12GB RAM 256GB' }
  );
  assert(mRam.matched === false && mRam.conflict === 'ram', 'RAM conflict prevents merging 8GB with 12GB');

  const mColor = matchProducts(
    { title: 'iPhone 15 128GB Black' },
    { title: 'iPhone 15 128GB Blue' }
  );
  assert(mColor.matched === false && mColor.conflict === 'color', 'Color conflict prevents merging Black with Blue');

  // ── TEST SUITE 3: Failure Resilience & Store Degradation ──
  console.log('\n--- Test Suite 3: Independent Failure Resilience ---');
  const mockFailingScraper = new BaseProvider('failingStore', 'Failing Store', 'https://failing.com');
  mockFailingScraper.searchProducts = async () => {
    throw new Error('Simulated network timeout');
  };

  let threw = false;
  try {
    const res = await mockFailingScraper.safeGet('http://localhost:59999/nonexistent', { timeout: 500 });
    assert(res.ok === false, 'Safe get handles unreachable endpoint cleanly');
  } catch {
    threw = true;
  }
  assert(!threw, 'SafeGet does not throw unhandled promise rejections');

  // ── TEST SUITE 4: Database Connection & Scraper Registry ──
  console.log('\n--- Test Suite 4: Scraper Registry & Database ---');
  await connectDB();
  const { getAllProviderKeys } = require('./src/config/providers');
  const allStores = getAllProviderKeys().map(k => k.toLowerCase());
  assert(allStores.includes('amazon'), 'Amazon scraper registered');
  assert(allStores.includes('flipkart'), 'Flipkart scraper registered');
  assert(allStores.includes('croma'), 'Croma scraper registered');
  assert(allStores.includes('reliancedigital'), 'Reliance Digital scraper registered');
  assert(allStores.includes('vijaysales'), 'Vijay Sales scraper registered');
  assert(allStores.includes('myntra'), 'Myntra scraper registered');
  assert(allStores.includes('ajio'), 'AJIO scraper registered');
  assert(allStores.includes('meesho'), 'Meesho scraper registered');
  assert(allStores.length === 8, 'All 8 target store scrapers registered');

  console.log('\n====================================================');
  console.log(`  Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
