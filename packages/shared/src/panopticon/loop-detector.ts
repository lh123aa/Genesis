import { logger } from './logger';

export class LoopDetectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LoopDetectedError';
  }
}

export class LoopDetector {
  private history: string[] = [];
  private maxHistory: number = 10;

  constructor() {}

  /**
   * Records an action/output hash and checks for loops.
   * Throws LoopDetectedError if 3 consecutive identical actions are detected.
   */
  recordAction(actionHash: string): void {
    this.history.push(actionHash);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    if (this.detectSimpleLoop()) {
      const msg = `Loop detected: Action '${actionHash}' repeated 3 times.`;
      logger.error('Loop Detected', { actionHash });
      throw new LoopDetectedError(msg);
    }
  }

  private detectSimpleLoop(): boolean {
    if (this.history.length < 3) return false;
    const len = this.history.length;
    const last = this.history[len - 1];
    const second = this.history[len - 2];
    const third = this.history[len - 3];
    return last === second && last === third;
  }
  
  clear(): void {
    this.history = [];
  }
}
