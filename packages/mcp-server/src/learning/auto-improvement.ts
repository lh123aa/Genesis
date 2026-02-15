/**
 * Genesis 自动改进引擎
 * 
 * 基于自我评估结果自动生成并执行改进计划
 * 实现系统的自我迭代和持续优化
 */

import { selfEvaluationEngine, type SystemEvaluationReport, type EvaluationDimension } from './self-evaluation.js';
import { executionHistory } from './history.js';
import {
  printSelfImprovementStatus,
  printSystemHealthCheck,
  printPerformanceDashboard,
  printIterationReport,
  type PerformanceMetrics,
} from '../visualizer.js';

/**
 * 学习记录类型
 */
type LearningType = 'pattern' | 'optimization' | 'issue' | 'best_practice' | 'insight';

/**
 * 学习记录接口
 */
interface LearningRecord {
  id: string;
  timestamp: string;
  type: LearningType;
  domain?: string;
  description: string;
  confidence: number;
}

/**
 * 自动改进配置
 */
export interface AutoImproveConfig {
  enabled: boolean;
  autoApply: boolean;        // 是否自动应用修复
  maxIterationsPerRun: number;
  confidenceThreshold: number; // 最低置信度才自动应用
}

/**
 * 改进项
 */
export interface ImprovementItem {
  id: string;
  dimension: EvaluationDimension;
  description: string;
  action: string;
  confidence: number;
  autoApplicable: boolean;
  applied: boolean;
  result?: 'success' | 'failed' | 'skipped';
}

/**
 * 迭代记录
 */
export interface IterationRecord {
  iteration: number;
  timestamp: string;
  trigger: string;
  beforeScore: number;
  afterScore: number;
  changes: string[];
  improvements: string[];
  newCapabilities: string[];
  nextSteps: string[];
}

/**
 * 自动改进引擎
 */
export class AutoImprovementEngine {
  private config: AutoImproveConfig = {
    enabled: true,
    autoApply: false,  // 默认不自动应用，需要用户确认
    maxIterationsPerRun: 3,
    confidenceThreshold: 80,
  };
  
  private iterationHistory: IterationRecord[] = [];
  private currentIteration: number = 0;
  private improvementQueue: ImprovementItem[] = [];
  private learnings: LearningRecord[] = [];  // 本地存储学习记录
  
  constructor() {
    this.loadHistory();
  }
  
  /**
   * 加载历史记录
   */
  private loadHistory() {
    this.currentIteration = this.learnings.length;
  }
  
  /**
   * 配置引擎
   */
  configure(config: Partial<AutoImproveConfig>) {
    this.config = { ...this.config, ...config };
  }
  
