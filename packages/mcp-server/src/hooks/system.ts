/**
 * Genesis Hooks System - 生命周期钩子系统
 * 
 * 借鉴 Oh My OpenCode 的 Hook 设计
 * 提供可扩展的工作流自动化能力
 */

import { contextMonitor, getContextStats, shouldCompact, compactContext, getContextReport } from './context-monitor.js';
import { sessionManager, printSessionStatus, getSessionReport } from './session-manager.js';
import { t, getLocale } from '../i18n/index.js';

// ANSI 颜色定义
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
  bright: '\x1b[1m',
};

/**
 * Hook 触发时机
 */
export type HookTrigger = 'before' | 'after' | 'on_error';

/**
 * Hook 执行阶段
 */
export type HookPhase = 
  | 'initialization'    // 初始化阶段
  | 'analysis'          // 分析阶段
  | 'planning'          // 规划阶段
  | 'execution'         // 执行阶段
  | 'review'            // 审查阶段
  | 'completion';       // 完成阶段

/**
 * Hook 上下文接口
 */
export interface HookContext {
  goal: string;
  phase: HookPhase;
  trigger: HookTrigger;
  data: {
    analysis?: any;
    tasks?: any[];
    completedTasks?: number;
    totalTasks?: number;
    executionData?: any;
    error?: Error;
    [key: string]: any;
  };
  metadata: {
    startTime: number;
    currentTime: number;
    sessionId: string;
    [key: string]: any;
  };
}

/**
 * Hook 函数类型
 */
export type HookHandler = (context: HookContext) => Promise<void> | void;

/**
 * Hook 定义接口
 */
export interface Hook {
  name: string;
  description: string;
  trigger: HookTrigger;
  phase: HookPhase;
  handler: HookHandler;
  enabled: boolean;
  priority: number;  // 优先级，数字越小越先执行
}

/**
 * Hook 注册表
 */
class HookRegistry {
  private hooks: Map<string, Hook> = new Map();
  private enabledHooks: Set<string> = new Set();

  /**
   * 注册 Hook
   */
  register(hook: Hook): void {
    this.hooks.set(hook.name, hook);
    if (hook.enabled) {
      this.enabledHooks.add(hook.name);
    }
  }

  /**
   * 卸载 Hook
   */
  unregister(name: string): void {
    this.hooks.delete(name);
    this.enabledHooks.delete(name);
  }

  /**
   * 启用 Hook
   */
  enable(name: string): void {
    if (this.hooks.has(name)) {
      this.enabledHooks.add(name);
    }
  }

  /**
   * 禁用 Hook
   */
  disable(name: string): void {
    this.enabledHooks.delete(name);
  }

  /**
   * 获取指定阶段和触发时机的 Hooks
   */
  getHooks(phase: HookPhase, trigger: HookTrigger): Hook[] {
    const result: Hook[] = [];
    
    for (const [name, hook] of this.hooks) {
      if (this.enabledHooks.has(name) && 
          hook.phase === phase && 
          hook.trigger === trigger) {
        result.push(hook);
      }
    }
    
    // 按优先级排序
    return result.sort((a, b) => a.priority - b.priority);
  }

  /**
   * 获取所有已注册的 Hooks
   */
  getAllHooks(): Hook[] {
    return Array.from(this.hooks.values());
  }

  /**
   * 获取所有已启用的 Hooks
   */
  getEnabledHooks(): Hook[] {
    return Array.from(this.enabledHooks).map(name => this.hooks.get(name)!).filter(Boolean);
  }

  /**
   * 检查 Hook 是否启用
   */
  isEnabled(name: string): boolean {
    return this.enabledHooks.has(name);
  }
}

/**
 * Hook 执行器
 */
class HookExecutor {
  private registry: HookRegistry;
  private logger: typeof console;

  constructor(logger: typeof console = console) {
    this.registry = new HookRegistry();
    this.logger = logger;
  }

  /**
   * 注册 Hook
   */
  register(hook: Hook): void {
    this.registry.register(hook);
  }

