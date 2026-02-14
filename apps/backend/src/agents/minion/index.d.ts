import { QuillAgent } from '../quill';
import { ObserverAgent } from '../observer';
import { AcademyAgent } from '../academy';
import { CrystallizerAgent } from '../crystallizer';
export declare class MinionAgent {
    private intervalId;
    private quill;
    private observer;
    private academy;
    private crystallizer;
    constructor(quill: QuillAgent, observer: ObserverAgent, academy: AcademyAgent, crystallizer: CrystallizerAgent);
    start(): void;
    stop(): void;
}
//# sourceMappingURL=index.d.ts.map