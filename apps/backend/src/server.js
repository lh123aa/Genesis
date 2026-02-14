import Fastify from 'fastify';
import cors from '@fastify/cors';
const fastify = Fastify({
    logger: true
});
fastify.register(cors, {
    origin: '*'
});
// Mock data generator
const getMockAgents = () => {
    const agents = [
        { id: 'minion-01', name: 'Minion', status: 'running', currentTask: 'Analyzing repository structure', progress: 45 },
        { id: 'scout-01', name: 'Scout', status: 'idle', currentTask: 'Waiting for instructions', progress: 0 },
        { id: 'quill-01', name: 'Quill', status: 'running', currentTask: 'Drafting documentation', progress: 78 },
        { id: 'observer-01', name: 'Observer', status: 'running', currentTask: 'Monitoring system metrics', progress: 92 },
        { id: 'academy-01', name: 'Academy', status: 'error', currentTask: 'Connection timeout', progress: 12 },
        { id: 'crystallizer-01', name: 'Crystallizer', status: 'idle', currentTask: 'System optimization pending', progress: 0 }
    ];
    return agents.map(agent => ({
        ...agent,
        runningTime: agent.status === 'running' ? Math.floor(Math.random() * 3600) : 0,
        details: {
            steps: ['Initialize', 'Scan', 'Process', 'Finalize'],
            currentStep: Math.floor(Math.random() * 4),
            logs: [
                `[${new Date().toISOString()}] INFO: Agent started`,
                `[${new Date().toISOString()}] DEBUG: Processing batch ${Math.floor(Math.random() * 100)}`,
                `[${new Date().toISOString()}] INFO: Checkpoint reached`
            ]
        }
    }));
};
fastify.get('/api/logs', async (request, reply) => {
    // In a real app, this would come from the shared logger
    return [
        { level: 'info', message: 'System initialized', timestamp: new Date().toISOString() },
        { level: 'warn', message: 'High memory usage detected', timestamp: new Date().toISOString() }
    ];
});
fastify.get('/api/status', async (request, reply) => {
    return {
        system: {
            status: 'healthy',
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        },
        agents: getMockAgents()
    };
});
export const startServer = async () => {
    try {
        await fastify.listen({ port: 3001, host: '0.0.0.0' });
        console.log('Server listening on port 3001');
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
//# sourceMappingURL=server.js.map