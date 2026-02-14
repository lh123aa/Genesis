import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

const storage = new AsyncLocalStorage<string>();

/**
 * Wraps a function execution with a trace ID.
 * If a trace ID is provided, it is used.
 * If not provided, it tries to reuse the existing trace ID.
 * If no trace ID exists, a new UUID is generated.
 */
export function withTrace<T>(traceId: string | undefined, fn: () => T): T {
  const currentId = storage.getStore();
  const id = traceId || currentId || randomUUID();
  return storage.run(id, fn);
}

/**
 * Retrieves the current trace ID from AsyncLocalStorage.
 */
export function getTraceId(): string | undefined {
  return storage.getStore();
}