  /**
   * 卸载 Hook
   */
  unregister(name: string): void {
    this.registry.unregister(name);
  }

  /**
   * 启用 Hook
   */
  enable(name: string): void {
    this.registry.enable(name);
  }

  /**
   * 禁用 Hook
   */
  disable(name: string): void {
    this.registry.disable(name);
  }

  /**
   * 执行指定阶段和触发时机的 Hooks
   */
  async execute(
    phase: HookPhase, 
    trigger: HookTrigger, 
    context: HookContext
  ): Promise<void> {
    const hooks = this.registry.getHooks(phase, trigger);
    
    for (const hook of hooks) {
      try {
        this.logger.log(`${colors.dim}[Hook] ${hook.name} (${phase}/${trigger})${colors.reset}`);
        await hook.handler(context);
      } catch (error) {
        this.logger.error(`${colors.red}[Hook Error] ${hook.name}: ${error}${colors.reset}`);
        // 继续执行其他 Hook，不中断流程
      }
    }
  }

  /**
   * 获取 Hook 列表信息
   */
  getInfo(): { total: number; enabled: number; hooks: Hook[] } {
    const all = this.registry.getAllHooks();
    const enabled = this.registry.getEnabledHooks();
    return {
      total: all.length,
      enabled: enabled.length,
      hooks: all,
    };
  }
}

// ============================================================================
// 内置 Hooks
// ============================================================================

/**
 * Todo强制 Hook 持续执行
 * 确保任务不被中断
 */
function createTodoContinuationEnforcer(): Hook {
  return {
    name: 'todo-continuation-enforcer',
    description: '确保任务完成，不允许半途而废',
    trigger: 'after',
    phase: 'review',
    priority: 10,
    enabled: true,
    handler: async (context) => {
      const { data } = context;
      const locale = getLocale();
      if (data.completedTasks !== undefined && data.totalTasks !== undefined) {
        const pending = data.totalTasks - data.completedTasks;
        const warning = locale === 'zh' ? '警告' : 'Warning';
        const pendingTasks = locale === 'zh' ? '还有' : '';
        const tasksRemain = locale === 'zh' ? '个任务未完成' : 'tasks incomplete';
        const trying = locale === 'zh' ? '系统将尝试继续执行这些任务...' : 'System will try to continue...';
        const allDone = locale === 'zh' ? '所有任务已完成!' : 'All tasks completed!';
        
        if (pending > 0) {
          console.log(`${colors.yellow}⚠️ ${warning}: ${pendingTasks} ${pending} ${tasksRemain}${colors.reset}`);
          console.log(`${colors.dim}   ${trying}${colors.reset}`);
        } else {
          console.log(`${colors.green}✅ ${allDone}${colors.reset}`);
        }
      }
    },
  };
}

/**
 * 上下文窗口监控 Hook - 增强版
 */
function createContextWindowMonitor(): Hook {
  return {
    name: 'context-window-monitor',
    description: '监控上下文窗口使用情况，提供智能压缩建议',
    trigger: 'after',
    phase: 'execution',
    priority: 50,
    enabled: true,
    handler: async (context) => {
      const stats = getContextStats();
      const usage = stats.estimatedTotalTokens / 100000;
      
      // 使用新的上下文监控器
      contextMonitor.addUserMessage(context.goal);
      
      if (context.data.tasks) {
        contextMonitor.addAssistantMessage(`任务数: ${context.data.tasks.length}`);
      }
      
      // 显示状态
      contextMonitor.printStatus();
      
      // 如果需要压缩，给出建议
      if (shouldCompact()) {
        console.log(`${colors.yellow}💡 建议运行上下文压缩以避免溢出${colors.reset}`);
        const suggestions = contextMonitor.getCompactionSuggestions();
        suggestions.forEach(s => console.log(`   • ${s}`));
      }
    },
  };
}

/**
 * 执行时间监控 Hook
 */
