import {
  AgentOrchestrateSchema,
  AgentMonitorSchema,
  WorkflowCreateSchema,
  ThinkSchema,
  type Tool,
} from '../types.js';
import { db } from '../db/index.js';
import { plannerAgent } from '../agents/planner.js';
import { taskDecomposer } from '../planning/decomposer.js';
import { workflowGenerator } from '../planning/workflow-generator.js';
import { toolRegistry } from './registry.js';
import { toolDetector } from './detector.js';
import { toolInstaller } from './installer.js';
import { toolGenerator } from './generator.js';
import { executionHistory } from '../learning/history.js';
import { learningEngine } from '../learning/engine.js';
import { optimizer } from '../learning/optimizer.js';
import { knowledgeBase } from '../learning/knowledge.js';

/**
 * Tool: agent_orchestrate
 * 
 * Orchestrate multiple agents to execute tasks in parallel or sequence.
 */
const agentOrchestrate: Tool = {
  name: 'agent_orchestrate',
  description: `Orchestrate multiple specialized agents to execute complex tasks.

Use this tool when you need to:
- Break down complex tasks into parallel subtasks
- Coordinate multiple agents (scout, coder, tester, reviewer, docs)
- Execute multi-step workflows with dependencies
- Manage long-running agent processes

Examples:
1. Research + Code: "Scout finds API docs, Coder implements integration"
2. Full Feature: "Scout research → Coder implement → Tester validate → Reviewer check"
3. Documentation: "Coder writes code → Docs generates documentation → Reviewer checks"`,
  inputSchema: {
    type: 'object',
    properties: {
      workflowId: {
        type: 'string',
        description: 'Predefined workflow ID (optional)',
      },
      tasks: {
        type: 'array',
        description: 'Task definitions (if not using predefined workflow)',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            agentType: { 
              type: 'string', 
              enum: ['scout', 'coder', 'tester', 'reviewer', 'docs'],
            },
            description: { type: 'string' },
            dependencies: { type: 'array', items: { type: 'string' } },
          },
          required: ['id', 'agentType', 'description'],
        },
      },
      parallel: {
        type: 'boolean',
        default: false,
        description: 'Execute independent tasks in parallel',
      },
      timeout: {
        type: 'number',
        default: 300000,
        description: 'Timeout in milliseconds (default: 5 minutes)',
      },
    },
  },
  handler: async (args) => {
    const parsed = AgentOrchestrateSchema.parse(args);

    // If workflowId provided, load workflow from database
    let tasks = parsed.tasks || [];
    if (parsed.workflowId) {
      const workflow = db.getWorkflow(parsed.workflowId);
      if (!workflow) {
        throw new Error(`Workflow not found: ${parsed.workflowId}`);
      }
      tasks = (workflow as any).tasks;
    }

    // Create execution record
    const executionId = `exec-${Date.now()}`;
    const execution = db.createExecution({
      id: executionId,
      workflowId: parsed.workflowId || 'custom',
      status: 'pending',
    });

    // For now, return the execution plan
    // Actual agent coordination will be implemented in Phase 3
    return {
      status: 'pending',
      executionId,
      message: `Created execution with ${tasks.length} tasks`,
      tasks: tasks.map((t: any) => ({
        ...t,
        status: 'pending',
      })),
      parallel: parsed.parallel,
      timeout: parsed.timeout,
    };
  },
};

/**
 * Tool: agent_monitor
 * 
 * Monitor the status of running agents and workflows.
 */
