import { logger } from './logger';

export interface SOPStats {
  executions: number;
  failures: number;
  lastUpdated: number;
}

export class SOPRegistry {
  private static stats: Map<string, SOPStats> = new Map();

  static recordExecution(sopId: string, success: boolean) {
    let stat = this.stats.get(sopId);
    if (!stat) {
      stat = { executions: 0, failures: 0, lastUpdated: Date.now() };
      this.stats.set(sopId, stat);
    }

    stat.executions++;
    if (!success) stat.failures++;
    stat.lastUpdated = Date.now();
    
    // Check health immediately
    if (this.isStale(sopId)) {
        logger.warn(`SOP ${sopId} is now STALE (Fail Rate: ${(stat.failures/stat.executions).toFixed(2)})`);
    }
  }

  static isStale(sopId: string): boolean {
    const stat = this.stats.get(sopId);
    if (!stat || stat.executions < 5) return false; // Need at least 5 runs
    
    const failRate = stat.failures / stat.executions;
    return failRate > 0.2; // > 20% failure rate
  }
  
  static getStats(sopId: string) {
      return this.stats.get(sopId);
  }

  static getAllStats(): Record<string, SOPStats> {
    return Object.fromEntries(this.stats);
  }
}
