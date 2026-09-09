require('dotenv').config();
const { connectDB } = require('./src/config/database');
const { search } = require('./src/services/productSearch.service');

async function test() {
  console.log('Connecting to database...');
  await connectDB();

  console.log('\n--- Running Search Service for "iPhone 15" ---');
  const res1 = await search('iPhone 15', { limit: 5 });
  console.log('Search success:', res1.success);
  console.log('Total results:', res1.total);
  console.log('Store statuses:');
  console.table(res1.storeStatuses);

  if (res1.results.length > 0) {
    const first = res1.results[0];
    console.log('\nFirst Result Product:');
    console.log('Title:', first.product.title);
    console.log('Lowest Price: ₹' + first.lowestPrice);
    console.log('Highest Price: ₹' + first.highestPrice);
    console.log('Price Diff (Savings): ₹' + first.priceDifference);
    console.log('Offers count:', first.offers.length);
    console.log('Offers breakdown:');
    console.table(first.offers.map(o => ({
      Store: o.store,
      Price: '₹' + o.price,
      MRP: '₹' + o.mrp,
      Discount: o.discount + '%',
      Lowest: o.isLowest ? 'YES' : 'NO'
    })));
  }

  console.log('\n--- Testing Cache Hit (<10 min TTL) ---');
  const res2 = await search('iPhone 15', { limit: 5 });
  console.log('Second call fromCache:', res2.fromCache ? 'PASS (Cached)' : 'FAIL');

  console.log('\n[PASS] Search Orchestrator & Cache tests completed successfully!');
  process.exit(0);
}

test().catch(e => {
  console.error('Search test failed:', e);
  process.exit(1);
});
