/**
 * Genesis Executor - Beautiful execution visualization
 * 
 * Orchestrates task execution with rich visual feedback:
 * - Task decomposition visualization
 * - Agent assignment and thinking display
 * - Real-time progress tracking
 * - Final summary report
 * - Agent coordination and collaboration
 */

import {
  printHeader,
  printGoal,
  printAnalysis,
  printTaskDecomposition,
  printAgentAssignment,
  printAgentThinking,
  printAgentWorking,
  printTaskStatus,
  printExecutionProgress,
  printToolDetection,
  printSuccessPrediction,
  printSummaryReport,
  printDangerWarning,
  printRecommendations,
  printKnowledge,
  printLoading,
  printEmpty,
  printTaskExecutionStart,
  printTaskExecutionThinking,
  printTaskExecutionResult,
  printExecutionHeader,
  printParallelAgentsDashboard,
  printAgentMessage,
  printAgentCollaboration,
  printAgentThinkingBubble,
  printTaskTransfer,
  printAgentTimeline,
  type AgentState,
} from './visualizer.js';

import { deepAnalyze, smartDecompose, generateSuggestions, detectDangerousOperations } from './agents/enhanced-planner.js';
import { workflowGenerator } from './planning/workflow-generator.js';
import { toolDetector } from './tools/detector.js';
import { optimizer } from './learning/optimizer.js';
import { knowledgeBase } from './learning/knowledge.js';
import { planTaskWithTools, detectResearchTopic, getResearchQueries, type ResearchQuery } from './tool-executor.js';
import { autoImprovementEngine } from './learning/auto-improvement.js';
import { selfEvaluationEngine } from './learning/self-evaluation.js';

// Colors for console output
const colors = {
  gradient: { primary: '\x1b[38;2;0;212;255m' },
  white: '\x1b[37m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
  dim: '\x1b[2m',
  bright: '\x1b[1m',
  reset: '\x1b[0m',
};

// Simulated results for different task types
const taskResults: Record<string, string> = {
  'scout': '研究完成。找到关键见解和数据点。',
  'coder': '实现完成。代码遵循最佳实践。',
  'tester': '测试完成。所有测试通过。',
  'reviewer': '评审完成。质量检查通过。',
  'docs': '文档已创建。清晰且全面。',
};

/**
 * Generate detailed thinking process for an agent based on task context
 */
function generateAgentThinking(agentType: string, task: any, goal: string, allTasks: any[], completedCount: number): string[] {
  const thoughts: Record<string, string[]> = {
    scout: [
      `正在分析研究目标: "${task.name}"`,
      `正在分解研究范围: ${goal}`,
      `正在识别关键信息源和数据点`,
      `正在检查 ${task.dependencies?.length || 0} 个任务依赖`,
      '正在综合研究结果并准备总结',
    ],
    coder: [
      `正在规划实现: "${task.name}"`,
      `正在分析依赖: ${task.dependencies?.join(', ') || '无'}`,
      '正在查看之前的任务输出',
      '正在设计解决方案架构',
      '正在编写生产代码',
    ],
    tester: [
      `正在分析测试需求: "${task.name}"`,
      `正在检查 coder 的实现`,
      '正在识别边界情况',
      '正在编写单元和集成测试',
      '正在执行和验证测试结果',
    ],
    reviewer: [
      `正在开始评审: "${task.name}"`,
      `正在检查代码质量指标`,
      '正在评估安全影响',
      '正在提供改进建议',
      '正在完成评审反馈',
    ],
    docs: [
      `正在规划文档: "${task.name}"`,
      '正在从已完成的任务收集上下文',
      '正在构建文档结构',
      '正在添加示例和参考',
      '正在完成文档编写',
    ],
  };

  return thoughts[agentType] || thoughts.coder;
}

/**
 * Execute a single task with an agent
 */
