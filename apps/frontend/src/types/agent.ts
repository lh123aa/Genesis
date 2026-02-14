export type AgentStatus = 'running' | 'idle' | 'error';

export interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  currentTask: string;
  runningTime: number;
  progress: number;
  details: {
    steps: string[];
    currentStep: number;
    logs: string[];
  };
}

export interface SystemStatus {
  system: {
    status: 'healthy' | 'degraded' | 'critical';
    uptime: number;
    timestamp: string;
  };
  agents: Agent[];
}
