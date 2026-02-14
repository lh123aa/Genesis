import { logger, withTrace } from '@project-genesis/shared';

export class QuillAgent {
  async generate(prompt: string, context?: string): Promise<string> {
    return withTrace(undefined, async () => {
      logger.info('Generating content...');
      await new Promise((resolve) => setTimeout(resolve, 1000));
      let content = `Generated content for: ${prompt}`;
      if (context) {
        content += ` with context: ${context}`;
      }
      logger.info(`Content generated: ${content}`);
      return content;
    });
  }
}