const agentMonitor: Tool = {
  name: 'agent_monitor',
  description: `Monitor the status of agents and workflows.

Use this tool to:
- Check which agents are running
- View workflow execution progress
- See recent logs and errors
- Monitor resource usage and costs

You can filter by workflow ID or specific agent ID.`,
  inputSchema: {
    type: 'object',
    properties: {
      workflowId: {
        type: 'string',
        description: 'Filter by workflow ID',
      },
      agentId: {
        type: 'string',
        description: 'Filter by agent ID',
      },
      showLogs: {
        type: 'boolean',
        default: false,
        description: 'Include recent log entries',
      },
    },
  },
  handler: async (args) => {
    const parsed = AgentMonitorSchema.parse(args);

    // Query workflows from database
    if (parsed.workflowId) {
      const workflow = db.getWorkflow(parsed.workflowId);
      const executions = db.getExecutions(parsed.workflowId);
      return {
        workflow,
        executions,
        executionCount: executions.length,
      };
    }

    // List all workflows
    const workflows = db.listWorkflows();
    const executions = db.getExecutions();

    return {
      workflows,
      workflowCount: workflows.length,
      recentExecutions: executions.slice(0, 10),
      totalExecutions: executions.length,
    };
  },
};

/**
 * Tool: workflow_create
 * 
 * Create reusable workflow templates.
 */
const workflowCreate: Tool = {
  name: 'workflow_create',
  description: `Create a reusable workflow template for common tasks.

Use this tool to:
- Save frequently used agent sequences
- Create standardized processes (code review, feature development, etc.)
- Share workflows with team members
- Automate repetitive multi-agent tasks

The workflow will be saved and can be referenced by its ID in agent_orchestrate.`,
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Workflow name',
      },
      description: {
        type: 'string',
        description: 'What this workflow does',
      },
      tasks: {
        type: 'array',
        description: 'Task templates',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            agentType: { 
              type: 'string', 
              enum: ['scout', 'coder', 'tester', 'reviewer', 'docs'],
            },
            description: { type: 'string' },
            template: { type: 'string' },
          },
          required: ['id', 'agentType', 'description', 'template'],
        },
      },
      variables: {
        type: 'array',
        description: 'Configurable variables for this workflow',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            description: { type: 'string' },
            required: { type: 'boolean' },
          },
          required: ['name', 'description'],
        },
      },
    },
    required: ['name', 'description', 'tasks'],
  },
  handler: async (args) => {
    const parsed = WorkflowCreateSchema.parse(args);

    // Persist to database
    const workflowId = `wf-${Date.now()}`;
    const workflow = db.createWorkflow({
      id: workflowId,
      name: parsed.name,
      description: parsed.description,
      tasks: parsed.tasks,
      variables: parsed.variables,
    });

    return {
      status: 'created',
      workflowId,
      message: 'Workflow template created and persisted to database',
      workflow,
    };
  },
};

/**
 * Tool: genesis_think
 * 
 * The brain of Genesis - analyzes goals and creates execution plans.
 * 
 * Phase 2: Autonomous Planning + Phase 3: Tool Detection
 */
