import { MemoryManager, getRedisClient, getWeaviateClient } from '../src/memory';

async function runTest() {
  console.log('--- Starting Memory Client Test ---');

  // 1. Test Redis
  console.log('\n1. Testing Redis:');
  const redis = getRedisClient();
  try {
    await redis.set('test-key', 'test-value');
    const value = await redis.get('test-key');
    console.log(`Redis get('test-key'): ${value}`);
    if (value !== 'test-value') {
      throw new Error('Redis value mismatch');
    }
    console.log('Redis test passed!');
  } catch (err: any) {
    console.error('Redis test failed (is Redis running?):', err.message);
  }

  // 2. Test Weaviate
  console.log('\n2. Testing Weaviate:');
  const weaviate = getWeaviateClient();
  try {
    const meta = await weaviate.misc.metaGetter().do();
    console.log('Weaviate meta:', JSON.stringify(meta, null, 2));
    console.log('Weaviate test passed!');
  } catch (err: any) {
    console.error('Weaviate test failed (is Weaviate running?):', err.message);
  }

  // 3. Test MemoryManager
  console.log('\n3. Testing MemoryManager:');
  const memory = new MemoryManager();
  try {
    await memory.setState('manager-key', { foo: 'bar' });
    const state = await memory.getState('manager-key');
    console.log('MemoryManager state:', JSON.stringify(state));
    if (state.foo !== 'bar') {
      throw new Error('MemoryManager state mismatch');
    }
    console.log('MemoryManager test passed!');
  } catch (err: any) {
    console.error('MemoryManager test failed:', err.message);
  }

  console.log('\n--- Memory Client Test Finished ---');
  
  // Close connections
  redis.disconnect();
}

runTest().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
