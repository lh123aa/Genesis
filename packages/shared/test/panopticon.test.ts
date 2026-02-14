import { logger, withTrace, getTraceId, CircuitBreaker, CircuitState } from '../src/panopticon';

async function runTest() {
  console.log('--- Starting Panopticon Core Test ---');

  // 1. Test Tracer & Logger
  console.log('\n1. Testing Tracer & Logger:');
  withTrace('test-trace-id', () => {
    const currentTraceId = getTraceId();
    console.log(`Current Trace ID: ${currentTraceId}`);
    if (currentTraceId !== 'test-trace-id') {
      throw new Error('Trace ID mismatch');
    }
    logger.info('This is an info log with traceId');
  });

  withTrace(undefined, () => {
    const currentTraceId = getTraceId();
    console.log(`Generated Trace ID: ${currentTraceId}`);
    if (!currentTraceId) {
      throw new Error('Trace ID should be generated');
    }
    logger.warn('This is a warn log with generated traceId', { userId: '123' });
  });

  // 2. Test Circuit Breaker
  console.log('\n2. Testing Circuit Breaker:');
  const cb = new CircuitBreaker({ failureThreshold: 2, resetTimeout: 1000 });

  console.log(`Initial state: ${cb.getState()}`);

  // First failure
  try {
    await cb.execute(async () => {
      throw new Error('Service failure');
    });
  } catch (e: any) {
    console.log(`Caught expected error: ${e.message}`);
  }
  console.log(`State after 1 failure: ${cb.getState()}`);

  // Second failure -> should open
  try {
    await cb.execute(async () => {
      throw new Error('Service failure');
    });
  } catch (e: any) {
    console.log(`Caught expected error: ${e.message}`);
  }
  console.log(`State after 2 failures: ${cb.getState()}`);

  if (cb.getState() !== CircuitState.OPEN) {
    throw new Error('Circuit breaker should be OPEN');
  }

  // Try executing while open
  try {
    await cb.execute(async () => 'success');
  } catch (e: any) {
    console.log(`Caught expected error while OPEN: ${e.message}`);
  }

  // Wait for reset timeout
  console.log('Waiting for reset timeout...');
  await new Promise(resolve => setTimeout(resolve, 1100));

  // Should be HALF_OPEN on next call
  const result = await cb.execute(async () => 'recovered');
  console.log(`Result after recovery: ${result}`);
  console.log(`State after recovery: ${cb.getState()}`);

  if (cb.getState() !== CircuitState.CLOSED) {
    throw new Error('Circuit breaker should be CLOSED after success');
  }

  console.log('\n--- Panopticon Core Test Passed! ---');
}

runTest().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
