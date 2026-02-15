/**
 * Requirement Gatherer
 * 
 * 需求收集器 - 在执行任务前先搞清楚用户需求
 * 1. 使用分布式提问收集关键信息
 * 2. 复述需求让用户确认
 * 3. 得到确认后才执行
 * 4. 用户修改需求则重复上述步骤
 */

import { plannerAgent, type TaskAnalysis } from './planner.js';
import { deepAnalyze, detectDangerousOperations, generateSuggestions } from './enhanced-planner.js';

/**
 * 需求确认状态
 */
export type RequirementStatus = 'pending' | 'clarifying' | 'confirmed' | 'modifying' | 'executing' | 'completed';

/**
 * 澄清问题
 */
export interface ClarifyingQuestion {
  id: string;
  category: 'scope' | 'context' | 'constraint' | 'preference' | 'quality' | 'other';
  question: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
  options?: string[]; // 如果有预设选项
  userAnswer?: string;
}

/**
 * 需求摘要
 */
export interface RequirementSummary {
  originalGoal: string;
  understoodGoal: string;
  domain: TaskAnalysis['domain'];
  complexity: TaskAnalysis['complexity'];
  scope: string;
  constraints: string[];
  preferences: string[];
  expectedDeliverables: string;
  qualityRequirements: string;
  risks: string;
  questions: ClarifyingQuestion[];
  answeredQuestions: number;
  totalQuestions: number;
  status: RequirementStatus;
}

/**
 * 分布式提问模板
 */
const QUESTION_TEMPLATES: Record<string, ClarifyingQuestion[]> = {
  // 研究类任务
  research: [
    {
      id: 'q1',
      category: 'scope',
      question: '研究的具体范围是什么？需要覆盖哪些方面？',
      importance: 'critical',
    },
    {
      id: 'q2',
      category: 'context',
      question: '这项研究的目的是什么？用于什么场景？',
      importance: 'high',
    },
    {
      id: 'q3',
      category: 'quality',
      question: '需要多深入的分析？简单概述还是详细报告？',
      importance: 'high',
      options: ['简单概述', '中等详细', '详细报告', '深度分析'],
    },
    {
      id: 'q4',
      category: 'preference',
      question: '数据来源有偏好吗？优先官方数据、行业报告还是学术论文？',
      importance: 'medium',
      options: ['官方数据', '行业报告', '学术论文', '无偏好'],
    },
  ],
  // 开发类任务
  development: [
    {
      id: 'q1',
      category: 'scope',
      question: '需要实现的具体功能是什么？',
      importance: 'critical',
    },
    {
      id: 'q2',
      category: 'context',
      question: '项目的技术栈是什么？有什么约束？',
      importance: 'high',
    },
    {
      id: 'q3',
      category: 'constraint',
      question: '有什么特定的代码风格或架构要求吗？',
      importance: 'medium',
      options: ['遵循现有风格', '无特定要求', '需要指定'],
    },
    {
      id: 'q4',
      category: 'quality',
      question: '需要包含测试吗？需要什么级别的测试？',
      importance: 'high',
      options: ['不需要', '简单测试', '单元测试', '完整测试'],
    },
  ],
  // 调试类任务
  debugging: [
    {
      id: 'q1',
      category: 'scope',
      question: '具体出现了什么错误或问题？请描述现象',
      importance: 'critical',
    },
    {
      id: 'q2',
      category: 'context',
      question: '这个问题是在什么环境下发生的？',
      importance: 'high',
      options: ['开发环境', '测试环境', '生产环境', '所有环境'],
    },
    {
      id: 'q3',
      category: 'constraint',
      question: '这个问题多久出现一次？是必现还是偶发？',
      importance: 'high',
      options: ['必现', '偶发', '间歇性', '未知'],
    },
  ],
  // 数据采集类任务
  web_scraping: [
    {
      id: 'q1',
      category: 'scope',
      question: '需要采集哪个网站/页面的数据？',
      importance: 'critical',
    },
    {
      id: 'q2',
      category: 'context',
      question: '需要采集哪些具体数据字段？',
      importance: 'critical',
    },
    {
      id: 'q3',
      category: 'constraint',
      question: '数据采集的频率要求是什么？一次性还是定期？',
      importance: 'high',
      options: ['一次性', '每天', '每周', '每月', '实时'],
    },
    {
      id: 'q4',
      category: 'preference',
      question: '数据需要什么格式输出？',
      importance: 'medium',
      options: ['JSON', 'CSV', 'Excel', '数据库', '无特定要求'],
    },
  ],
  // 文档类任务
  documentation: [
    {
      id: 'q1',
      category: 'scope',
      question: '需要为什么内容创建文档？',
      importance: 'critical',
    },
    {
      id: 'q2',
      category: 'preference',
      question: '文档需要包含哪些部分？',
      importance: 'high',
    },
    {
      id: 'q3',
      category: 'quality',
      question: '需要包含代码示例吗？',
      importance: 'medium',
      options: ['需要', '不需要', '部分需要'],
    },
  ],
  // 默认问题
  default: [
    {
      id: 'q1',
      category: 'scope',
      question: '请详细描述一下您的具体需求？',
      importance: 'critical',
    },
    {
      id: 'q2',
      category: 'context',
      question: '这个任务的背景是什么？为什么要做这个？',
      importance: 'high',
    },
    {
      id: 'q3',
      category: 'constraint',
      question: '有什么时间或资源上的限制吗？',
      importance: 'medium',
    },
    {
      id: 'q4',
      category: 'preference',
      question: '您期望的交付形式是什么？',
      importance: 'medium',
    },
  ],
};