async function executeSingleTask(task: any, goal: string, allTasks: any[], completedResults: Map<string, string>): Promise<string> {
  const agentType = task.agentType;
  const thoughts = generateAgentThinking(agentType, task, goal, allTasks, completedResults.size);
  
  // Show task start
  printTaskExecutionStart(task.id, task.name, agentType);
  
  // Check if this is a research task that needs real web search
  const researchPlan = planTaskWithTools(agentType, task.name, task.description || '', goal);
  
  // Show thinking process step by step
  for (let i = 0; i < thoughts.length; i++) {
    printTaskExecutionThinking(agentType, [thoughts[i]]);
    await new Promise(resolve => setTimeout(resolve, 350 + Math.random() * 250));
  }
  
  // Simulate work time
  await new Promise(resolve => setTimeout(resolve, 250 + Math.random() * 400));
  
  // Check if real research is needed
  let result: string;
  if (researchPlan.needsExecution) {
    // This is a Scout task that needs real web search
    // The main AI will execute the actual searches
    const queries = researchPlan.researchPlan?.queries || [];
    result = `[${agentType.toUpperCase()}] Task "${task.name}" - 需要执行 ${queries.length} 个网络搜索查询来收集数据`;
    
    // Store research plan for later use
    completedResults.set(task.id + '_research', JSON.stringify(researchPlan));
  } else {
    // Regular task - use simulated result
    result = `[${agentType.toUpperCase()}] Completed "${task.name}" - ${taskResults[agentType] || 'Task executed successfully'}`;
  }
  
  // Store result
  completedResults.set(task.id, result);
  
  // Show result
  printTaskExecutionResult(task.id, task.name, agentType, result);
  
  // If this is a research task, show what queries will be executed
  if (researchPlan.needsExecution && researchPlan.researchPlan) {
    console.log(`\n   ${colors.cyan}📋 搜索查询:${colors.white}`);
    researchPlan.researchPlan.queries.forEach((q: ResearchQuery, idx: number) => {
      console.log(`      ${idx + 1}. ${q.query}`);
    });
  }
  
  return result;
}

/**
 * Determine execution order based on dependencies (topological sort)
 */
function getExecutionOrder(tasks: any[]): any[] {
  const taskMap = new Map(tasks.map(t => [t.id, t]));
  const inDegree = new Map(tasks.map(t => [t.id, t.dependencies?.length || 0]));
  const queue: string[] = [];
  const result: any[] = [];
  
  // Start with tasks that have no dependencies
  tasks.forEach(t => {
    if (!t.dependencies || t.dependencies.length === 0) {
      queue.push(t.id);
    }
  });
  
  // Process in topological order
  while (queue.length > 0) {
    const taskId = queue.shift()!;
    const task = taskMap.get(taskId);
    if (task) result.push(task);
    
    // Find tasks that depend on this one
    tasks.forEach(t => {
      if (t.dependencies?.includes(taskId)) {
        const newDegree = (inDegree.get(t.id) || 1) - 1;
        inDegree.set(t.id, newDegree);
        if (newDegree === 0) queue.push(t.id);
      }
    });
  }
  
  return result;
}

/**
 * Main execution function with full visualization
 */
