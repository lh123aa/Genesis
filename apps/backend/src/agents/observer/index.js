import { logger, withTrace } from '@project-genesis/shared';
export class ObserverAgent {
    async review(content) {
        return withTrace(undefined, async () => {
            logger.info('Reviewing content...');
            if (content.includes('fail')) {
                return { approved: false, feedback: 'Content contains forbidden word "fail"' };
            }
            return { approved: true, feedback: 'Content looks good' };
        });
    }
}
//# sourceMappingURL=index.js.map