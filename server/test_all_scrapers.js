'use strict';

const { providerManager } = require('./src/providers');

async function checkScraperHealth(query = 'iphone 15') {
  console.log(`========================================================`);
  console.log(`  Scraper Health & Verification Test (Query: "${query}")`);
  console.log(`========================================================\n`);

  const results = await providerManager.executeAcrossStores(async (scraper) => {
    return await scraper.searchProducts(query, { limit: 5 });
  });

  const report = results.map(r => ({
    'Store': r.store,
    'Status': r.status.toUpperCase(),
    'Products Found': r.productsFound,
    'Response Time': `${r.durationMs || 0}ms`,
    'Last Successful Run': r.productsFound > 0 ? r.scrapedAt : 'N/A',
    'Last Error': r.error || (r.status === 'unavailable' ? 'No items on search page' : 'None')
  }));

  console.table(report);

  const successfulStores = results.filter(r => r.productsFound > 0);
  console.log(`\nTotal Active Stores Responding: ${successfulStores.length} / ${results.length}`);
  console.log(`Total Products Collected: ${results.reduce((sum, r) => sum + r.productsFound, 0)}`);

  return results;
}

if (require.main === module) {
  checkScraperHealth().then(() => {
    console.log('\n[PASS] Scraper test executed with independent failure handling.');
    process.exit(0);
  }).catch(err => {
    console.error('Health check failed:', err);
    process.exit(1);
  });
}

module.exports = { checkScraperHealth };
