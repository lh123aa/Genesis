/**
 * Genesis 思维模式系统
 * 
 * 整合高级AI Agent思维模式:
 * - Chain of Thought (CoT): 思维链
 * - ReAct: 推理+行动
 * - Reflexion: 自我反思
 * - Plan-and-Execute: 计划-执行分离
 * - MIRROR: 内部反思+跨代理反思
 * 
 * 特性:
 * - Agent 专属颜色
 * - 中英文支持
 * - 独立思考过程显示
 */

import { t, getLocale, setLocale, toggleLocale, type Locale } from '../i18n/index.js';

/**
 * 思维模式类型
 */
export type ThinkingMode = 
  | 'direct'        // 直接执行（默认）
  | 'cot'           // Chain of Thought
  | 'react'         // ReAct: Reason + Act
  | 'reflexion'     // Reflexion: 自我反思
  | 'plan_execute'  // Plan-and-Execute
  | 'mirror';       // MIRROR: 内部+跨代理反思

/**
 * Agent 类型
 */
export type AgentType = 
  | 'scout' 
  | 'coder' 
  | 'tester' 
  | 'reviewer' 
  | 'docs'
  | 'librarian'
  | 'oracle'
  | 'builder'
  | 'optimizer'
  | 'integrator';

/**
 * Agent 颜色配置
 */
export const AGENT_COLORS: Record<AgentType, {
  color: string;
  bg: string;
  border: string;
  gradient: string;
}> = {
  scout: {
    color: '\x1b[38;2;0;212;255m',      // Cyan #00d4ff
    bg: '\x1b[48;2;0;212;255m',
    border: '─',
    gradient: '\x1b[38;2;0;212;255m',
  },
  coder: {
    color: '\x1b[38;2;16;185;129m',    // Green #10b981
    bg: '\x1b[48;2;16;185;129m',
    border: '─',
    gradient: '\x1b[38;2;16;185;129m',
  },
  tester: {
    color: '\x1b[38;2;59;130;246m',    // Blue #3b82f6
    bg: '\x1b[48;2;59;130;246m',
    border: '─',
    gradient: '\x1b[38;2;59;130;246m',
  },
  reviewer: {
    color: '\x1b[38;2;245;158;11m',    // Yellow #f59e0b
    bg: '\x1b[48;2;245;158;11m',
    border: '─',
    gradient: '\x1b[38;2;245;158;11m',
  },
  docs: {
    color: '\x1b[38;2;139;92;246m',     // Purple #8b5cf6
    bg: '\x1b[48;2;139;92;246m',
    border: '─',
    gradient: '\x1b[38;2;139;92;246m',
  },
  librarian: {
    color: '\x1b[38;2;168;85;247m',    // Indigo #a855f7
    bg: '\x1b[48;2;168;85;247m',
    border: '─',
    gradient: '\x1b[38;2;168;85;247m',
  },
  oracle: {
    color: '\x1b[38;2;234;179;8m',      // Yellow #eab308
    bg: '\x1b[48;2;234;179;8m',
    border: '─',
    gradient: '\x1b[38;2;234;179;8m',
  },
  builder: {
    color: '\x1b[38;2;249;115;22m',    // Orange #f97316
    bg: '\x1b[48;2;249;115;22m',
    border: '─',
    gradient: '\x1b[38;2;249;115;22m',
  },
  optimizer: {
    color: '\x1b[38;2;239;68;68m',     // Red #ef4444
    bg: '\x1b[48;2;239;68;68m',
    border: '─',
    gradient: '\x1b[38;2;239;68;68m',
  },
  integrator: {
    color: '\x1b[38;2;20;184;166m',    // Teal #14b8a6
    bg: '\x1b[48;2;20;184;166m',
    border: '─',
    gradient: '\x1b[38;2;20;184;166m',
  },
};

/**
 * Agent Emoji 配置
 */
export const AGENT_EMOJIS: Record<AgentType, string> = {
  scout: '🔍',
  coder: '💻',
  tester: '🧪',
  reviewer: '👀',
  docs: '📝',
  librarian: '📚',
  oracle: '🔮',
  builder: '🏗️',
  optimizer: '⚡',
  integrator: '🔗',
};

/**
 * 思维步骤
 */
export interface ThoughtStep {
  type: 'reasoning' | 'action' | 'observation' | 'reflection' | 'correction' | 'planning';
  content: string;
  timestamp: number;
  agent?: AgentType;
}

/**
 * 思维上下文
 */
export interface ThinkingContext {
  goal: string;
  mode: ThinkingMode;
  agent?: AgentType;
  steps: ThoughtStep[];
  currentPlan?: string[];
  reflections: string[];
  corrections: string[];
}

/**
 * 思维模式配置 (支持中英文)
 */
