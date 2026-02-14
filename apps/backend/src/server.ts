import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Logger, SOPRegistry, CostController } from '@project-genesis/shared';

const fastify = Fastify({
  logger: true
});

fastify.register(cors, {
  origin: '*'
});

// Mock data generator for agents (keeping this for now as placeholder for Agent Manager state)
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

// Panopticon: Logs
fastify.get('/api/panopticon/logs', async (request, reply) => {
  return Logger.getRecentLogs();
});

// Panopticon: SOP Health
fastify.get('/api/panopticon/sop-health', async (request, reply) => {
  return SOPRegistry.getAllStats();
});

// Panopticon: Costs
fastify.get('/api/panopticon/costs', async (request, reply) => {
  return CostController.getAllCosts();
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

// Trace: Get trace details by traceId
fastify.get('/api/trace/:traceId', async (request, reply) => {
  const { traceId } = request.params as { traceId: string };
  
  // Mock trace data - in real implementation, this would query from storage
  const mockTrace = {
    traceId,
    startTime: new Date(Date.now() - 3600000).toISOString(),
    endTime: new Date().toISOString(),
    duration: 3600000,
    status: Math.random() > 0.3 ? 'success' : 'failed',
    steps: [
      { 
        id: 'step-1', 
        agent: 'Minion', 
        action: 'Task decomposition', 
        status: 'completed', 
        duration: 120000,
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      { 
        id: 'step-2', 
        agent: 'Scout', 
        action: 'Data collection', 
        status: 'completed', 
        duration: 300000,
        timestamp: new Date(Date.now() - 3480000).toISOString()
      },
      { 
        id: 'step-3', 
        agent: 'Quill', 
        action: 'Content generation', 
        status: 'completed', 
        duration: 600000,
        timestamp: new Date(Date.now() - 3180000).toISOString()
      },
      { 
        id: 'step-4', 
        agent: 'Observer', 
        action: 'Quality review', 
        status: Math.random() > 0.3 ? 'completed' : 'failed', 
        duration: 180000,
        timestamp: new Date(Date.now() - 2580000).toISOString()
      }
    ],
    logs: Logger.getRecentLogs().filter((log: any) => log.traceId === traceId || Math.random() > 0.5)
  };
  
  return mockTrace;
});

// Agent Control: Restart agent
fastify.post('/api/agents/:agentId/restart', async (request, reply) => {
  const { agentId } = request.params as { agentId: string };
  
  // Mock restart logic
  console.log(`Restarting agent: ${agentId}`);
  
  return {
    success: true,
    message: `Agent ${agentId} restarted successfully`,
    timestamp: new Date().toISOString()
  };
});

// Agent Control: Stop agent
fastify.post('/api/agents/:agentId/stop', async (request, reply) => {
  const { agentId } = request.params as { agentId: string };
  
  // Mock stop logic
  console.log(`Stopping agent: ${agentId}`);
  
  return {
    success: true,
    message: `Agent ${agentId} stopped successfully`,
    timestamp: new Date().toISOString()
  };
});

// Agent Control: Start agent
fastify.post('/api/agents/:agentId/start', async (request, reply) => {
  const { agentId } = request.params as { agentId: string };
  
  // Mock start logic
  console.log(`Starting agent: ${agentId}`);
  
  return {
    success: true,
    message: `Agent ${agentId} started successfully`,
    timestamp: new Date().toISOString()
  };
});

// Get all traces
fastify.get('/api/traces', async (request, reply) => {
  // Mock traces list
  const traces = Array.from({ length: 20 }, (_, i) => ({
    traceId: `trace-${Date.now()}-${i}`,
    startTime: new Date(Date.now() - i * 600000).toISOString(),
    status: Math.random() > 0.2 ? 'success' : 'failed',
    agentCount: Math.floor(Math.random() * 4) + 1,
    duration: Math.floor(Math.random() * 3600000)
  }));
  
  return traces;
});

export const startServer = async () => {
  try {
    await fastify.listen({ port: 3002, host: '0.0.0.0' });
    console.log('Server listening on port 3001');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
