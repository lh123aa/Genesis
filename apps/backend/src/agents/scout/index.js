import { logger, withTrace, memoryManager, LoopDetector, LoopDetectedError, CostController, CostLimitExceededError } from '@project-genesis/shared';
import { randomUUID } from 'node:crypto';
export class ScoutAgent {
    intervalId = null;
    detector = new LoopDetector();
    traceId;
    start() {
        this.traceId = randomUUID(); // Persistent ID for the session
        CostController.initBudget(this.traceId, 1000); // 1000 tokens budget
        logger.info('Scout started', { traceId: this.traceId });
        this.intervalId = setInterval(() => {
            withTrace(this.traceId, async () => {
                logger.info('Scraping data from Twitter...');
                try {
                    CostController.recordUsage(100); // Simulate 100 tokens per scrape
                    this.detector.recordAction('Mock tweet content');
                    await memoryManager.saveEmbedding('RawData', { content: 'Mock tweet content', source: 'twitter' });
                    logger.info('Saved mock data to Weaviate');
                }
                catch (error) {
                    logger.error('Agent Error:', { error: String(error) });
                    if (error instanceof LoopDetectedError || error instanceof CostLimitExceededError) {
                        logger.warn('Circuit Breaker Tripped! Stopping ScoutAgent.', { reason: error.name });
                        this.stop();
                    }
                }
            });
        }, 10000);
    }
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            logger.info('Scout stopped');
        }
    }
}
//# sourceMappingURL=index.js.map