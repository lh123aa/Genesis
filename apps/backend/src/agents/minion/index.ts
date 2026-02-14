import { logger, withTrace } from '@project-genesis/shared';
import { QuillAgent } from '../quill';
import { ObserverAgent } from '../observer';
import { AcademyAgent } from '../academy';
import { CrystallizerAgent } from '../crystallizer';

export class MinionAgent {
  private intervalId: NodeJS.Timeout | null = null;
  private quill: QuillAgent;
  private observer: ObserverAgent;
  private academy: AcademyAgent;
  private crystallizer: CrystallizerAgent;

  constructor(
    quill: QuillAgent,
    observer: ObserverAgent,
    academy: AcademyAgent,
    crystallizer: CrystallizerAgent
  ) {
    this.quill = quill;
    this.observer = observer;
    this.academy = academy;
    this.crystallizer = crystallizer;
  }

  start() {
    logger.info('Minion started');

    this.intervalId = setInterval(() => {
      withTrace(undefined, async () => {
        logger.info('Checking for tasks...');
        const task = 'test task';
        
        const hasGap = await this.academy.analyzeGap(task);
        let context: string | undefined;

        if (hasGap) {
          logger.info('Gap Detected');
          context = await this.academy.remediate(task);
          logger.info('Learning...');
        }

        const content = await this.quill.generate(task, context);
        logger.info(`Minion received: ${content}`);
        
        const review = await this.observer.review(content);
        if (review.approved) {
          logger.info('Validation Passed');
          // Crystallize the successful run
          const sopId = await this.crystallizer.crystallize(task, {
            task,
            context,
            content,
            review
          });
          logger.info(`SOP Crystallized: ${sopId}`);
        } else {
          logger.info(`Validation Failed: ${review.feedback}`);
        }
      });
    }, 5000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('Minion stopped');
    }
  }
}
