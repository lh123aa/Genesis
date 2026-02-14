import { logger, withTrace, SOPRegistry } from '@project-genesis/shared';

export class AcademyAgent {
  constructor() {
    this.startSimulation();
  }

  private startSimulation() {
    // Simulate periodic SOP usage to generate data for Panopticon Dashboard
    setInterval(() => {
      const sopId = Math.random() > 0.5 ? 'sop-data-extraction' : 'sop-content-generation';
      const success = Math.random() > 0.2; // 80% success rate
      SOPRegistry.recordExecution(sopId, success);
    }, 5000);
  }

  async getSOP(sopId: string): Promise<string> {
    if (SOPRegistry.isStale(sopId)) {
      logger.warn(`SOP ${sopId} is stale. Returning fallback planner instructions.`);
      return "FALLBACK: Use Planner Agent for this task.";
    }
    return `SOP CONTENT for ${sopId}`;
  }

  async analyzeGap(task: string): Promise<boolean> {
    return withTrace(undefined, async () => {
      logger.info(`Analyzing gap for task: ${task}`);
      if (task.includes('unknown')) {
        logger.info('Gap detected: unknown task');
        return true;
      }
      return false;
    });
  }

  async remediate(task: string): Promise<string> {
    return withTrace(undefined, async () => {
      logger.info(`Remediating gap for task: ${task}`);
      await new Promise((resolve) => setTimeout(resolve, 500));
      return `Context: How to handle ${task}`;
    });
  }
}
