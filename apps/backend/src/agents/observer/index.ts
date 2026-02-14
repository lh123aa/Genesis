import { logger, withTrace } from '@project-genesis/shared';

export class ObserverAgent {
  async review(content: string): Promise<{ approved: boolean; feedback: string }> {
    return withTrace(undefined, async () => {
      logger.info('Reviewing content...');
      
      if (content.includes('fail')) {
        return { approved: false, feedback: 'Content contains forbidden word "fail"' };
      }
      
      return { approved: true, feedback: 'Content looks good' };
    });
  }
}