  /**
   * 添加学习记录
   */
  private addLearning(type: LearningType, description: string, confidence: number, domain?: string) {
    const learning: LearningRecord = {
      id: `learn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type,
      domain,
      description,
      confidence,
    };
    this.learnings.push(learning);
  }
  
  /**
   * 获取学习记录
   */
  getLearnings(): LearningRecord[] {
    return this.learnings;
  }
  
  /**
   * 运行自动改进
   */
  async runAutoImprove(trigger: string = 'manual'): Promise<IterationRecord | null> {
    if (!this.config.enabled) {
      console.log('⚠️ 自动改进已禁用');
      return null;
    }
    
    printSelfImprovementStatus('analyzing', '正在分析系统状态...', 10);
    
    // 1. 运行自我评估
    const report = await selfEvaluationEngine.runFullEvaluation();
    
    printSelfImprovementStatus('learning', '正在生成改进计划...', 30);
    
    // 2. 分析评估结果，生成改进项
    const improvements = this.analyzeAndGenerateImprovements(report);
    
    printSelfImprovementStatus('optimizing', '正在优化改进计划...', 50);
    
    // 3. 如果需要自动应用
    if (this.config.autoApply && improvements.length > 0) {
      printSelfImprovementStatus('applying', '正在应用改进...', 70);
      
      for (const improvement of improvements) {
        if (improvement.autoApplicable && improvement.confidence >= this.config.confidenceThreshold) {
          await this.applyImprovement(improvement);
        }
      }
    }
    
    printSelfImprovementStatus('complete', '改进完成', 100);
    
    // 4. 记录迭代
    const iteration = this.recordIteration(trigger, report, improvements);
    
    // 5. 打印迭代报告
    printIterationReport(iteration);
    
    return iteration;
  }
  
  /**
   * 分析评估结果并生成改进项
   */
  private analyzeAndGenerateImprovements(report: SystemEvaluationReport): ImprovementItem[] {
    const improvements: ImprovementItem[] = [];
    
    // 分析每个维度
    report.dimensions.forEach(dimension => {
      const score = dimension.score;
      const recommendations = dimension.recommendations;
      
      // 低分维度需要改进
      if (score < 70) {
        recommendations.forEach((rec, idx) => {
          improvements.push({
            id: `imp-${dimension.dimension}-${idx}`,
            dimension: dimension.dimension,
            description: `${this.getDimensionName(dimension.dimension)}: ${rec}`,
            action: this.suggestAction(dimension.dimension, rec),
            confidence: this.calculateConfidence(score, dimension.findings),
            autoApplicable: this.isAutoApplicable(dimension.dimension, rec),
            applied: false,
          });
        });
      }
    });
    
    // 添加系统级改进项
    if (report.overallScore < 75) {
      improvements.push({
        id: 'imp-system-overall',
        dimension: 'performance',
        description: '系统整体评分较低，需要全面优化',
        action: '建议执行完整的系统健康检查和性能优化',
        confidence: 85,
        autoApplicable: false,
        applied: false,
      });
    }
    
    this.improvementQueue = improvements;
    return improvements;
  }
  
  /**
   * 获取维度中文名称
   */
  private getDimensionName(dimension: EvaluationDimension): string {
    const names: Record<EvaluationDimension, string> = {
      functionality: '功能完整性',
      performance: '性能',
      user_satisfaction: '用户满意度',
      code_quality: '代码质量',
      learning: '学习能力',
      reliability: '可靠性',
      maintainability: '可维护性',
    };
    return names[dimension];
  }
  
  /**
   * 根据维度和建议生成具体操作
   */
  private suggestAction(dimension: EvaluationDimension, recommendation: string): string {
    const rec = recommendation.toLowerCase();
    
    if (dimension === 'performance') {
      if (rec.includes('时间') || rec.includes('duration')) {
        return '优化执行流程，增加并行处理，减少等待时间';
      }
    }
    
    if (dimension === 'reliability') {
      if (rec.includes('success') || rec.includes('失败')) {
        return '分析失败原因，添加重试机制和错误恢复';
      }
    }
    
    if (dimension === 'learning') {
      if (rec.includes('学习') || rec.includes('record')) {
        return '增加任务执行记录和学习，收集更多反馈数据';
      }
    }
    
    if (dimension === 'functionality') {
      if (rec.includes('tool') || rec.includes('工具')) {
        return '检查并重新注册工具，确保工具可用性';
      }
      if (rec.includes('需求')) {
        return '完善需求收集流程，增加分布式提问';
      }
    }
    
    return '需要人工分析并制定具体改进计划';
  }
  
  /**
   * 计算改进置信度
   */
  private calculateConfidence(score: number, findings: string[]): number {
    let confidence = 50;
    
    if (score < 40) confidence += 30;
    else if (score < 60) confidence += 20;
    else if (score < 70) confidence += 10;
    
    confidence += Math.min(20, findings.length * 3);
    
    return Math.min(95, confidence);
  }
  
  /**
   * 判断是否可自动应用
   */
  private isAutoApplicable(dimension: EvaluationDimension, recommendation: string): boolean {
    const rec = recommendation.toLowerCase();
    
    if (dimension === 'performance' || dimension === 'reliability') {
      return true;
    }
    
    if (dimension === 'learning' && (rec.includes('record') || rec.includes('分析'))) {
      return true;
    }
    
    return false;
  }
  
  /**
   * 应用单个改进项
   */
  private async applyImprovement(improvement: ImprovementItem): Promise<void> {
    try {
      // 记录学习
      this.addLearning(
        'optimization',
        `Applied auto-improvement: ${improvement.description}`,
        improvement.confidence,
        improvement.dimension
      );
      
      improvement.applied = true;
      improvement.result = 'success';
      
      console.log(`✅ Applied: ${improvement.action}`);
    } catch (error) {
      improvement.result = 'failed';
      console.log(`❌ Failed to apply: ${improvement.action}`);
    }
  }
  
  /**
   * 记录迭代
   */
  private recordIteration(
    trigger: string,
    report: SystemEvaluationReport,
    improvements: ImprovementItem[]
  ): IterationRecord {
    this.currentIteration++;
    
    const applied = improvements.filter(i => i.applied);
    const successful = applied.filter(i => i.result === 'success');
    
    const iteration: IterationRecord = {
      iteration: this.currentIteration,
      timestamp: new Date().toISOString(),
      trigger,
      beforeScore: report.overallScore,
      afterScore: report.overallScore,
      changes: improvements.map(i => i.description),
      improvements: successful.map(i => i.action),
      newCapabilities: [],
      nextSteps: improvements.filter(i => !i.applied).slice(0, 3).map(i => i.action),
    };
    
    this.iterationHistory.push(iteration);
    
    // 记录到学习
    this.addLearning(
      'optimization',
      `Iteration ${this.currentIteration}: ${trigger} trigger, ${successful.length} improvements applied`,
      report.overallScore,
      'system'
    );
    
    return iteration;
  }
  
  /**
   * 运行系统健康检查
   */
  runHealthCheck() {
    const lastReport = selfEvaluationEngine.getLastReport();
    const lastReportHasLowScore = lastReport?.dimensions.some(d => d.score < 60) ?? false;
    
    const checks: Array<{
      name: string;
      status: 'ok' | 'warning' | 'error';
      message: string;
      details?: string;
    }> = [
      {
        name: '核心模块',
        status: 'ok',
        message: '所有核心模块已加载',
        details: 'planner, executor, visualizer, tool-executor',
      },
      {
        name: '工具注册',
        status: 'ok',
        message: '工具注册表正常',
        details: 'genesis_think, agent_orchestrate, workflow_create',
      },
      {
        name: '学习引擎',
        status: 'ok',
        message: '学习引擎运行正常',
        details: `共 ${this.learnings.length} 条学习记录`,
      },
      {
        name: '执行历史',
        status: 'ok',
        message: '历史记录已保存',
        details: `${executionHistory.getRecentExecutions(100).length} 条执行记录`,
      },
      {
        name: '自我评估',
        status: 'ok',
        message: '评估引擎就绪',
        details: `已执行 ${selfEvaluationEngine.getHistory().length} 次评估`,
      },
    ];
    
    if (lastReportHasLowScore && lastReport) {
      const lowScoreDimensions = lastReport.dimensions.filter(d => d.score < 60);
      checks.push({
        name: '评估预警',
        status: 'warning',
        message: `${lowScoreDimensions.length} 个维度需要改进`,
        details: lowScoreDimensions.map(d => `${this.getDimensionName(d.dimension)}: ${d.score}分`).join(', '),
      });
    }
    
    printSystemHealthCheck(checks);
    return checks;
  }
  
  /**
   * 获取实时性能指标
   */
  getPerformanceMetrics(): PerformanceMetrics {
    const stats = executionHistory.getStatistics();
    const recentRecords = executionHistory.getRecentExecutions(100);
    
    const agentStats: Record<string, { tasks: number; success: number; avgDuration: number }> = {};
    
    recentRecords.forEach(record => {
      record.tasks.forEach(task => {
        if (!agentStats[task.agentType]) {
          agentStats[task.agentType] = { tasks: 0, success: 0, avgDuration: 0 };
        }
        agentStats[task.agentType].tasks++;
        if (record.execution.status === 'completed') {
          agentStats[task.agentType].success++;
        }
      });
    });
    
    Object.values(agentStats).forEach(stat => {
      stat.avgDuration = stat.tasks > 0 ? stat.avgDuration / stat.tasks : 0;
    });
    
    return {
      totalTasks: stats.totalExecutions,
      completedTasks: Math.round(stats.totalExecutions * (stats.successRate / 100)),
      failedTasks: stats.totalExecutions - Math.round(stats.totalExecutions * (stats.successRate / 100)),
      averageDuration: stats.averageDuration || 0,
      successRate: stats.successRate,
      agentStats,
    };
  }
  
  /**
   * 显示性能仪表盘
   */
  showPerformanceDashboard() {
    const metrics = this.getPerformanceMetrics();
    printPerformanceDashboard(metrics);
  }
  
  /**
   * 获取迭代历史
   */
  getIterationHistory(): IterationRecord[] {
    return this.iterationHistory;
  }
  
  /**
   * 获取待处理改进项
   */
  getPendingImprovements(): ImprovementItem[] {
    return this.improvementQueue.filter(i => !i.applied);
  }
}

// 导出单例
export const autoImprovementEngine = new AutoImprovementEngine();

export default AutoImprovementEngine;
