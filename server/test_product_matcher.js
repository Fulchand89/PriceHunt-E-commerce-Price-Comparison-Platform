const { matchProducts, groupListings } = require('./src/services/productMatcher.service');

function runTests() {
  console.log('Testing Product Matcher Engine...\n');

  // Test 1: Same product across different store naming conventions
  const item1 = { title: 'Apple iPhone 15 128GB Black', brand: 'Apple' };
  const item2 = { title: 'Apple iPhone 15 - 128 GB - Black', brand: 'Apple' };
  const res1 = matchProducts(item1, item2);
  console.log('Test 1 (Same product across stores):', res1.matched ? 'PASS' : 'FAIL', `Confidence: ${res1.confidence}%`);
  if (!res1.matched) throw new Error('Test 1 failed: items should match');

  // Test 2: Incompatible storage (128GB vs 256GB)
  const itemStorage1 = { title: 'Apple iPhone 15 128GB Black', brand: 'Apple' };
  const itemStorage2 = { title: 'Apple iPhone 15 256GB Black', brand: 'Apple' };
  const res2 = matchProducts(itemStorage1, itemStorage2);
  console.log('Test 2 (Storage conflict 128GB vs 256GB):', !res2.matched && res2.conflict === 'storage' ? 'PASS' : 'FAIL', `Conflict: ${res2.conflict}`);
  if (res2.matched) throw new Error('Test 2 failed: 128GB must not match 256GB');

  // Test 3: Incompatible RAM (8GB vs 12GB)
  const itemRam1 = { title: 'OnePlus 12 8GB RAM 256GB', brand: 'OnePlus' };
  const itemRam2 = { title: 'OnePlus 12 12GB RAM 256GB', brand: 'OnePlus' };
  const res3 = matchProducts(itemRam1, itemRam2);
  console.log('Test 3 (RAM conflict 8GB vs 12GB):', !res3.matched && res3.conflict === 'ram' ? 'PASS' : 'FAIL', `Conflict: ${res3.conflict}`);
  if (res3.matched) throw new Error('Test 3 failed: 8GB RAM must not match 12GB RAM');

  // Test 4: Incompatible Color (Black vs Blue)
  const itemColor1 = { title: 'Apple iPhone 15 128GB Black', brand: 'Apple' };
  const itemColor2 = { title: 'Apple iPhone 15 128GB Blue', brand: 'Apple' };
  const res4 = matchProducts(itemColor1, itemColor2);
  console.log('Test 4 (Color conflict Black vs Blue):', !res4.matched && res4.conflict === 'color' ? 'PASS' : 'FAIL', `Conflict: ${res4.conflict}`);
  if (res4.matched) throw new Error('Test 4 failed: Black must not match Blue');

  // Test 5: Multi-store grouping
  const groupInput = [
    { title: 'Apple iPhone 15 128GB Black', price: 58000, provider: 'amazon' },
    { title: 'Apple iPhone 15 - 128 GB - Black', price: 57999, provider: 'flipkart' },
    { title: 'Apple iPhone 15 256GB Black', price: 68000, provider: 'amazon' },
  ];
  const groups = groupListings(groupInput);
  console.log('Test 5 (Group listings):', groups.length === 2 ? 'PASS' : 'FAIL', `Groups formed: ${groups.length}`);
  if (groups.length !== 2) throw new Error('Test 5 failed: 128GB and 256GB should form 2 distinct groups');

  console.log('\n[PASS] All Product Matcher Engine tests passed successfully!');
}

runTests();
