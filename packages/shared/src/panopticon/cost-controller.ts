import { logger } from './logger';
import { getTraceId } from './tracer';

export class CostLimitExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CostLimitExceededError';
  }
}

interface TaskCost {
  tokens: number;
  limit: number;
}

export class CostController {
  private static costs: Map<string, TaskCost> = new Map();
  // Default limit if not specified (e.g. 10k tokens)
  private static DEFAULT_LIMIT = 10000;

  /**
   * Initialize a budget for a task (traceId).
   */
  static initBudget(traceId: string, tokenLimit: number) {
    this.costs.set(traceId, { tokens: 0, limit: tokenLimit });
  }

  /**
   * Record usage and check limit.
   * Automatically uses current traceId if not provided.
   * Throws CostLimitExceededError if limit exceeded.
   */
  static recordUsage(tokens: number, traceId?: string) {
    const id = traceId || getTraceId();
    if (!id) return; // No trace context, ignore?

    let cost = this.costs.get(id);
    if (!cost) {
      // Auto-init with default if missing
      cost = { tokens: 0, limit: this.DEFAULT_LIMIT };
      this.costs.set(id, cost);
    }

    cost.tokens += tokens;
    
    if (cost.tokens > cost.limit) {
      const msg = `Cost limit exceeded for task ${id}: ${cost.tokens} > ${cost.limit}`;
      logger.error('Cost Limit Exceeded', { traceId: id, usage: cost.tokens, limit: cost.limit });
      throw new CostLimitExceededError(msg);
    }
  }

  static getUsage(traceId?: string): number {
    const id = traceId || getTraceId();
    if (!id) return 0;
    return this.costs.get(id)?.tokens || 0;
  }

  static getAllCosts(): Record<string, TaskCost> {
    return Object.fromEntries(this.costs);
  }
  
  static clear(traceId?: string) {
    const id = traceId || getTraceId();
    if (id) this.costs.delete(id);
  }
}