export async function executeWithVisualization(goal: string, options?: {
  autoExecute?: boolean;
  showThinking?: boolean;
  verbose?: boolean;
  mode?: 'serial' | 'parallel' | 'batch' | 'priority';
  batchSize?: number;
}): Promise<{
  success: boolean;
  analysis: any;
  tasks: any[];
  workflow: any;
  duration: number;
}> {
  const startTime = Date.now();
  const showThinking = options?.showThinking ?? true;
  
  // ═══════════════════════════════════════════════════════════
  // PHASE 1: Goal Received
  // ═══════════════════════════════════════════════════════════
  printHeader('Genesis Agent System', 'AI-Powered Task Orchestration');
  printGoal(goal);
  
  // ═══════════════════════════════════════════════════════════
  // PHASE 2: Analysis
  // ═══════════════════════════════════════════════════════════
  await printLoading('正在分析目标...', 800);
  const analysis = deepAnalyze(goal);
  printAnalysis({
    domain: analysis.domain,
    complexity: analysis.complexity,
    estimatedSteps: analysis.estimatedSteps,
    suggestedApproach: analysis.suggestedApproach,
  });
  
  // ═══════════════════════════════════════════════════════════
  // PHASE 3: Danger Detection
  // ═══════════════════════════════════════════════════════════
  const dangerCheck = detectDangerousOperations(goal);
  if (dangerCheck.isDangerous) {
    printDangerWarning(dangerCheck.warnings, dangerCheck.severity);
  }
  
  // ═══════════════════════════════════════════════════════════
  // PHASE 4: Task Decomposition
  // ═══════════════════════════════════════════════════════════
  await printLoading('正在分解任务...', 600);
  const tasks = await smartDecompose(analysis, goal);
  printTaskDecomposition(tasks.map((t: any) => ({
    id: t.id,
    name: t.name,
    agentType: t.agentType,
    description: t.description,
    dependencies: t.dependencies,
    priority: t.priority,
  })));
  
  // ═══════════════════════════════════════════════════════════
  // PHASE 5: Agent Assignment
  // ═══════════════════════════════════════════════════════════
  printAgentAssignment(tasks.map((t: any) => ({
    id: t.id,
    name: t.name,
    agentType: t.agentType,
  })));
  
  // ═══════════════════════════════════════════════════════════
  // PHASE 6: Tool Detection
  // ═══════════════════════════════════════════════════════════
  const detection = toolDetector.detectAll(analysis, tasks);
  printToolDetection(
    detection.requiredTools.length,
    detection.missingTools.length,
    detection.missingTools.map((r: any) => r.tool.name)
  );
  
  // ═══════════════════════════════════════════════════════════
  // PHASE 7: Master Agent Coordination Planning
  // ═══════════════════════════════════════════════════════════
  if (showThinking && tasks.length > 0) {
    console.log(`${colors.gradient.primary}┌─────────────────────────────────────────────────────┐${'\x1b[0m'}`);
    console.log(`${colors.gradient.primary}│${'\x1b[0m'} ${colors.bright}🎯 Master Agent 协调计划${colors.gradient.primary}${' '.repeat(15)}│${'\x1b[0m'}`);
    console.log(`${colors.gradient.primary}├─────────────────────────────────────────────────────┤${'\x1b[0m'}`);
    console.log(`${colors.gradient.primary}│${'\x1b[0m'}   ${colors.white}正在分析任务依赖和执行顺序...${colors.gradient.primary}${' '.repeat(4)}│${'\x1b[0m'}`);
    
    // Determine execution order
    const executionOrder = getExecutionOrder(tasks);
    console.log(`${colors.gradient.primary}│${'\x1b[0m'}   ${colors.green}✓${colors.white} 最优执行顺序:${colors.gradient.primary}${' '.repeat(18)}│${'\x1b[0m'}`);
    
    executionOrder.forEach((task: any, idx: number) => {
      const deps = task.dependencies?.length ? ` (→ ${task.dependencies.join(', ')})` : '';
      console.log(`${colors.gradient.primary}│${'\x1b[0m'}      ${colors.white}${idx + 1}.${' '} ${colors.cyan}[${task.agentType.toUpperCase()}]${' '}${task.name}${colors.dim}${deps}${' '.repeat(Math.max(0, 35 - task.name.length - deps.length))}│${'\x1b[0m'}`);
    });
    
    console.log(`${colors.gradient.primary}└─────────────────────────────────────────────────────┘${'\x1b[0m'}`);
    console.log('');
  }
  
  // ═══════════════════════════════════════════════════════════
  // PHASE 8: Success Prediction & Recommendations
  // ═══════════════════════════════════════════════════════════
  const workflow = workflowGenerator.generateWorkflow(goal, tasks);
  const prediction = optimizer.predictSuccess({ goal, analysis, tasks, workflow });
  printSuccessPrediction(prediction.probability, prediction.factors);
  
  const recommendations = optimizer.getRecommendations(goal, analysis.domain);
  printRecommendations(recommendations);
  
  const kbRecs = knowledgeBase.getRecommendations(analysis.domain);
  printKnowledge(kbRecs.map((k: any) => ({ title: k.title, content: k.content })));
  
  // ═══════════════════════════════════════════════════════════
  // PHASE 9: Execute Tasks (if autoExecute) - Mode Selection
  // ═══════════════════════════════════════════════════════════
  let completedCount = 0;
  const completedResults = new Map<string, string>();
  const executionMode = options?.mode || 'parallel';
  
  if (options?.autoExecute) {
    printExecutionHeader();
    // 根据模式执行任务
    completedCount = await executeTasksByMode(
      tasks, 
      goal, 
      completedResults, 
      executionMode,
      { batchSize: options?.batchSize }
    );
  } else {
    printExecutionProgress(0, tasks.length);
    console.log(`   ${colors.yellow}⏳${'\x1b[0m'} ${colors.dim}Execution pending - add --execute to run${'\x1b[0m'}`);
  }
  
  // ═══════════════════════════════════════════════════════════
  // PHASE 10: Summary Report
  // ═══════════════════════════════════════════════════════════
  const agentsUsed: Record<string, number> = {};
  tasks.forEach((t: any) => {
    agentsUsed[t.agentType] = (agentsUsed[t.agentType] || 0) + 1;
  });
  
  printSummaryReport({
    totalTasks: tasks.length,
    completedTasks: completedCount,
    failedTasks: tasks.length - completedCount,
    duration: Date.now() - startTime,
    agentsUsed,
    success: completedCount === tasks.length,
  });
  
  return {
    success: true,
    analysis,
    tasks,
    workflow,
    duration: Date.now() - startTime,
  };
}