const genesisThink: Tool = {
  name: 'genesis_think',
  description: `Analyze a goal and create an intelligent execution plan with Genesis agents.

This tool is the entry point for autonomous task decomposition. It will:
1. Analyze your goal to understand domain and complexity
2. Break it down into specific tasks for appropriate agents
3. Create a workflow with dependencies and execution strategy
4. Detect required MCP tools and check availability
5. Suggest tool installation or creation if needed
6. Optionally execute the plan immediately

Use this when you want Genesis to think through a problem and figure out:
- Which agents are needed
- What order to execute tasks
- How long it will take
- What tools are required
- What tools need to be installed

Examples:
1. "Scrape Qatar tourism events and create a markdown report"
2. "Implement JWT authentication for my API"
3. "Debug why users can't login"
4. "Refactor the database layer to use connection pooling"
5. "Research best practices for React state management"

The tool returns a complete plan with analysis, task breakdown, tool requirements, and execution strategy.`,
  inputSchema: {
    type: 'object',
    properties: {
      goal: {
        type: 'string',
        description: 'Your goal in natural language (e.g., "Scrape events from visitqatar.com")',
      },
      context: {
        type: 'object',
        description: 'Additional context about your project',
        properties: {
          projectType: { type: 'string', description: 'Type of project (web app, API, CLI tool, etc.)' },
          techStack: { type: 'array', items: { type: 'string' }, description: 'Technologies used (React, Node.js, Python, etc.)' },
          constraints: { type: 'array', items: { type: 'string' }, description: 'Constraints or requirements' },
        },
      },
      autoExecute: {
        type: 'boolean',
        default: false,
        description: 'Automatically execute the generated workflow',
      },
    },
    required: ['goal'],
  },
  handler: async (args) => {
    const parsed = ThinkSchema.parse(args);
    
    console.log(`🧠 Genesis 正在思考: ${parsed.goal}`);
    
    try {
      // Step 1: Analyze the goal
      console.log('  📊 Analyzing goal...');
      const analysis = plannerAgent.analyze({
        goal: parsed.goal,
        context: parsed.context,
      });
      
      console.log(`     Domain: ${analysis.domain}`);
      console.log(`     Complexity: ${analysis.complexity}`);
      console.log(`     Estimated steps: ${analysis.estimatedSteps}`);
      
      // Step 2: Decompose into tasks
      console.log('  🔨 Decomposing into tasks...');
      const taskNodes = taskDecomposer.decompose(analysis);
      console.log(`     Created ${taskNodes.length} tasks`);
      
      // Step 3: Detect required tools (Phase 3)
      console.log('  🔍 Detecting required tools...');
      const toolDetection = toolDetector.detectAll(analysis, taskNodes);
      console.log(`     Required: ${toolDetection.requiredTools.length} tools`);
      console.log(`     Missing: ${toolDetection.missingTools.length} tools`);
      console.log(`     Installed: ${toolDetection.installedTools.length} tools`);
      
      // Step 4: Check installation status
      const installPlan = toolDetector.generateInstallationPlan(toolDetection);
      if (!installPlan.canProceed && installPlan.manualInstallations.length > 0) {
        console.log('  ⚠️  Some tools require manual installation');
      }
      
      // Step 5: Generate workflow
      console.log('  📋 Generating workflow...');
      const workflow = workflowGenerator.generateWorkflow(parsed.goal, taskNodes, {
        name: `auto-${analysis.domain}-${Date.now()}`,
        description: `Auto-generated workflow for: ${parsed.goal}`,
      });
      
      // Step 6: Generate complete plan
      const plan = workflowGenerator.generatePlan(parsed.goal, analysis, taskNodes);
      
      // Step 7: Store plan in database
      db.createExecution({
        id: plan.planId,
        workflowId: workflow.id,
        status: 'pending',
      });
      
      // Step 8: Auto-execute if requested
      let executionResult = null;
      if (parsed.autoExecute) {
        console.log('  🚀 自动执行工作流...');
        executionResult = await agentOrchestrate.handler({
          workflowId: workflow.id,
          parallel: true,
        });
      }
      
      console.log('  ✅ Planning complete!');
      
      return {
        status: 'success',
        plan: {
          planId: plan.planId,
          goal: plan.goal,
          analysis: {
            domain: analysis.domain,
            complexity: analysis.complexity,
            estimatedSteps: analysis.estimatedSteps,
            suggestedApproach: analysis.suggestedApproach,
            potentialChallenges: analysis.potentialChallenges,
            requiredTools: analysis.requiredTools,
          },
          workflow: {
            id: workflow.id,
            name: workflow.name,
            taskCount: workflow.tasks.length,
            estimatedDuration: workflow.metadata?.estimatedDuration,
            tasks: workflow.tasks.map(t => ({
              id: t.id,
              agentType: t.agentType,
              description: t.description,
              estimatedDuration: t.estimatedDuration,
              dependencies: t.dependencies,
              priority: t.metadata?.priority,
            })),
          },
          executionStrategy: plan.executionStrategy,
        },
        toolAnalysis: {
          summary: toolDetector.getSummary(toolDetection),
          required: toolDetection.requiredTools.map(r => ({
            id: r.tool.id,
            name: r.tool.name,
            installed: r.tool.installed,
            critical: r.critical,
          })),
          missing: toolDetection.missingTools.map(r => ({
            id: r.tool.id,
            name: r.tool.name,
            canAutoInstall: toolRegistry.canAutoInstall(r.tool.id),
            installCommand: toolRegistry.getInstallationCommand(r.tool.id),
          })),
          installationPlan: installPlan.canProceed ? undefined : installPlan.steps,
        },
        execution: executionResult,
        message: 'Successfully analyzed goal and created execution plan',
        suggestedNextSteps: [
          ...(toolDetection.missingTools.length > 0 
            ? ['Install missing tools with genesis_tool_manage']
            : []),
          'Review the plan',
          'Execute with agent_orchestrate',
          'Modify tasks if needed',
        ],
      };
    } catch (error) {
      console.error('  ❌ Planning failed:', error);
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error during planning',
        suggestedNextSteps: ['Check goal description', 'Provide more context', 'Try breaking into smaller goals'],
      };
    }
  },
};

