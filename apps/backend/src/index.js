import { MinionAgent } from './agents/minion';
import { ScoutAgent } from './agents/scout';
import { QuillAgent } from './agents/quill';
import { ObserverAgent } from './agents/observer';
import { AcademyAgent } from './agents/academy';
import { CrystallizerAgent } from './agents/crystallizer';
import { logger } from '@project-genesis/shared';
import { startServer } from './server';
const quill = new QuillAgent();
const observer = new ObserverAgent();
const academy = new AcademyAgent();
const crystallizer = new CrystallizerAgent();
const minion = new MinionAgent(quill, observer, academy, crystallizer);
const scout = new ScoutAgent();
startServer();
minion.start();
scout.start();
const shutdown = () => {
    logger.info('Shutting down...');
    minion.stop();
    scout.stop();
    process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
//# sourceMappingURL=index.js.map