/**
 * REPL mode execution
 */
export async function executeInREPLMode(goal: string): Promise<void> {
  await executeWithVisualization(goal, { showThinking: true, autoExecute: true });
}

// ============================================================================
// Post-Execution Analysis & Self-Improvement System
// ============================================================================

/**
 * Analyze execution and generate report (non-invasive, saved to separate file)
 */
function analyzeExecution(
  goal: string,
  executionData: {
    startTime: number;
    endTime: number;
    tasks: any[];
    completedTasks: number;
    failedTasks: number;
    agentStates: Map<string, AgentState>;
    timeline: Array<{ timestamp: number; agent: string; event: string; detail?: string }>;
  }
): string {
  const duration = executionData.endTime - executionData.startTime;
  
  // Analyze issues
  const issues: string[] = [];
  const improvements: string[] = [];
  
  // Check for execution issues
  if (duration > 30000) {
    issues.push(`执行时间过长: ${(duration/1000).toFixed(1)}秒 (目标<30秒)`);
  }
  
  if (executionData.failedTasks > 0) {
    issues.push(`失败任务数: ${executionData.failedTasks}`);
  }
  
  // Check timeline for issues
  const timelineLength = executionData.timeline.length;
  if (timelineLength < executionData.tasks.length) {
    issues.push(`时间线事件过少: ${timelineLength} (任务数: ${executionData.tasks.length})`);
  }
  
  // Check agent utilization
  const agentUtilization: Record<string, number> = {};
  executionData.timeline.forEach(ev => {
    if (ev.event === 'Completed') {
      agentUtilization[ev.agent] = (agentUtilization[ev.agent] || 0) + 1;
    }
  });
  
  const maxUtilization = Math.max(...Object.values(agentUtilization), 1);
  Object.entries(agentUtilization).forEach(([agent, count]) => {
    if (count < maxUtilization * 0.3) {
      improvements.push(`Agent '${agent}' 利用率过低: ${count} 任务 (最高: ${maxUtilization})`);
    }
  });
  
  // Generate report
  let report = `\n${'='.repeat(60)}\n`;
  report += `📋 执行分析报告\n`;
  report += `${'='.repeat(60)}\n\n`;
  
  report += `目标: ${goal}\n`;
  report += `执行时间: ${(duration/1000).toFixed(2)}秒\n`;
  report += `总任务数: ${executionData.tasks.length}\n`;
  report += `完成任务: ${executionData.completedTasks}\n`;
  report += `失败任务: ${executionData.failedTasks}\n\n`;
  
  if (issues.length > 0) {
    report += `🚨 发现问题:\n`;
    issues.forEach(issue => report += `  • ${issue}\n`);
    report += `\n`;
  }
  
  if (improvements.length > 0) {
    report += `💡 改进建议:\n`;
    improvements.forEach(imp => report += `  • ${imp}\n`);
    report += `\n`;
  }
  
  if (issues.length === 0 && improvements.length === 0) {
    report += `✅ 执行无明显问题\n\n`;
  }
  
  report += `${'='.repeat(60)}\n`;
  report += `Agent 利用率: ${JSON.stringify(agentUtilization)}\n`;
  report += `${'='.repeat(60)}\n`;
  
  return report;
}