const getModeConfig = (locale: Locale) => ({
  direct: {
    name: locale === 'zh' ? '直接执行' : 'Direct',
    emoji: '⚡',
    description: locale === 'zh' ? '直接执行任务，无显式推理' : 'Direct execution without explicit reasoning',
  },
  cot: {
    name: locale === 'zh' ? '思维链' : 'Chain of Thought',
    emoji: '🔗',
    description: locale === 'zh' ? '逐步推理，每步都有清晰的逻辑链' : 'Step-by-step reasoning with clear logic',
  },
  react: {
    name: locale === 'zh' ? '推理-行动' : 'ReAct',
    emoji: '🔄',
    description: locale === 'zh' ? 'Reason + Act: 推理决定行动，行动产生观察' : 'Reason decides action, action produces observation',
  },
  reflexion: {
    name: locale === 'zh' ? '自我反思' : 'Reflexion',
    emoji: '🪞',
    description: locale === 'zh' ? '执行后反思，识别错误，自我纠错' : 'Reflect after execution, identify errors, self-correct',
  },
  plan_execute: {
    name: locale === 'zh' ? '计划-执行' : 'Plan-and-Execute',
    emoji: '📋',
    description: locale === 'zh' ? '先制定完整计划，再执行' : 'Create full plan first, then execute',
  },
  mirror: {
    name: locale === 'zh' ? 'MIRROR双反思' : 'MIRROR',
    emoji: '🔮',
    description: locale === 'zh' ? '内部反思(执行前)+跨代理反思(执行后)' : 'Intra-reflection (before) + Inter-reflection (after)',
  },
});

/**
 * 获取 Agent 显示名称
 */
export function getAgentDisplayName(agentType: AgentType | string): string {
  const locale = getLocale();
  const key = agentType.toLowerCase() as AgentType;
  const emoji = AGENT_EMOJIS[key] || '🤖';
  
  if (locale === 'zh') {
    const names: Record<AgentType, string> = {
      scout: '侦察员',
      coder: '程序员',
      tester: '测试员',
      reviewer: '评审员',
      docs: '文档员',
      librarian: '图书管理员',
      oracle: '预言家',
      builder: '建筑师',
      optimizer: '优化师',
      integrator: '集成员',
    };
    return `${emoji} 【${names[key] || agentType}】`;
  } else {
    const names: Record<AgentType, string> = {
      scout: 'Scout',
      coder: 'Coder',
      tester: 'Tester',
      reviewer: 'Reviewer',
      docs: 'Docs',
      librarian: 'Librarian',
      oracle: 'Oracle',
      builder: 'Builder',
      optimizer: 'Optimizer',
      integrator: 'Integrator',
    };
    return `${emoji} [${names[key] || agentType}]`;
  }
}

/**
 * 获取 Agent 颜色
 */
export function getAgentColor(agentType: AgentType | string): string {
  const key = agentType.toLowerCase() as AgentType;
  return AGENT_COLORS[key]?.color || '\x1b[37m';
}

/**
 * 思维引擎
 */
export class ThinkingEngine {
  private context: ThinkingContext | null = null;
  private history: ThinkingContext[] = [];
  private currentAgent: AgentType | undefined = undefined;
  
  /**
   * 开始思维过程
   */
  startThinking(goal: string, mode: ThinkingMode = 'react', agent?: AgentType): ThinkingContext {
    this.currentAgent = agent;
    this.context = {
      goal,
      mode,
      agent,
      steps: [],
      reflections: [],
      corrections: [],
    };
    
    const locale = getLocale();
    const modeCfg = getModeConfig(locale)[mode];
    
    this.logStep('reasoning', `🎯 ${locale === 'zh' ? '目标' : 'Goal'}: ${goal}`);
    this.logStep('planning', `🧠 ${locale === 'zh' ? '思维模式' : 'Mode'}: ${modeCfg.name}`);
    
    return this.context;
  }
  
  /**
   * 设置当前 Agent
   */
  setAgent(agent: AgentType): void {
    this.currentAgent = agent;
    if (this.context) {
      this.context.agent = agent;
    }
  }
  
  /**
   * 记录思维步骤
   */
  logStep(type: ThoughtStep['type'], content: string, agent?: AgentType): void {
    if (!this.context) return;
    
    const step: ThoughtStep = {
      type,
      content,
      timestamp: Date.now(),
      agent: agent || this.currentAgent,
    };
    
    this.context.steps.push(step);
    
    if (type === 'reflection') {
      this.context.reflections.push(content);
    } else if (type === 'correction') {
      this.context.corrections.push(content);
    }
  }
  
  /**
   * 推理步骤
   */
  reason(content: string): void {
    this.logStep('reasoning', `💭 ${content}`);
  }
  
  /**
   * 行动步骤
   */
  act(content: string): void {
    this.logStep('action', `🎬 ${content}`);
  }
  
  /**
   * 观察步骤
   */
  observe(content: string): void {
    this.logStep('observation', `👁️ ${content}`);
  }
  
  /**
   * 反思步骤
   */
  reflect(content: string): void {
    const locale = getLocale();
    const prefix = locale === 'zh' ? '反思' : 'Reflection';
    this.logStep('reflection', `🪞 ${prefix}: ${content}`);
  }
  
  /**
   * 纠错步骤
   */
  correct(content: string): void {
    const locale = getLocale();
    const prefix = locale === 'zh' ? '纠错' : 'Correction';
    this.logStep('correction', `🔧 ${prefix}: ${content}`);
  }
  