function createExecutionTimeMonitor(): Hook {
  return {
    name: 'execution-time-monitor',
    description: '监控执行时间，检测过长执行',
    trigger: 'after',
    phase: 'completion',
    priority: 20,
    enabled: true,
    handler: async (context) => {
      const { metadata, data } = context;
      const locale = getLocale();
      const duration = metadata.currentTime - metadata.startTime;
      
      const durationText = locale === 'zh' ? '执行耗时' : 'Execution time';
      const durationSec = locale === 'zh' ? '秒' : 'seconds';
      const warning = locale === 'zh' ? '⚠️ 执行时间超过1分钟，考虑优化' : '⚠️ Execution over 1 minute, consider optimization';
      
      console.log(`${colors.cyan}⏱️ ${durationText}: ${(duration / 1000).toFixed(2)}${durationSec}${colors.reset}`);
      
      if (duration > 60000) {
        console.log(`${colors.yellow}${warning}${colors.reset}`);
      }
    },
  };
}

/**
 * 任务统计 Hook
 */
function createTaskStatistics(): Hook {
  return {
    name: 'task-statistics',
    description: '记录任务执行统计',
    trigger: 'after',
    phase: 'completion',
    priority: 30,
    enabled: true,
    handler: async (context) => {
      const { data } = context;
      const locale = getLocale();
      
      if (data.completedTasks !== undefined && data.totalTasks !== undefined) {
        const successRate = ((data.completedTasks / data.totalTasks) * 100).toFixed(1);
        const statText = locale === 'zh' ? '任务完成率' : 'Task completion rate';
        console.log(`${colors.cyan}📊 ${statText}: ${successRate}%${colors.reset}`);
      }
    },
  };
}

/**
 * 预压缩 Hook - 借鉴 Oh My OpenCode
 * 在上下文达到 85% 阈值前主动压缩
 */
function createPreemptiveCompactionHook(): Hook {
  return {
    name: 'preemptive-compaction',
    description: '在上下文达到阈值前主动压缩，避免溢出',
    trigger: 'after',
    phase: 'execution',
    priority: 40,  // 在 context-window-monitor 之前执行
    enabled: true,
    handler: async (context) => {
      // 检查是否需要压缩
      if (shouldCompact()) {
        console.log(`${colors.yellow}⚠️ 上下文使用率过高，尝试自动压缩...${colors.reset}`);
        
        const result = compactContext();
        
        console.log(`${colors.green}✅ 压缩完成: 释放了 ~${result.freedTokens} tokens${colors.reset}`);
        
        // 打印压缩后的状态
        contextMonitor.printStatus();
      }
    },
  };
}

/**
 * 工具输出截断 Hook
 */
function createToolOutputTruncatorHook(): Hook {
  return {
    name: 'tool-output-truncator',
    description: '截断过大的工具输出以节省上下文空间',
    trigger: 'after',
    phase: 'execution',
    priority: 60,
    enabled: true,
    handler: async (context) => {
      const stats = getContextStats();
      
      // 如果工具调用太多，给出警告
      if (stats.toolCallCount > 50) {
        console.log(`${colors.yellow}⚠️ 工具调用较多 (${stats.toolCallCount})${colors.reset}`);
        console.log(`${colors.dim}   建议: 考虑合并工具调用或使用批量操作${colors.reset}`);
      }
    },
  };
}

/**
 * 错误处理 Hook
 */
function createErrorHandler(): Hook {
  return {
    name: 'error-handler',
    description: '处理执行过程中的错误',
    trigger: 'on_error',
    phase: 'execution',
    priority: 1,  // 最高优先级
    enabled: true,
    handler: async (context) => {
      const { data } = context;
      if (data.error) {
        console.log(`${colors.red}🚨 执行出错: ${data.error.message}${colors.reset}`);
        console.log(`${colors.dim}   错误详情: ${data.error.stack}${colors.reset}`);
        
        // 记录错误到会话
        sessionManager.recordError(data.error.message, data.error.stack);
      }
    },
  };
}

/**
 * 会话创建 Hook
 */
