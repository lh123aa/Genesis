/**
 * Agent Registry
 * 
 * Maintains registry of available agents and their capabilities.
 * Used by the planning system to match tasks with appropriate agents.
 */

export interface AgentCapability {
  name: string;
  description: string;
  keywords: string[];
  score: number; // 0-100, higher = more specialized
}

export interface AgentDefinition {
  id: string;
  name: string;
  type: 'scout' | 'coder' | 'tester' | 'reviewer' | 'docs';
  description: string;
  capabilities: AgentCapability[];
  maxConcurrentTasks: number;
  preferredTaskTypes: string[];
}

/**
 * Built-in agent definitions with their capabilities
 */
const AGENT_DEFINITIONS: AgentDefinition[] = [
  {
    id: 'scout',
    name: 'Scout Agent',
    type: 'scout',
    description: 'Discovery, research, and information gathering specialist',
    capabilities: [
      {
        name: 'web_research',
        description: 'Research information from web sources',
        keywords: ['research', 'find', 'discover', 'explore', 'search', 'gather', 'investigate'],
        score: 95,
      },
      {
        name: 'api_exploration',
        description: 'Explore and understand API documentation',
        keywords: ['api', 'endpoint', 'documentation', 'swagger', 'openapi', 'rest'],
        score: 90,
      },
      {
        name: 'code_analysis',
        description: 'Analyze existing code to understand structure',
        keywords: ['analyze', 'understand', 'review', 'explore', 'inspect', 'study'],
        score: 85,
      },
      {
        name: 'requirement_gathering',
        description: 'Gather and clarify requirements',
        keywords: ['requirement', 'spec', 'specification', 'clarify', 'gather'],
        score: 80,
      },
    ],
    maxConcurrentTasks: 3,
    preferredTaskTypes: ['research', 'discovery', 'analysis', 'exploration'],
  },
  {
    id: 'coder',
    name: 'Coder Agent',
    type: 'coder',
    description: 'Implementation, coding, and automation specialist',
    capabilities: [
      {
        name: 'code_implementation',
        description: 'Write production code',
        keywords: ['implement', 'code', 'write', 'develop', 'build', 'create', 'program'],
        score: 95,
      },
      {
        name: 'refactoring',
        description: 'Refactor and improve existing code',
        keywords: ['refactor', 'improve', 'optimize', 'clean', 'restructure'],
        score: 90,
      },
      {
        name: 'automation',
        description: 'Create automation scripts and tools',
        keywords: ['automate', 'script', 'tool', 'cli', 'pipeline', 'workflow'],
        score: 88,
      },
      {
        name: 'integration',
        description: 'Integrate external services and APIs',
        keywords: ['integrate', 'api', 'service', 'connect', 'third-party', 'webhook'],
        score: 85,
      },
    ],
    maxConcurrentTasks: 2,
    preferredTaskTypes: ['implementation', 'coding', 'automation', 'integration'],
  },
  {
    id: 'tester',
    name: 'Tester Agent',
    type: 'tester',
    description: 'Validation, testing, and quality assurance specialist',
    capabilities: [
      {
        name: 'unit_testing',
        description: 'Write and execute unit tests',
        keywords: ['test', 'unit', 'jest', 'mocha', 'vitest', 'unittest', 'spec'],
        score: 95,
      },
      {
        name: 'integration_testing',
        description: 'Test component and system integration',
        keywords: ['integration', 'e2e', 'end-to-end', 'system', 'functional'],
        score: 90,
      },
      {
        name: 'test_automation',
        description: 'Create automated test suites',
        keywords: ['automation', 'ci', 'pipeline', 'regression', 'automated'],
        score: 88,
      },
      {
        name: 'bug_reproduction',
        description: 'Reproduce and verify bugs',
        keywords: ['bug', 'reproduce', 'verify', 'issue', 'defect', 'report'],
        score: 85,
      },
    ],
    maxConcurrentTasks: 2,
    preferredTaskTypes: ['testing', 'validation', 'quality', 'verification'],
  },
  {
    id: 'reviewer',
    name: 'Reviewer Agent',
    type: 'reviewer',
    description: 'Review, audit, and quality check specialist',
    capabilities: [
      {
        name: 'code_review',
        description: 'Review code for quality and best practices',
        keywords: ['review', 'audit', 'quality', 'best-practice', 'standard', 'compliance'],
        score: 95,
      },
      {
        name: 'security_audit',
        description: 'Security review and vulnerability assessment',
        keywords: ['security', 'vulnerability', 'audit', 'penetration', 'secure'],
        score: 90,
      },
      {
        name: 'performance_review',
        description: 'Review performance and optimization opportunities',
        keywords: ['performance', 'optimize', 'speed', 'memory', 'cpu', 'efficiency'],
        score: 85,
      },
      {
        name: 'architecture_review',
        description: 'Review system architecture and design',
        keywords: ['architecture', 'design', 'pattern', 'structure', 'organization'],
        score: 80,
      },
    ],
    maxConcurrentTasks: 3,
    preferredTaskTypes: ['review', 'audit', 'quality-check', 'assessment'],
  },
  {
    id: 'docs',
    name: 'Docs Agent',
    type: 'docs',
    description: 'Documentation, writing, and explaining specialist',
    capabilities: [
      {
        name: 'documentation',
        description: 'Write technical documentation',
        keywords: ['document', 'doc', 'readme', 'guide', 'manual', 'reference'],
        score: 95,
      },
      {
        name: 'api_documentation',
        description: 'Document APIs and interfaces',
        keywords: ['api-doc', 'swagger', 'openapi', 'endpoint', 'interface'],
        score: 90,
      },
      {
        name: 'code_comments',
        description: 'Add comments and documentation to code',
        keywords: ['comment', 'annotate', 'explain', 'jsdoc', 'docstring'],
        score: 88,
      },
      {
        name: 'tutorials',
        description: 'Create tutorials and how-to guides',
        keywords: ['tutorial', 'how-to', 'guide', 'walkthrough', 'example'],
        score: 85,
      },
    ],
    maxConcurrentTasks: 3,
    preferredTaskTypes: ['documentation', 'writing', 'explaining', 'tutorial'],
  },
];