  /**
   * 计划步骤
   */
  plan(steps: string[]): void {
    if (!this.context) return;
    const locale = getLocale();
    const prefix = locale === 'zh' ? '计划' : 'Plan';
    this.context.currentPlan = steps;
    this.logStep('planning', `📝 ${prefix}: ${steps.join(' → ')}`);
  }
  
  /**
   * 执行前内部反思 (MIRROR)
   */
  intraReflect(action: string): string {
    const locale = getLocale();
    const assessment = locale === 'zh' 
      ? `评估行动 "${action}": 看起来合理，建议执行`
      : `Evaluating action "${action}": Looks reasonable, suggest proceeding`;
    this.logStep('reflection', `🔍 ${locale === 'zh' ? '内部反思' : 'Intra-reflect'}: ${assessment}`);
    return assessment;
  }
  
  /**
   * 执行后跨代理反思 (MIRROR)
   */
  interReflect(result: string, success: boolean): void {
    const locale = getLocale();
    if (success) {
      this.reflect(`${locale === 'zh' ? '成功' : 'Success'}: ${result}`);
    } else {
      this.reflect(`${locale === 'zh' ? '失败' : 'Failure'}: ${result}`);
      this.correct(locale === 'zh' ? '需要调整策略' : 'Need to adjust strategy');
    }
  }
  
  /**
   * 获取当前上下文
   */
  getContext(): ThinkingContext | null {
    return this.context;
  }
  
  /**
   * 获取思维历史
   */
  getHistory(): ThinkingContext[] {
    return this.history;
  }
  
  /**
   * 结束思维过程
   */
  endThinking(): ThinkingContext | null {
    if (!this.context) return null;
    
    // 保存到历史
    this.history.push({ ...this.context });
    
    const result = { ...this.context };
    this.context = null;
    this.currentAgent = undefined;
    
    return result;
  }
  
  /**
   * 获取思维模式配置
   */
  getModeConfig(mode: ThinkingMode) {
    const locale = getLocale();
    return getModeConfig(locale)[mode];
  }
  
  /**
   * 获取所有可用模式
   */
  getAvailableModes(): string[] {
    const locale = getLocale();
    const modes = getModeConfig(locale);
    return Object.entries(modes).map(([key, value]) => 
      `${value.emoji} ${value.name}: ${value.description}`
    );
  }
  
  /**
   * 打印思维过程 - Agent 专属颜色和独立显示
   */
  printThinking(agentColor?: string): void {
    if (!this.context) return;
    
    const locale = getLocale();
    const config = getModeConfig(locale)[this.context.mode];
    const agent = this.context.agent;
    
    // 使用 Agent 专属颜色，如果没有则使用默认青色
    const color = agent ? getAgentColor(agent) : (agentColor || '\x1b[36m');
    const reset = '\x1b[0m';
    const bright = '\x1b[1m';
    
    // Agent 专属边框字符
    const width = 58;
    
    // 打印带 Agent 颜色的头部
    console.log(`\n${color}${'═'.repeat(width)}${reset}`);
    console.log(`${color}║${reset}  ${color}${bright}${config.emoji} ${agent ? getAgentDisplayName(agent) : ''} ${locale === 'zh' ? '思维过程' : 'Thinking'}${color} ${' '.repeat(Math.max(0, width - 20 - (agent ? getAgentDisplayName(agent).length : 0)))}║${reset}`);
    console.log(`${color}║${reset}  ${color}${config.name}${reset}                                              ${color}║${reset}`);
    console.log(`${color}${'═'.repeat(width)}${reset}`);
    
    // 打印每个步骤
    this.context.steps.forEach((step, idx) => {
      const iconMap: Record<string, string> = {
        reasoning: '💭',
        action: '🎬',
        observation: '👁️',
        reflection: '🪞',
        correction: '🔧',
        planning: '📝',
      };
      const icon = iconMap[step.type] || '•';
      
      // 根据步骤类型选择颜色
      const stepColor = step.type === 'reflection' ? '\x1b[33m' : 
                       step.type === 'correction' ? '\x1b[31m' :
                       step.type === 'action' ? '\x1b[32m' : color;
      
      console.log(`${color}│${reset}  ${stepColor}${icon}${reset} ${step.content}`);
    });
    
    // 打印反思总结
    if (this.context.reflections.length > 0) {
      const summaryTitle = locale === 'zh' ? '📊 反思总结' : '📊 Reflection Summary';
      console.log(`${color}├${reset}  ${color}${bright}${summaryTitle}${reset}`);
      this.context.reflections.forEach(r => {
        console.log(`${color}│${reset}     ${color}•${reset} ${r}`);
      });
    }
    
    console.log(`${color}${'═'.repeat(width)}${reset}\n`);
  }
  
  /**
   * 打印带 Agent 信息的思维过程
   */
  printAgentThinking(agentType: AgentType): void {
    this.printThinking(getAgentColor(agentType));
  }
}

// 导出单例
export const thinkingEngine = new ThinkingEngine();

export default ThinkingEngine;
