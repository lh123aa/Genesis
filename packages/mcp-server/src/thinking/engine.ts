/**
 * Genesis 思维模式系统
 * 
 * 整合高级AI Agent思维模式:
 * - Chain of Thought (CoT): 思维链
 * - ReAct: 推理+行动
 * - Reflexion: 自我反思
 * - Plan-and-Execute: 计划-执行分离
 * - MIRROR: 内部反思+跨代理反思
 */

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
 * 思维步骤
 */
export interface ThoughtStep {
  type: 'reasoning' | 'action' | 'observation' | 'reflection' | 'correction' | 'planning';
  content: string;
  timestamp: number;
  agent?: string;
}

/**
 * 思维上下文
 */
export interface ThinkingContext {
  goal: string;
  mode: ThinkingMode;
  steps: ThoughtStep[];
  currentPlan?: string[];
  reflections: string[];
  corrections: string[];
}

/**
 * 思维模式配置
 */
const modeConfig = {
  direct: {
    name: '直接执行',
    emoji: '⚡',
    description: '直接执行任务，无显式推理',
  },
  cot: {
    name: '思维链',
    emoji: '🔗',
    description: '逐步推理，每步都有清晰的逻辑链',
  },
  react: {
    name: '推理-行动',
    emoji: '🔄',
    description: 'Reason + Act: 推理决定行动，行动产生观察',
  },
  reflexion: {
    name: '自我反思',
    emoji: '🪞',
    description: '执行后反思，识别错误，自我纠错',
  },
  plan_execute: {
    name: '计划-执行',
    emoji: '📋',
    description: '先制定完整计划，再执行',
  },
  mirror: {
    name: 'MIRROR双反思',
    emoji: '🔮',
    description: '内部反思(执行前)+跨代理反思(执行后)',
  },
};

/**
 * 思维引擎
 */
export class ThinkingEngine {
  private context: ThinkingContext | null = null;
  private history: ThinkingContext[] = [];
  
  /**
   * 开始思维过程
   */
  startThinking(goal: string, mode: ThinkingMode = 'react'): ThinkingContext {
    this.context = {
      goal,
      mode,
      steps: [],
      reflections: [],
      corrections: [],
    };
    
    this.logStep('reasoning', `🎯 目标: ${goal}`);
    this.logStep('planning', `🧠 思维模式: ${modeConfig[mode].name}`);
    
    return this.context;
  }
  
  /**
   * 记录思维步骤
   */
  logStep(type: ThoughtStep['type'], content: string, agent?: string): void {
    if (!this.context) return;
    
    const step: ThoughtStep = {
      type,
      content,
      timestamp: Date.now(),
      agent,
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
    this.logStep('reflection', `🪞 反思: ${content}`);
  }
  
  /**
   * 纠错步骤
   */
  correct(content: string): void {
    this.logStep('correction', `🔧 纠错: ${content}`);
  }
  
  /**
   * 计划步骤
   */
  plan(steps: string[]): void {
    if (!this.context) return;
    this.context.currentPlan = steps;
    this.logStep('planning', `📝 计划: ${steps.join(' → ')}`);
  }
  
  /**
   * 执行前内部反思 (MIRROR)
   */
  intraReflect(action: string): string {
    const questions = [
      '这个行动是否正确?',
      '是否有更好的方式?',
      '可能出错的地方在哪里?',
    ];
    
    // 简单的自我评估
    const assessment = `评估行动 "${action}": 看起来合理，建议执行`;
    this.logStep('reflection', `🔍 内部反思: ${assessment}`);
    
    return assessment;
  }
  
  /**
   * 执行后跨代理反思 (MIRROR)
   */
  interReflect(result: string, success: boolean): void {
    if (success) {
      this.reflect(`✅ 成功: ${result}`);
    } else {
      this.reflect(`❌ 失败: ${result}`);
      this.correct('需要调整策略');
    }
  }
  
  /**
   * ReAct 循环
   */
  async reactLoop(
    maxIterations: number = 5,
    executeAction: (reasoning: string) => Promise<{ observation: string; success: boolean }>
  ): Promise<boolean> {
    for (let i = 0; i < maxIterations; i++) {
      // 1. Reason
      this.reason(`🔄 迭代 ${i + 1}/${maxIterations}`);
      
      // 2. Act (执行动作)
      const reasoning = this.context?.steps.map(s => s.content).join(' | ') || '';
      const action = await executeAction(reasoning);
      
      // 3. Observe
      this.observe(action.observation);
      
      // 4. Reflexion (反思)
      if (action.success) {
        this.reflect('行动成功，目标达成或接近达成');
        return true;
      } else {
        this.reflect('行动未达预期，需要调整');
        this.correct('调整策略后重试');
      }
    }
    
    this.reflect('达到最大迭代次数');
    return false;
  }
  
  /**
   * Plan-and-Execute 模式
   */
  async planAndExecute(
    executeStep: (step: string) => Promise<{ result: string; success: boolean }>
  ): Promise<boolean> {
    if (!this.context?.currentPlan) {
      this.logStep('reasoning', '❌ 没有计划');
      return false;
    }
    
    for (let i = 0; i < this.context.currentPlan.length; i++) {
      const step = this.context.currentPlan[i];
      this.act(`执行步骤 ${i + 1}/${this.context.currentPlan.length}: ${step}`);
      
      // 内部反思 (MIRROR) - 执行前
      this.intraReflect(step);
      
      const result = await executeStep(step);
      this.observe(result.result);
      
      // 外部反思 - 执行后
      if (!result.success) {
        this.interReflect(result.result, false);
        return false;
      }
    }
    
    this.reflect('所有步骤执行完成');
    return true;
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
    
    return result;
  }
  
  /**
   * 获取思维模式配置
   */
  getModeConfig(mode: ThinkingMode) {
    return modeConfig[mode];
  }
  
  /**
   * 获取所有可用模式
   */
  getAvailableModes(): string[] {
    return Object.entries(modeConfig).map(([key, value]) => 
      `${value.emoji} ${value.name}: ${value.description}`
    );
  }
  
  /**
   * 打印思维过程
   */
  printThinking(): void {
    if (!this.context) return;
    
    const config = modeConfig[this.context.mode];
    
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`${config.emoji} 思维过程 - ${config.name}`);
    console.log('═'.repeat(60));
    
    this.context.steps.forEach((step, idx) => {
      const icon = {
        reasoning: '💭',
        action: '🎬',
        observation: '👁️',
        reflection: '🪞',
        correction: '🔧',
        planning: '📝',
      }[step.type];
      
      console.log(`  ${idx + 1}. ${icon} ${step.content}`);
    });
    
    if (this.context.reflections.length > 0) {
      console.log(`\n  📊 反思总结:`);
      this.context.reflections.forEach(r => console.log(`     • ${r}`));
    }
    
    console.log('═'.repeat(60) + '\n');
  }
}

// 导出单例
export const thinkingEngine = new ThinkingEngine();

export default ThinkingEngine;