/**
 * Agent Registry class
 */
export class AgentRegistry {
  private agents: Map<string, AgentDefinition>;

  constructor() {
    this.agents = new Map();
    // Register built-in agents
    AGENT_DEFINITIONS.forEach(agent => {
      this.agents.set(agent.id, agent);
    });
  }

  /**
   * Get all available agents
   */
  listAvailableAgents(): AgentDefinition[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agent by ID
   */
  getAgent(id: string): AgentDefinition | undefined {
    return this.agents.get(id);
  }

  /**
   * Get agent by type
   */
  getAgentByType(type: string): AgentDefinition | undefined {
    return Array.from(this.agents.values()).find(agent => agent.type === type);
  }

  /**
   * Find best agents for a task based on keywords
   */
  getAgentsForTask(taskDescription: string, taskType?: string): AgentDefinition[] {
    const normalizedDescription = taskDescription.toLowerCase();
    const scoredAgents: { agent: AgentDefinition; score: number }[] = [];

    for (const agent of this.agents.values()) {
      let score = 0;

      // Check capability keywords
      for (const capability of agent.capabilities) {
        for (const keyword of capability.keywords) {
          if (normalizedDescription.includes(keyword.toLowerCase())) {
            score += capability.score;
          }
        }
      }

      // Check preferred task types
      if (taskType) {
        for (const preferred of agent.preferredTaskTypes) {
          if (taskType.toLowerCase().includes(preferred.toLowerCase())) {
            score += 50;
          }
        }
      }

      // Boost score based on type hints in description
      if (normalizedDescription.includes(agent.type.toLowerCase())) {
        score += 30;
      }

      if (score > 0) {
        scoredAgents.push({ agent, score });
      }
    }

    // Sort by score descending
    scoredAgents.sort((a, b) => b.score - a.score);

    // Return top 3 agents (or all if less than 3)
    return scoredAgents.slice(0, 3).map(sa => sa.agent);
  }

  /**
   * Get the best single agent for a task
   */
  getBestAgentForTask(taskDescription: string, taskType?: string): AgentDefinition | undefined {
    const agents = this.getAgentsForTask(taskDescription, taskType);
    return agents[0];
  }

  /**
   * Check if an agent can handle a specific task
   */
  canAgentHandleTask(agentId: string, taskDescription: string): boolean {
    const agent = this.getAgent(agentId);
    if (!agent) return false;

    const normalizedDescription = taskDescription.toLowerCase();
    
    for (const capability of agent.capabilities) {
      for (const keyword of capability.keywords) {
        if (normalizedDescription.includes(keyword.toLowerCase())) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Register a custom agent
   */
  registerAgent(agent: AgentDefinition): void {
    this.agents.set(agent.id, agent);
  }

  /**
   * Get agent statistics
   */
  getRegistryStats(): {
    totalAgents: number;
    agentTypes: string[];
    totalCapabilities: number;
  } {
    const agents = this.listAvailableAgents();
    const capabilities = agents.flatMap(a => a.capabilities);
    
    return {
      totalAgents: agents.length,
      agentTypes: agents.map(a => a.type),
      totalCapabilities: capabilities.length,
    };
  }
}

// Singleton instance
export const agentRegistry = new AgentRegistry();