/**
 * Tool: genesis_tool_manage
 * 
 * Manage MCP tools - list, install, detect requirements, and generate new tools.
 * 
 * Phase 3: MCP Tool Ecosystem
 */
const genesisToolManage: Tool = {
  name: 'genesis_tool_manage',
  description: `Manage MCP tools for Genesis agents.

This tool provides comprehensive tool ecosystem management:
1. List available and installed tools
2. Detect what tools are needed for a task
3. Install missing tools (auto or manual)
4. Generate new tools when none exist
5. Check tool requirements and compatibility

Use this when:
- You need to know what tools are available
- Planning a task and want to check tool requirements
- Missing tools need to be installed
- A required tool doesn't exist and needs to be created

Examples:
1. "List all available tools"
2. "Detect tools needed for web scraping"
3. "Install the web browser tool"
4. "Generate a custom tool for Redis caching"
5. "Check what tools are installed"`,
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['list', 'detect', 'install', 'generate', 'status'],
        description: 'Action to perform',
      },
      toolId: {
        type: 'string',
        description: 'Tool ID (for install action)',
      },
      goal: {
        type: 'string',
        description: 'Goal description (for detect action)',
      },
      capability: {
        type: 'string',
        description: 'Capability to generate tool for (for generate action)',
      },
      autoInstall: {
        type: 'boolean',
        default: false,
        description: 'Automatically install detected missing tools',
      },
    },
    required: ['action'],
  },
  handler: async (args: any) => {
    const { action, toolId, goal, capability, autoInstall } = args;
    
    try {
      switch (action) {
        case 'list': {
          const all = toolRegistry.listAllTools();
          const installed = toolRegistry.listInstalledTools();
          const available = toolRegistry.listAvailableTools();
          const stats = toolRegistry.getRegistryStats();
          
          return {
            status: 'success',
            summary: {
              total: stats.total,
              installed: stats.installed,
              available: stats.available,
              custom: stats.custom,
            },
            installed: installed.map(t => ({
              id: t.id,
              name: t.name,
              version: t.version,
              categories: t.categories,
            })),
            available: available.map(t => ({
              id: t.id,
              name: t.name,
              description: t.description,
              canAutoInstall: toolRegistry.canAutoInstall(t.id),
            })),
          };
        }
        
        case 'detect': {
          if (!goal) {
            return {
              status: 'error',
              message: 'Goal is required for detect action',
            };
          }
          
          console.log(`🔍 Detecting tools needed for: ${goal}`);
          
          // Analyze and detect
          const analysis = plannerAgent.quickAnalyze(goal);
          const taskNodes = taskDecomposer.decompose(analysis);
          const detection = toolDetector.detectAll(analysis, taskNodes);
          
          return {
            status: 'success',
            summary: toolDetector.getSummary(detection),
            required: detection.requiredTools.map(r => ({
              id: r.tool.id,
              name: r.tool.name,
              installed: r.tool.installed,
              critical: r.critical,
            })),
            missing: detection.missingTools.map(r => ({
              id: r.tool.id,
              name: r.tool.name,
              canAutoInstall: toolRegistry.canAutoInstall(r.tool.id),
              installCommand: toolRegistry.getInstallationCommand(r.tool.id),
            })),
            canProceed: detection.missingTools.filter(r => r.critical).length === 0,
          };
        }
        
        case 'install': {
          if (!toolId) {
            return {
              status: 'error',
              message: 'toolId is required for install action',
            };
          }
          
          console.log(`📦 Installing tool: ${toolId}`);
          
          const result = await toolInstaller.installTool(toolId);
          
          return {
            status: result.success ? 'success' : 'error',
            toolId: result.toolId,
            message: result.message,
            requiresManualSteps: result.requiresManualSteps,
            manualInstructions: result.manualInstructions,
          };
        }
        
        case 'generate': {
          if (!capability) {
            return {
              status: 'error',
              message: 'capability is required for generate action',
            };
          }
          
          console.log(`🔨 Generating tool for capability: ${capability}`);
          
          const request = toolGenerator.analyzeToolNeed(capability, goal);
          const result = toolGenerator.generateTool(request);
          
          if (result.success && result.generatedTool) {
            return {
              status: 'success',
              message: result.message,
              tool: {
                id: result.generatedTool.id,
                name: result.generatedTool.name,
                description: result.generatedTool.description,
              },
              files: Object.keys(result.generatedTool.code),
              installationSteps: result.installationSteps,
            };
          } else {
            return {
              status: 'error',
              message: result.message,
            };
          }
        }
        
        case 'status': {
          const status = toolInstaller.getInstallationStatus();
          const stats = toolRegistry.getRegistryStats();
          
          return {
            status: 'success',
            summary: stats,
            installationStatus: status,
            popular: toolRegistry.getMostPopularTools(5).map(t => ({
              id: t.id,
              name: t.name,
              usageCount: t.usageCount,
            })),
          };
        }
        
        default:
          return {
            status: 'error',
            message: `Unknown action: ${action}`,
          };
      }
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};

/**
 * Tool: genesis_learn
 * 
 * Self-learning and optimization system.
 * 
 * Phase 4: Self-Learning & Optimization
 */
const genesisLearn: Tool = {
  name: 'genesis_learn',
  description: `Learn from execution history and optimize future tasks.

This tool provides self-learning capabilities:
1. Analyze execution history to extract patterns
2. Get optimization suggestions for plans
3. Query knowledge base for best practices
4. Predict success probability
5. View learning statistics

Use this when:
- You want to improve future task planning
- Checking best practices for a domain
- Analyzing past performance
- Getting optimization suggestions

Examples:
1. "Analyze my execution history"
2. "Get best practices for web scraping"
3. "Optimize this plan"
4. "What have we learned?"
5. "Show learning statistics"`,
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['analyze', 'optimize', 'knowledge', 'predict', 'stats'],
        description: 'Action to perform',
      },
      goal: {
        type: 'string',
        description: 'Goal to analyze (for optimize/predict actions)',
      },
      domain: {
        type: 'string',
        description: 'Domain to query (for knowledge action)',
      },
      query: {
        type: 'string',
        description: 'Search query (for knowledge action)',
      },
    },
    required: ['action'],
  },
  handler: async (args: any) => {
    const { action, goal, domain, query } = args;
    
    try {
      switch (action) {
        case 'analyze': {
          console.log('🧠 Analyzing execution history...\n');
          
          const learnings = learningEngine.analyzeHistory(domain);
          const stats = executionHistory.getStatistics();
          
          console.log(`✅ Analysis complete!`);
          console.log(`   Found ${learnings.length} new learnings`);
          console.log(`   Total executions: ${stats.totalExecutions}`);
          console.log(`   Overall success rate: ${stats.successRate.toFixed(1)}%`);
          
          return {
            status: 'success',
            summary: {
              newLearnings: learnings.length,
              totalExecutions: stats.totalExecutions,
              successRate: stats.successRate,
              topDomains: stats.topDomains,
              commonIssues: stats.commonIssues,
            },
            learnings: learnings.map(l => ({
              id: l.id,
              type: l.type,
              description: l.description,
              confidence: l.confidence,
              impact: l.impact,
            })),
          };
        }
        
        case 'optimize': {
          if (!goal) {
            return {
              status: 'error',
              message: 'Goal is required for optimize action',
            };
          }
          
          console.log(`🔧 Optimizing plan for: ${goal}\n`);
          
          // Get recommendations
          const recommendations = optimizer.getRecommendations(goal, domain);
          
          // Find similar executions
          const similar = executionHistory.findSimilarExecutions(goal, 5);
          
          // Get knowledge base recommendations
          const kbRecs = knowledgeBase.getRecommendations(domain || 'general');
          
          return {
            status: 'success',
            recommendations,
            similarExecutions: similar.length,
            bestPractices: kbRecs.map(k => ({
              title: k.title,
              content: k.content,
              category: k.category,
            })),
          };
        }
        
        case 'knowledge': {
          let entries;
          
          if (query) {
            console.log(`📚 Searching knowledge base: "${query}"`);
            const keywords = query.split(' ');
            entries = knowledgeBase.search(keywords);
          } else if (domain) {
            console.log(`📚 Getting knowledge for domain: ${domain}`);
            entries = knowledgeBase.getRecommendations(domain);
          } else {
            console.log('📚 Getting all knowledge');
            entries = knowledgeBase.getMostHelpful(10);
          }
          
          return {
            status: 'success',
            count: entries.length,
            entries: entries.map(e => ({
              id: e.id,
              category: e.category,
              title: e.title,
              content: e.content,
              tags: e.tags,
              helpful: e.usage.helpful,
            })),
          };
        }
        
        case 'predict': {
          if (!goal) {
            return {
              status: 'error',
              message: 'Goal is required for predict action',
            };
          }
          
          console.log(`🔮 Predicting success for: ${goal}\n`);
          
          // Analyze goal
          const analysis = plannerAgent.quickAnalyze(goal);
          const taskNodes = taskDecomposer.decompose(analysis);
          const workflow = workflowGenerator.generateWorkflow(goal, taskNodes);
          
          // Get prediction
          const prediction = optimizer.predictSuccess({
            goal,
            analysis,
            tasks: taskNodes,
            workflow,
          });
          
          // Get similar executions
          const similar = executionHistory.findSimilarExecutions(goal, 3);
          
          return {
            status: 'success',
            prediction: {
              successProbability: prediction.probability,
              confidence: prediction.probability > 70 ? 'high' : prediction.probability > 40 ? 'medium' : 'low',
            },
            factors: prediction.factors,
            similarHistory: similar.map(s => ({
              id: s.id,
              status: s.execution.status,
              goal: s.goal.substring(0, 50) + '...',
            })),
          };
        }
        
        case 'stats': {
          const stats = executionHistory.getStatistics();
          const kbStats = knowledgeBase.getStatistics();
          
          return {
            status: 'success',
            executionHistory: stats,
            knowledgeBase: kbStats,
            learnings: {
              total: learningEngine.getLearnings().length,
              byType: {
                pattern: learningEngine.getLearningsByType('pattern').length,
                best_practice: learningEngine.getLearningsByType('best_practice').length,
                issue: learningEngine.getLearningsByType('issue').length,
                insight: learningEngine.getLearningsByType('insight').length,
                optimization: learningEngine.getLearningsByType('optimization').length,
              },
            },
          };
        }
        
        default:
          return {
            status: 'error',
            message: `Unknown action: ${action}`,
          };
      }
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};

/**
 * Export all tools
 */
export const tools: Tool[] = [
  agentOrchestrate,
  agentMonitor,
  workflowCreate,
  genesisThink,
  genesisToolManage,
  genesisLearn,
];