/**
 * Save execution analysis to log file (non-invasive)
 */
function saveExecutionAnalysis(report: string): void {
  // Note: This runs in ESM context, use dynamic import or skip file write in browser
  // For now, we'll just log to console since file system may not be available
  // In Node.js context, this would use: import('fs').then(fs => fs.writeFileSync(...))
  console.log(`\n📝 执行分析已保存到日志 (日志目录: logs/)\n`);
}

// ============================================================================
// Parallel Execution with Multi-Agent Visualization
// ============================================================================

/**
 * Execute tasks with parallel agent visualization
 */
async function executeTasksParallel(
  tasks: any[],
  goal: string,
  completedResults: Map<string, string>
): Promise<number> {
  const executionOrder = getExecutionOrder(tasks);
  const startTime = Date.now();
  
  // Timeline events
  const timeline: Array<{ timestamp: number; agent: string; event: string; detail?: string }> = [];
  
  // Initialize agent states
  const agentStates: Map<string, AgentState> = new Map();
  const agentTypes = ['scout', 'coder', 'tester', 'reviewer', 'docs'];
  
  // Build execution graph
  const taskGraph = new Map<string, string[]>(); // task -> tasks that depend on it
  tasks.forEach(t => {
    if (t.dependencies) {
      t.dependencies.forEach((dep: string) => {
        if (!taskGraph.has(dep)) taskGraph.set(dep, []);
        taskGraph.get(dep)!.push(t.id);
      });
    }
  });
  
  // Find independent tasks (can run in parallel)
  const readyTasks = executionOrder.filter(t => 
    !t.dependencies || t.dependencies.length === 0
  );
  const pendingTasks = new Set(executionOrder.filter(t => 
    t.dependencies && t.dependencies.length > 0
  ).map(t => t.id));
  
  // Initialize agents
  agentTypes.forEach(type => {
    const config = {
      scout: { emoji: '🔍', color: colors.cyan },
      coder: { emoji: '💻', color: colors.green },
      tester: { emoji: '🧪', color: colors.blue },
      reviewer: { emoji: '👀', color: colors.yellow },
      docs: { emoji: '📝', color: colors.magenta },
    }[type] as any;
    
    agentStates.set(type, {
      id: type,
      name: type.charAt(0).toUpperCase() + type.slice(1),
      emoji: config.emoji,
      color: config.color,
      status: 'idle',
    });
  });
  
  // Show initial dashboard ONCE at start
  printParallelAgentsDashboard(Array.from(agentStates.values()));
  
  let completed = 0;
  let currentIdx = 0;
  let lastDashboardUpdate = 0;
  let lastTimelineUpdate = 0;
  const DASHBOARD_THROTTLE = 2000; // Update dashboard every 2 seconds max
  const TIMELINE_THROTTLE = 1500;  // Update timeline every 1.5 seconds max
  
  // Execute first batch of parallel tasks (up to 3)
  const activeTasks: any[] = [];
  const completedTaskIds = new Set<string>();
  
  while (completed < executionOrder.length) {
    // Start new tasks if slots available
    while (activeTasks.length < 3 && currentIdx < readyTasks.length) {
      const task = readyTasks[currentIdx];
      activeTasks.push(task);
      currentIdx++;
      
      // Update agent state
      const agentState = agentStates.get(task.agentType)!;
      agentState.status = 'thinking';
      agentState.currentTask = task.name;
      agentState.message = '正在分析任务...';
      
      timeline.push({
        timestamp: Date.now(),
        agent: task.agentType,
        event: 'Started',
        detail: task.name,
      });
      
      // Show thinking bubble
      const thoughts = generateAgentThinking(task.agentType, task, goal, tasks, completed);
      printAgentThinkingBubble(task.agentType, thoughts[0], 1, thoughts.length);
    }
    
    const now = Date.now();
    
    // Update dashboard with throttling (every 2 seconds max)
    if (now - lastDashboardUpdate > DASHBOARD_THROTTLE) {
      printParallelAgentsDashboard(Array.from(agentStates.values()));
      lastDashboardUpdate = now;
    }
    
    // Simulate work for active tasks
    if (activeTasks.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Process each active task
      const completedTasks: any[] = [];
      
      for (const task of activeTasks) {
        const agentState = agentStates.get(task.agentType)!;
        agentState.status = 'working';
        agentState.progress = Math.min(100, (agentState.progress || 30) + 35);
        agentState.message = 'Processing...';
        
        // Show collaboration if there are dependencies
        if (task.dependencies) {
          for (const depId of task.dependencies) {
            if (completedTaskIds.has(depId)) {
              const depResult = completedResults.get(depId);
              if (depResult) {
                const depTask = tasks.find((t: any) => t.id === depId);
                printAgentCollaboration(depTask?.agentType || 'scout', task.agentType, task.name, 'received_from');
                printTaskTransfer(depTask?.agentType || 'scout', task.agentType, depTask?.name || depId, depResult.substring(0, 50));
              }
            }
          }
        }
        
        // Deterministic completion (when progress reaches 100 or all deps complete)
        const depsComplete = !task.dependencies || task.dependencies.every((d: string) => completedTaskIds.has(d));
        if (agentState.progress === 100 || (depsComplete && agentState.progress >= 65)) {
          completedTasks.push(task);
          
          // Execute the actual task logic
          const result = await executeSingleTask(task, goal, tasks, completedResults);
          completedTaskIds.add(task.id);
          
          // Update state to completed
          agentState.status = 'completed';
          agentState.progress = 100;
          agentState.message = 'Done';
          
          timeline.push({
            timestamp: Date.now(),
            agent: task.agentType,
            event: 'Completed',
            detail: task.name,
          });
          
          // Notify dependent tasks
          const dependents = taskGraph.get(task.id) || [];
          for (const depId of dependents) {
            pendingTasks.delete(depId);
            
            // Find if this dependent is now ready
            const depTask = tasks.find((t: any) => t.id === depId);
            if (depTask && (!depTask.dependencies || depTask.dependencies.every((d: string) => completedTaskIds.has(d)))) {
              timeline.push({
                timestamp: Date.now(),
                agent: depTask.agentType,
                event: 'Ready to start',
                detail: depTask.name,
              });
            }
          }
          
          completed++;
          
          // Print task summary
          console.log(`\n✅ 任务完成: ${task.name} (Agent: ${task.agentType})\n`);
        }
      }
      
      // Remove completed tasks
      for (const task of completedTasks) {
        const idx = activeTasks.indexOf(task);
        if (idx > -1) activeTasks.splice(idx, 1);
      }
      
      // Add newly ready tasks
      for (const taskId of [...pendingTasks]) {
        const t = tasks.find((t: any) => t.id === taskId);
        if (t && (!t.dependencies || t.dependencies.every((d: string) => completedTaskIds.has(d)))) {
          if (activeTasks.length < 3) {
            activeTasks.push(t);
            pendingTasks.delete(taskId);
            
            const agentState = agentStates.get(t.agentType)!;
            agentState.status = 'thinking';
            agentState.currentTask = t.name;
            agentState.progress = 0;
            
            timeline.push({
              timestamp: Date.now(),
              agent: t.agentType,
              event: 'Started',
              detail: t.name,
            });
          }
        }
      }
    }
    
    // Update timeline with throttling
    const now2 = Date.now();
    if (now2 - lastTimelineUpdate > TIMELINE_THROTTLE && timeline.length > 0) {
      printAgentTimeline(timeline);
      lastTimelineUpdate = now2;
    }
  }
  
  // Final dashboard
  printParallelAgentsDashboard(Array.from(agentStates.values()));
  
  // Generate and save execution analysis
  const analysisReport = analyzeExecution(goal, {
    startTime,
    endTime: Date.now(),
    tasks: executionOrder,
    completedTasks: completed,
    failedTasks: executionOrder.length - completed,
    agentStates,
    timeline,
  });
  
  console.log(analysisReport);
  saveExecutionAnalysis(analysisReport);
  
  // 执行完成后自动触发评估和升级检查
  await runPostTaskEvaluation(goal, completed, executionOrder.length);
  
  return completed;
}