/**
 * Requirement Gatherer 类
 */
export class RequirementGatherer {
  private currentSummary: RequirementSummary | null = null;
  private questionHistory: Map<string, ClarifyingQuestion[]> = new Map();

  /**
   * 开始收集需求 - 分析用户目标并生成问题
   */
  startGathering(goal: string): RequirementSummary {
    // 使用深度分析
    const analysis = deepAnalyze(goal);

    // 检测危险操作
    const dangerCheck = detectDangerousOperations(goal);

    // 生成建议
    const suggestions = generateSuggestions(goal, analysis);

    // 获取对应的问题模板
    const questions = this.generateQuestions(goal, analysis);

    // 构建需求摘要
    this.currentSummary = {
      originalGoal: goal,
      understoodGoal: goal,
      domain: analysis.domain,
      complexity: analysis.complexity,
      scope: this.extractScope(goal),
      constraints: analysis.keywords,
      preferences: [],
      expectedDeliverables: this.extractDeliverables(goal, analysis),
      qualityRequirements: analysis.suggestedApproach.split('\n')[0],
      risks: dangerCheck.warnings.length > 0 
        ? dangerCheck.warnings.join('\n') 
        : analysis.potentialChallenges.slice(0, 3).join('\n'),
      questions,
      answeredQuestions: 0,
      totalQuestions: questions.length,
      status: 'clarifying',
    };

    return this.currentSummary;
  }

  /**
   * 生成问题列表
   */
  private generateQuestions(goal: string, analysis: TaskAnalysis): ClarifyingQuestion[] {
    // 根据领域选择问题模板
    const domainKey = analysis.domain === 'unknown' ? 'default' : analysis.domain;
    const baseQuestions = QUESTION_TEMPLATES[domainKey] || QUESTION_TEMPLATES.default;

    // 过滤掉已经知道答案的问题
    return baseQuestions.filter(q => {
      // 检查目标中是否已经包含答案
      const lowerGoal = goal.toLowerCase();
      
      if (q.id === 'q1' && q.category === 'scope') {
        // 第一个问题总是需要问的
        return true;
      }
      
      // 检查是否可以从目标中推断答案
      if (q.options) {
        for (const opt of q.options) {
          if (lowerGoal.includes(opt.toLowerCase())) {
            return false; // 已经有答案了
          }
        }
      }
      
      return true;
    });
  }