function createSessionHook(): Hook {
  return {
    name: 'session-manager',
    description: '会话创建和管理',
    trigger: 'before',
    phase: 'initialization',
    priority: 5,
    enabled: true,
    handler: async (context) => {
      // 创建新会话
      sessionManager.createSession(context.goal, 'initialization');
      sessionManager.createCheckpoint('init', '系统初始化');
    },
  };
}

/**
 * 会话恢复 Hook
 */
function createSessionRecoveryHook(): Hook {
  return {
    name: 'session-recovery',
    description: '会话恢复 - 从中断中恢复',
    trigger: 'before',
    phase: 'initialization',
    priority: 10,
    enabled: true,
    handler: async (context) => {
      const locale = getLocale();
      const foundInter = locale === 'zh' ? '发现中断的会话' : 'Found interrupted session';
      const recovered = locale === 'zh' ? '已恢复会话，可继续执行' : 'Session recovered, can continue';
      
      // 检查是否有可恢复的会话
      const recentSessions = sessionManager.getRecentSessions(3);
      const interrupted = recentSessions.find(s => s.status === 'interrupted');
      
      if (interrupted) {
        console.log(`${colors.yellow}📂 ${foundInter}: ${interrupted.id}${colors.reset}`);
        const recoveredSession = sessionManager.recoverSession(interrupted.id);
        
        if (recoveredSession) {
          console.log(`${colors.green}✅ ${recovered}${colors.reset}`);
          console.log(getSessionReport());
        }
      }
    },
  };
}

/**
 * 会话进度跟踪 Hook
 */
function createProgressTrackingHook(): Hook {
  return {
    name: 'progress-tracking',
    description: '跟踪任务执行进度',
    trigger: 'after',
    phase: 'planning',
    priority: 20,
    enabled: true,
    handler: async (context) => {
      if (context.data.tasks) {
        sessionManager.updateProgress(context.data.tasks.length, 0);
        sessionManager.createCheckpoint('planning', `规划完成: ${context.data.tasks.length} 个任务`);
      }
    },
  };
}

/**
 * 会话状态显示 Hook
 */
function createSessionStatusHook(): Hook {
  return {
    name: 'session-status',
    description: '显示会话状态',
    trigger: 'after',
    phase: 'execution',
    priority: 100,
    enabled: true,
    handler: async (context) => {
      if (context.data.completedTasks !== undefined && context.data.totalTasks !== undefined) {
        sessionManager.updateProgress(context.data.totalTasks, context.data.completedTasks);
        sessionManager.printStatus();
      }
    },
  };
}

/**
 * 会话完成 Hook
 */
function createSessionCompletionHook(): Hook {
  return {
    name: 'session-completion',
    description: '会话完成处理',
    trigger: 'after',
    phase: 'completion',
    priority: 10,
    enabled: true,
    handler: async (context) => {
      const session = sessionManager.getCurrentSession();
      const locale = getLocale();
      if (session) {
        const success = context.data.executionData?.success;
        const interruptMsg = locale === 'zh' ? '执行未完全成功' : 'Execution not fully successful';
        
        if (success) {
          sessionManager.completeSession();
        } else {
          sessionManager.interruptSession(interruptMsg);
        }
        
        console.log(getSessionReport());
      }
    },
  };
}

/**
 * 初始化 Hook
 */
function createInitializationHook(): Hook {
  return {
    name: 'initialization',
    description: '系统初始化',
    trigger: 'before',
    phase: 'initialization',
    priority: 1,
    enabled: true,
    handler: async (context) => {
      const locale = getLocale();
      const title = locale === 'zh' ? 'Genesis Hooks 系统初始化' : 'Genesis Hooks System Initialization';
      console.log(`${colors.cyan}🚀 ${title}${colors.reset}`);
      console.log(`${colors.dim}   ${locale === 'zh' ? '目标' : 'Goal'}: ${context.goal}${colors.reset}`);
    },
  };
}

/**
 * 分析阶段完成 Hook
 */