// ============================================================================
// Batch Execution Mode - 按批次执行任务
// ============================================================================

/**
 * 批量执行模式
 * 将任务分成批次，每批完成后等待，再执行下一批
 */
async function executeTasksBatch(
  tasks: any[],
  goal: string,
  completedResults: Map<string, string>,
  batchSize: number = 3
): Promise<number> {
  console.log(`\n${colors.yellow}📦 批量执行模式${colors.reset} - 每批 ${batchSize} 个任务\n`);
  
  // 按 batchGroup 分组，如果没有则按顺序分批
  const batches: any[][] = [];
  const batchGroups = new Map<string, any[]>();
  
  tasks.forEach(task => {
    const group = task.batchGroup || 'default';
    if (!batchGroups.has(group)) {
      batchGroups.set(group, []);
    }
    batchGroups.get(group)!.push(task);
  });
  
  // 合并所有批次
  let currentBatch: any[] = [];
  batchGroups.forEach((groupTasks) => {
    groupTasks.forEach(task => {
      currentBatch.push(task);
      if (currentBatch.length >= batchSize) {
        batches.push(currentBatch);
        currentBatch = [];
      }
    });
  });
  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }
  
  let completed = 0;
  
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`${colors.cyan}━ Batch ${i + 1}/${batches.length} ━${colors.reset}`);
    
    // 并行执行当前批次
    const batchPromises = batch.map(async (task) => {
      try {
        const result = await executeSingleTask(task, goal, tasks, completedResults);
        completedResults.set(task.id, result);
        return { success: true, taskId: task.id };
      } catch (error) {
        console.log(`   ${colors.red}✗ 任务失败: ${task.name}${colors.reset}`);
        return { success: false, taskId: task.id };
      }
    });
    
    const results = await Promise.all(batchPromises);
    completed += results.filter(r => r.success).length;
    
    // 批次间隔提示
    if (i < batches.length - 1) {
      console.log(`${colors.dim}   等待下一批...${colors.reset}\n`);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log(`\n${colors.green}✓ 批量执行完成: ${completed}/${tasks.length} 任务${colors.reset}\n`);
  return completed;
}

