import { z } from 'zod';

/**
 * 执行模式类型
 */
export type ExecutionMode = 'serial' | 'parallel' | 'batch' | 'priority';

/**
 * Tool definition interface
 */
export interface Tool {
  name: string;
  description: string;
  inputSchema: object;
  handler: (args: unknown) => Promise<unknown>;
}

/**
 * Agent orchestration arguments
 */
export const AgentOrchestrateSchema = z.object({
  workflowId: z.string().optional().describe('Predefined workflow ID to use'),
  tasks: z.array(z.object({
    id: z.string().describe('Task identifier'),
    agentType: z.enum(['scout', 'coder', 'tester', 'reviewer', 'docs']).describe('Type of agent'),
    description: z.string().describe('Task description'),
    dependencies: z.array(z.string()).optional().describe('Task IDs this depends on'),
    priority: z.number().optional().describe('Task priority (1=highest, 10=lowest)'),
    batchGroup: z.string().optional().describe('Batch group ID for batch mode'),
  })).optional().describe('Direct task definitions'),
  mode: z.enum(['serial', 'parallel', 'batch', 'priority']).default('parallel').describe('Execution mode: serial, parallel, batch, or priority'),
  parallel: z.boolean().default(false).describe('Execute tasks in parallel (deprecated, use mode)'),
  batchSize: z.number().optional().describe('Number of tasks per batch (for batch mode)'),
  timeout: z.number().default(300000).describe('Timeout in milliseconds'),
});

export type AgentOrchestrateArgs = z.infer<typeof AgentOrchestrateSchema>;

/**
 * Agent monitor arguments
 */
export const AgentMonitorSchema = z.object({
  workflowId: z.string().optional().describe('Monitor specific workflow'),
  agentId: z.string().optional().describe('Monitor specific agent'),
  showLogs: z.boolean().default(false).describe('Include recent logs'),
});

export type AgentMonitorArgs = z.infer<typeof AgentMonitorSchema>;

/**
 * Workflow creation arguments
 */
export const WorkflowCreateSchema = z.object({
  name: z.string().describe('Workflow name'),
  description: z.string().describe('Workflow description'),
  tasks: z.array(z.object({
    id: z.string().describe('Task ID'),
    agentType: z.enum(['scout', 'coder', 'tester', 'reviewer', 'docs']),
    description: z.string(),
    template: z.string().describe('Task template with placeholders'),
  })).describe('Task templates'),
  variables: z.array(z.object({
    name: z.string(),
    description: z.string(),
    required: z.boolean().default(true),
  })).optional(),
});

export type WorkflowCreateArgs = z.infer<typeof WorkflowCreateSchema>;

/**
 * Workflow execution result
 */
export interface WorkflowResult {
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  tasks: TaskResult[];
  startTime: string;
  endTime?: string;
  cost?: {
    inputTokens: number;
    outputTokens: number;
    estimatedCost: number;
  };
}

export interface TaskResult {
  taskId: string;
  agentType: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: string;
  error?: string;
  startTime?: string;
  endTime?: string;
}

/**
 * Agent status
 */
export interface AgentStatus {
  agentId: string;
  agentType: string;
  status: 'idle' | 'running' | 'error';
  currentTask?: string;
  queueLength: number;
  lastActive: string;
}

// ============================================================================
// Phase 2: Autonomous Planning Types
// ============================================================================

/**
 * Think tool arguments (genesis_think)
 */
export const ThinkSchema = z.object({
  goal: z.string().describe('Natural language description of the goal to achieve'),
  context: z.object({
    projectType: z.string().optional(),
    techStack: z.array(z.string()).optional(),
    constraints: z.array(z.string()).optional(),
  }).optional().describe('Additional context about the project'),
  autoExecute: z.boolean().default(false).describe('Automatically execute the generated workflow'),
});

export type ThinkArgs = z.infer<typeof ThinkSchema>;

/**
 * Task analysis result from Planner Agent
 */
export interface TaskAnalysis {
  goal: string;
  domain: 'web_scraping' | 'development' | 'debugging' | 'documentation' | 'research' | 'automation' | 'unknown';
  complexity: 'simple' | 'moderate' | 'complex' | 'very_complex';
  estimatedSteps: number;
  requiresResearch: boolean;
  requiresImplementation: boolean;
  requiresTesting: boolean;
  requiresDocumentation: boolean;
  keywords: string[];
  suggestedApproach: string;
  potentialChallenges: string[];
  requiredTools?: string[];
}

/**
 * Task node in decomposition tree
 */
export interface TaskNode {
  id: string;
  name: string;
  description: string;
  agentType: 'scout' | 'coder' | 'tester' | 'reviewer' | 'docs';
  estimatedDuration: number;
  dependencies: string[];
  subtasks?: TaskNode[];
  metadata?: {
    priority?: 'high' | 'medium' | 'low';
    requiresReview?: boolean;
    parallelizable?: boolean;
  };
}

/**
 * Agent capability definition
 */
export interface AgentCapability {
  name: string;
  description: string;
  keywords: string[];
  score: number;
}

/**
 * Agent definition for registry
 */
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
 * Generated plan structure
 */
export interface GeneratedPlan {
  planId: string;
  goal: string;
  analysis: TaskAnalysis;
  workflow: {
    id: string;
    name: string;
    description: string;
    tasks: Array<{
      id: string;
      agentType: string;
      description: string;
      template: string;
      dependencies?: string[];
      estimatedDuration?: number;
      metadata?: {
        priority?: 'high' | 'medium' | 'low';
        parallelizable?: boolean;
      };
    }>;
    metadata?: {
      generatedAt: string;
      sourceGoal: string;
      estimatedDuration: number;
      totalTasks: number;
    };
  };
  executionStrategy: {
    parallelGroups: string[][];
    criticalPath: string[];
    estimatedTotalDuration: number;
  };
}

/**
 * Plan record for database storage
 */
export interface PlanRecord {
  id: string;
  goal: string;
  analysis: string; // JSON stringified TaskAnalysis
  workflowId: string;
  status: 'draft' | 'approved' | 'executing' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

/**
 * Think tool result
 */
export interface ThinkResult {
  status: 'success' | 'error';
  plan?: GeneratedPlan;
  message: string;
  suggestedNextSteps?: string[];
}