function createAnalysisCompleteHook(): Hook {
  return {
    name: 'analysis-complete',
    description: '分析阶段完成通知',
    trigger: 'after',
    phase: 'analysis',
    priority: 10,
    enabled: true,
    handler: async (context) => {
      const { data } = context;
      const locale = getLocale();
      if (data.analysis) {
        const completed = locale === 'zh' ? '分析完成' : 'Analysis complete';
        const domain = locale === 'zh' ? '领域' : 'Domain';
        const complexity = locale === 'zh' ? '复杂度' : 'Complexity';
        console.log(`${colors.green}✅ ${completed}${colors.reset}`);
        console.log(`${colors.dim}   ${domain}: ${data.analysis.domain}, ${complexity}: ${data.analysis.complexity}${colors.reset}`);
      }
    },
  };
}

/**
 * 规划阶段完成 Hook
 */
function createPlanningCompleteHook(): Hook {
  return {
    name: 'planning-complete',
    description: '规划阶段完成通知',
    trigger: 'after',
    phase: 'planning',
    priority: 10,
    enabled: true,
    handler: async (context) => {
      const { data } = context;
      const locale = getLocale();
      if (data.tasks) {
        const completed = locale === 'zh' ? '规划完成' : 'Planning complete';
        const tasks = locale === 'zh' ? '个任务' : 'tasks';
        console.log(`${colors.green}✅ ${completed}: ${data.tasks.length} ${tasks}${colors.reset}`);
      }
    },
  };
}

/**
 * 执行阶段完成 Hook
 */
function createExecutionCompleteHook(): Hook {
  return {
    name: 'execution-complete',
    description: '执行阶段完成通知',
    trigger: 'after',
    phase: 'execution',
    priority: 10,
    enabled: true,
    handler: async (context) => {
      const { data } = context;
      if (data.completedTasks !== undefined) {
        console.log(`${colors.green}✅ 执行完成: ${data.completedTasks} 个任务${colors.reset}`);
      }
    },
  };
}

/**
 * 创建完整的 Hooks 系统实例
 */
export function createHooksSystem(): HookExecutor {
  const executor = new HookExecutor();
  
  // 注册所有内置 Hooks
  executor.register(createInitializationHook());
  executor.register(createTodoContinuationEnforcer());
  executor.register(createPreemptiveCompactionHook());  // 新增: 预压缩
  executor.register(createContextWindowMonitor());     // 增强: 上下文监控
  executor.register(createToolOutputTruncatorHook());  // 新增: 工具输出截断
  executor.register(createExecutionTimeMonitor());
  executor.register(createTaskStatistics());
  executor.register(createErrorHandler());
  executor.register(createAnalysisCompleteHook());
  executor.register(createPlanningCompleteHook());
  executor.register(createExecutionCompleteHook());
  
  // 注册会话管理 Hooks
  executor.register(createSessionHook());
  executor.register(createSessionRecoveryHook());
  executor.register(createProgressTrackingHook());
  executor.register(createSessionStatusHook());
  executor.register(createSessionCompletionHook());
  
  return executor;
}

/**
 * 默认 Hooks 系统实例
 */
export const hooksSystem = createHooksSystem();

// ============================================================================
// 便捷函数
// ============================================================================

/**
 * 创建自定义 Hook 的便捷函数
 */
export function createHook(
  name: string,
  description: string,
  phase: HookPhase,
  trigger: HookTrigger,
  handler: HookHandler,
  options?: { priority?: number; enabled?: boolean }
): Hook {
  return {
    name,
    description,
    phase,
    trigger,
    handler,
    priority: options?.priority ?? 100,
    enabled: options?.enabled ?? true,
  };
}

/**
 * 注册自定义 Hook
 */
export function registerHook(hook: Hook): void {
  hooksSystem.register(hook);
}

/**
 * 禁用 Hook
 */
export function disableHook(name: string): void {
  hooksSystem.disable(name);
}

/**
 * 启用 Hook
 */
export function enableHook(name: string): void {
  hooksSystem.enable(name);
}

/**
 * 获取 Hooks 信息
 */
export function getHooksInfo() {
  return hooksSystem.getInfo();
}