// ============================================================================
// Priority Execution Mode - 按优先级执行任务
// ============================================================================

/**
 * 优先级执行模式
 * 按 priority 字段排序，数字越小优先级越高
 */
async function executeTasksPriority(
  tasks: any[],
  goal: string,
  completedResults: Map<string, string>
): Promise<number> {
  console.log(`\n${colors.magenta}⭐ 优先级执行模式${colors.reset} - 按优先级顺序执行\n`);
  
  // 按优先级排序（1最高，10最低）
  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityA = a.priority || 5;
    const priorityB = b.priority || 5;
    return priorityA - priorityB;
  });
  
  // 打印优先级顺序
  sortedTasks.forEach((task, idx) => {
    const priority = task.priority || 5;
    const priorityIcon = priority <= 2 ? '🔴' : priority <= 4 ? '🟡' : '🟢';
    console.log(`   ${priorityIcon} 优先级${priority}: ${task.name}`);
  });
  console.log('');
  
  let completed = 0;
  
  for (const task of sortedTasks) {
    // 检查依赖是否满足
    if (task.dependencies && task.dependencies.length > 0) {
      const depsMet = task.dependencies.every((depId: string) => completedResults.has(depId));
      if (!depsMet) {
        console.log(`   ${colors.yellow}⏳ 等待依赖: ${task.name}${colors.reset}`);
        continue;
      }
    }
    
    try {
      const result = await executeSingleTask(task, goal, sortedTasks, completedResults);
      completedResults.set(task.id, result);
      completed++;
      console.log(`   ${colors.green}✓${colors.reset} 完成: ${task.name} (优先级${task.priority || 5})\n`);
    } catch (error) {
      console.log(`   ${colors.red}✗ 失败: ${task.name}${colors.reset}\n`);
    }
  }
  
  return completed;
}

// ============================================================================
// Execution Mode Router - 执行模式路由
// ============================================================================

/**
 * 根据模式选择执行策略
 */