  /**
   * 提取范围
   */
  private extractScope(goal: string): string {
    const scopeKeywords = ['全部', '整个', '所有', 'full', 'all', 'entire', 'complete'];
    const limitedKeywords = ['部分', '一些', 'simple', 'partial', 'some'];
    
    for (const kw of scopeKeywords) {
      if (goal.toLowerCase().includes(kw.toLowerCase())) {
        return '完整范围';
      }
    }
    
    for (const kw of limitedKeywords) {
      if (goal.toLowerCase().includes(kw.toLowerCase())) {
        return '有限范围';
      }
    }
    
    return '需要确认范围';
  }

  /**
   * 提取交付物
   */
  private extractDeliverables(goal: string, analysis: TaskAnalysis): string {
    const lowerGoal = goal.toLowerCase();
    
    if (analysis.requiresImplementation) {
      if (lowerGoal.includes('api') || lowerGoal.includes('接口')) {
        return 'API 接口实现 + 单元测试';
      }
      if (lowerGoal.includes('组件') || lowerGoal.includes('component')) {
        return '组件代码 + 测试';
      }
      return '功能实现 + 测试';
    }
    
    if (analysis.requiresResearch) {
      return '研究报告 + 数据摘要';
    }
    
    if (analysis.requiresDocumentation) {
      return '文档/指南';
    }
    
    return '根据需求确定';
  }

  /**
   * 获取下一个需要回答的问题
   */
  getNextQuestion(): ClarifyingQuestion | null {
    if (!this.currentSummary) return null;
    
    // 找到第一个未回答的重要问题
    const critical = this.currentSummary.questions.find(q => !q.userAnswer && q.importance === 'critical');
    if (critical) return critical;
    
    const high = this.currentSummary.questions.find(q => !q.userAnswer && q.importance === 'high');
    if (high) return high;
    
    return this.currentSummary.questions.find(q => !q.userAnswer) || null;
  }

  /**
   * 回答问题
   */
  answerQuestion(questionId: string, answer: string): RequirementSummary | null {
    if (!this.currentSummary) return null;
    
    const question = this.currentSummary.questions.find(q => q.id === questionId);
    if (!question) return null;
    
    question.userAnswer = answer;
    this.currentSummary.answeredQuestions = this.currentSummary.questions.filter(q => q.userAnswer).length;
    
    // 根据回答更新理解的目标
    this.updateUnderstanding();
    
    return this.currentSummary;
  }

  /**
   * 根据回答更新对需求的理解
   */
  private updateUnderstanding(): void {
    if (!this.currentSummary) return;
    
    // 构建更清晰的需求描述
    const answered = this.currentSummary.questions.filter(q => q.userAnswer);
    
    if (answered.length > 0) {
      // 基于原始目标和问答构建理解
      const scope = answered.find(q => q.category === 'scope')?.userAnswer || '';
      const context = answered.find(q => q.category === 'context')?.userAnswer || '';
      
      this.currentSummary.understoodGoal = this.buildUnderstoodGoal(
        this.currentSummary.originalGoal,
        scope,
        context
      );
    }
  }

  /**
   * 构建理解后的目标
   */
  private buildUnderstoodGoal(original: string, scope: string, context: string): string {
    let understood = original;
    
    if (scope && scope !== original) {
      understood += ` [范围: ${scope}]`;
    }
    
    if (context && !original.toLowerCase().includes(context.toLowerCase())) {
      understood += ` [背景: ${context}]`;
    }
    
    return understood;
  }

