/**
 * Genesis Hooks System - 生命周期钩子系统
 * 
 * 借鉴 Oh My OpenCode 的 Hook 设计
 * 提供可扩展的工作流自动化能力
 */

// ANSI 颜色定义
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
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
      if (data.completedTasks !== undefined && data.totalTasks !== undefined) {
        const pending = data.totalTasks - data.completedTasks;
        if (pending > 0) {
          console.log(`${colors.yellow}⚠️ 警告: 还有 ${pending} 个任务未完成${colors.reset}`);
          console.log(`${colors.dim}   系统将尝试继续执行这些任务...${colors.reset}`);
        } else {
          console.log(`${colors.green}✅ 所有任务已完成!${colors.reset}`);
        }
      }
    },
  };
}

/**
 * 上下文窗口监控 Hook
 */
function createContextWindowMonitor(): Hook {
  return {
    name: 'context-window-monitor',
    description: '监控上下文窗口使用情况',
    trigger: 'after',
    phase: 'execution',
    priority: 50,
    enabled: true,
    handler: async (context) => {
      const { metadata } = context;
      const elapsed = metadata.currentTime - metadata.startTime;
      
      // 估算上下文使用（简单估算）
      const estimatedTokens = Math.floor(elapsed / 100) * 50; // 粗略估算
      
      if (estimatedTokens > 50000) {
        console.log(`${colors.yellow}⚠️ 上下文使用较高，建议保存进度${colors.reset}`);
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
      const duration = metadata.currentTime - metadata.startTime;
      
      console.log(`${colors.cyan}⏱️ 执行耗时: ${(duration / 1000).toFixed(2)}秒${colors.reset}`);
      
      if (duration > 60000) {
        console.log(`${colors.yellow}⚠️ 执行时间超过1分钟，考虑优化${colors.reset}`);
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
      
      if (data.completedTasks !== undefined && data.totalTasks !== undefined) {
        const successRate = ((data.completedTasks / data.totalTasks) * 100).toFixed(1);
        console.log(`${colors.cyan}📊 任务完成率: ${successRate}%${colors.reset}`);
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
      console.log(`${colors.cyan}🚀 Genesis Hooks 系统初始化${colors.reset}`);
      console.log(`${colors.dim}   目标: ${context.goal}${colors.reset}`);
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
      if (data.analysis) {
        console.log(`${colors.green}✅ 分析完成${colors.reset}`);
        console.log(`${colors.dim}   领域: ${data.analysis.domain}, 复杂度: ${data.analysis.complexity}${colors.reset}`);
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
      if (data.tasks) {
        console.log(`${colors.green}✅ 规划完成: ${data.tasks.length} 个任务${colors.reset}`);
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
  executor.register(createContextWindowMonitor());
  executor.register(createExecutionTimeMonitor());
  executor.register(createTaskStatistics());
  executor.register(createErrorHandler());
  executor.register(createAnalysisCompleteHook());
  executor.register(createPlanningCompleteHook());
  executor.register(createExecutionCompleteHook());
  
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