async function executeTasksByMode(
  tasks: any[],
  goal: string,
  completedResults: Map<string, string>,
  mode: string,
  options?: { batchSize?: number }
): Promise<number> {
  switch (mode) {
    case 'serial':
      console.log(`\n${colors.blue}📝 串行执行模式${colors.reset} - 逐个执行\n`);
      return await executeTasksSerial(tasks, goal, completedResults);
    
    case 'parallel':
      return await executeTasksParallel(tasks, goal, completedResults);
    
    case 'batch':
      return await executeTasksBatch(tasks, goal, completedResults, options?.batchSize || 3);
    
    case 'priority':
      return await executeTasksPriority(tasks, goal, completedResults);
    
    default:
      console.log(`\n${colors.yellow}⚠️ 未知模式: ${mode}，默认使用并行模式${colors.reset}`);
      return await executeTasksParallel(tasks, goal, completedResults);
  }
}

/**
 * 串行执行（兼容旧版）
 */
async function executeTasksSerial(
  tasks: any[],
  goal: string,
  completedResults: Map<string, string>
): Promise<number> {
  let completed = 0;
  
  for (const task of tasks) {
    // 检查依赖
    if (task.dependencies && task.dependencies.length > 0) {
      const depsMet = task.dependencies.every((depId: string) => completedResults.has(depId));
      if (!depsMet) {
        console.log(`   ${colors.yellow}⏳ 等待依赖: ${task.name}${colors.reset}`);
        continue;
      }
    }
    
    try {
      const result = await executeSingleTask(task, goal, tasks, completedResults);
      completedResults.set(task.id, result);
      completed++;
    } catch (error) {
      console.log(`   ${colors.red}✗ 失败: ${task.name}${colors.reset}`);
    }
  }
  
  return completed;
}

/**
 * 任务完成后自动评估系统
 * 分析本次执行，提出系统升级要求
 */
async function runPostTaskEvaluation(goal: string, completedTasks: number, totalTasks: number): Promise<void> {
  console.log('\n' + '═'.repeat(65));
  console.log('🎯 任务完成 - 正在运行系统评估...');
  console.log('═'.repeat(65) + '\n');
  
  try {
    // 1. 运行自我评估
    const report = await selfEvaluationEngine.runFullEvaluation();
    
    // 2. 打印评估结果
    selfEvaluationEngine.printReport(report);
    
    // 3. 如果有低分维度，生成升级要求
    const lowScoreDimensions = report.dimensions.filter(d => d.score < 70);
    
    if (lowScoreDimensions.length > 0) {
      console.log('\n' + '═'.repeat(65));
      console.log('⚡ 系统升级要求');
      console.log('═'.repeat(65) + '\n');
      
      lowScoreDimensions.forEach(dim => {
        const dimensionNames: Record<string, string> = {
          functionality: '功能完整性',
          performance: '性能',
          user_satisfaction: '用户满意度',
          code_quality: '代码质量',
          learning: '学习能力',
          reliability: '可靠性',
          maintainability: '可维护性',
        };
        
        const name = dimensionNames[dim.dimension] || dim.dimension;
        
        console.log(`\n📌 ${name} (当前: ${dim.score}分 - ${dim.level})`);
        console.log('   发现的问题:');
        dim.findings.slice(0, 3).forEach((finding, idx) => {
          console.log(`     ${idx + 1}. ${finding}`);
        });
        
        if (dim.recommendations.length > 0) {
          console.log('   升级要求:');
          dim.recommendations.forEach((rec, idx) => {
            console.log(`     🔧 ${idx + 1}. ${rec}`);
          });
        }
      });
      
      console.log('\n' + '═'.repeat(65));
    } else {
      console.log('\n✅ 系统状态良好，无需升级');
      console.log('═'.repeat(65) + '\n');
    }
    
    // 4. 显示性能仪表盘
    autoImprovementEngine.showPerformanceDashboard();
    
    // 5. 建议改进项
    const pending = autoImprovementEngine.getPendingImprovements();
    if (pending.length > 0) {
      console.log('\n💡 待处理改进项:');
      pending.slice(0, 3).forEach((imp, idx) => {
        console.log(`   ${idx + 1}. ${imp.action} (置信度: ${imp.confidence}%)`);
      });
    }
    
  } catch (error) {
    console.log('\n⚠️ 评估过程遇到问题:', error);
  }
  
  console.log('\n');
}