  /**
   * 生成需求确认摘要
   */
  generateConfirmationSummary(): string | null {
    if (!this.currentSummary) return null;
    
    const summary = this.currentSummary;
    const answered = summary.questions.filter(q => q.userAnswer);
    const unanswered = summary.questions.filter(q => !q.userAnswer);
    
    let output = '';
    output += '═'.repeat(60) + '\n';
    output += '📋 需求确认摘要\n';
    output += '═'.repeat(60) + '\n\n';
    
    output += `🎯 原始需求:\n   ${summary.originalGoal}\n\n`;
    
    output += `💡 理解后的需求:\n   ${summary.understoodGoal}\n\n`;
    
    output += `📊 分析结果:\n`;
    output += `   • 领域: ${this.getDomainName(summary.domain)}\n`;
    output += `   • 复杂度: ${this.getComplexityName(summary.complexity)}\n`;
    output += `   • 范围: ${summary.scope}\n`;
    output += `   • 预计步骤: ${Math.ceil(summary.questions.length / 2)} 步\n\n`;
    
    if (answered.length > 0) {
      output += `✅ 已回答的问题 (${answered.length}/${summary.totalQuestions}):\n`;
      for (const q of answered) {
        output += `   ${q.question}\n`;
        output += `   → ${q.userAnswer}\n\n`;
      }
    }
    
    if (unanswered.length > 0) {
      output += `❓ 待回答的问题 (${unanswered.length}):\n`;
      for (const q of unanswered) {
        output += `   • ${q.question}\n`;
      }
      output += '\n';
    }
    
    output += `📦 预期交付物: ${summary.expectedDeliverables}\n\n`;
    
    if (summary.risks) {
      output += `⚠️ 潜在风险:\n   ${summary.risks}\n\n`;
    }
    
    output += '═'.repeat(60) + '\n';
    output += '请确认以上需求是否正确。回复"确认"开始执行，或修改具体需求。\n';
    output += '═'.repeat(60) + '\n';
    
    return output;
  }

  /**
   * 确认需求
   */
  confirm(): RequirementSummary | null {
    if (!this.currentSummary) return null;
    
    this.currentSummary.status = 'confirmed';
    return this.currentSummary;
  }

  /**
   * 标记为修改需求
   */
  requestModification(): RequirementSummary | null {
    if (!this.currentSummary) return null;
    
    this.currentSummary.status = 'modifying';
    return this.currentSummary;
  }

  /**
   * 修改需求 - 重新开始收集
   */
  modifyRequirement(newGoal: string): RequirementSummary {
    // 保存历史
    if (this.currentSummary) {
      const history = this.questionHistory.get(this.currentSummary.originalGoal) || [];
      history.push(...this.currentSummary.questions);
      this.questionHistory.set(this.currentSummary.originalGoal, history);
    }
    
    // 重新开始收集
    return this.startGathering(newGoal);
  }

  /**
   * 获取当前状态
   */
  getStatus(): RequirementStatus | null {
    return this.currentSummary?.status || null;
  }

  /**
   * 获取当前摘要
   */
  getCurrentSummary(): RequirementSummary | null {
    return this.currentSummary;
  }

  /**
   * 重置收集器
   */
  reset(): void {
    this.currentSummary = null;
  }

  /**
   * 获取域名中文
   */
  private getDomainName(domain: TaskAnalysis['domain']): string {
    const names: Record<string, string> = {
      web_scraping: '数据采集',
      development: '开发',
      debugging: '调试',
      documentation: '文档',
      research: '研究',
      automation: '自动化',
      unknown: '未分类',
    };
    return names[domain] || domain;
  }

  /**
   * 获取复杂度中文
   */
  private getComplexityName(complexity: TaskAnalysis['complexity']): string {
    const names: Record<string, string> = {
      simple: '简单',
      moderate: '中等',
      complex: '复杂',
      very_complex: '非常复杂',
    };
    return names[complexity] || complexity;
  }
}

// 单例
export const requirementGatherer = new RequirementGatherer();

export default RequirementGatherer;
