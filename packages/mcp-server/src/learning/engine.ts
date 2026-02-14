/**
 * Learning Engine
 * 
 * Analyzes execution history to extract patterns, insights, and improvements.
 * The core intelligence behind Genesis's self-improvement capability.
 */

import type { 
  ExecutionRecord, 
  TaskExecutionRecord, 
  ExecutionIssue 
} from './history.js';
import { executionHistory } from './history.js';

export interface Learning {
  id: string;
  timestamp: string;
  type: 'pattern' | 'optimization' | 'issue' | 'best_practice' | 'insight';
  domain?: string;
  description: string;
  evidence: string[]; // Execution IDs that support this learning
  confidence: number; // 0-100
  applications: number; // How many times this learning has been applied
  impact: 'high' | 'medium' | 'low';
}

export interface OptimizationSuggestion {
  target: 'workflow' | 'agent_assignment' | 'tool_selection' | 'estimation' | 'planning';
  description: string;
  currentApproach: string;
  suggestedApproach: string;
  expectedImprovement: string;
  confidence: number;
  evidence: string[];
}

export interface Pattern {
  name: string;
  description: string;
  frequency: number;
  successRate: number;
  applicableDomains: string[];
}

/**
 * Learning Engine class
 */
export class LearningEngine {
  private learnings: Map<string, Learning> = new Map();
  private patterns: Map<string, Pattern> = new Map();

  /**
   * Analyze execution history and extract learnings
   */
  analyzeHistory(domain?: string): Learning[] {
    const records = domain 
      ? executionHistory.findByDomain(domain)
      : executionHistory.getAllExecutions();

    const newLearnings: Learning[] = [];

    // Pattern 1: Success factors
    const successLearnings = this.analyzeSuccessFactors(records);
    newLearnings.push(...successLearnings);

    // Pattern 2: Failure patterns
    const failureLearnings = this.analyzeFailurePatterns(records);
    newLearnings.push(...failureLearnings);

    // Pattern 3: Estimation accuracy
    const estimationLearnings = this.analyzeEstimationAccuracy(records);
    newLearnings.push(...estimationLearnings);

    // Pattern 4: Agent performance
    const agentLearnings = this.analyzeAgentPerformance(records);
    newLearnings.push(...agentLearnings);

    // Pattern 5: Tool effectiveness
    const toolLearnings = this.analyzeToolEffectiveness(records);
    newLearnings.push(...toolLearnings);

    // Store new learnings
    for (const learning of newLearnings) {
      this.learnings.set(learning.id, learning);
    }

    return newLearnings;
  }

  /**
   * Analyze what leads to successful executions
   */
  private analyzeSuccessFactors(records: ExecutionRecord[]): Learning[] {
    const learnings: Learning[] = [];
    const successful = records.filter(r => r.execution.status === 'completed');

    if (successful.length === 0) return learnings;

    // Analyze common characteristics of successful executions
    const domainSuccess: Record<string, { count: number; total: number }> = {};
    const agentSuccess: Record<string, { count: number; total: number }> = {};

    for (const record of successful) {
      // Domain analysis
      if (!domainSuccess[record.analysis.domain]) {
        domainSuccess[record.analysis.domain] = { count: 0, total: 0 };
      }
      domainSuccess[record.analysis.domain].count++;

      // Agent analysis
      for (const task of record.tasks) {
        if (!agentSuccess[task.agentType]) {
          agentSuccess[task.agentType] = { count: 0, total: 0 };
        }
        agentSuccess[task.agentType].count++;
      }
    }

    // Count totals
    for (const record of records) {
      if (domainSuccess[record.analysis.domain]) {
        domainSuccess[record.analysis.domain].total++;
      }
      for (const task of record.tasks) {
        if (agentSuccess[task.agentType]) {
          agentSuccess[task.agentType].total++;
        }
      }
    }

    // Create learnings for high-success domains
    for (const [domain, stats] of Object.entries(domainSuccess)) {
      const rate = stats.total > 0 ? (stats.count / stats.total) * 100 : 0;
      if (rate > 75 && stats.total >= 3) {
        learnings.push({
          id: `learning-domain-${domain}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'pattern',
          domain,
          description: `High success rate (${rate.toFixed(1)}%) for ${domain} tasks`,
          evidence: successful.filter(r => r.analysis.domain === domain).map(r => r.id),
          confidence: Math.min(rate, 95),
          applications: 0,
          impact: 'high',
        });
      }
    }

    // Create learnings for reliable agents
    for (const [agent, stats] of Object.entries(agentSuccess)) {
      const rate = stats.total > 0 ? (stats.count / stats.total) * 100 : 0;
      if (rate > 80 && stats.total >= 5) {
        learnings.push({
          id: `learning-agent-${agent}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'best_practice',
          description: `Agent '${agent}' shows high reliability (${rate.toFixed(1)}% success)`,
          evidence: successful
            .filter(r => r.tasks.some(t => t.agentType === agent))
            .map(r => r.id),
          confidence: Math.min(rate, 95),
          applications: 0,
          impact: 'medium',
        });
      }
    }

    return learnings;
  }

  /**
   * Analyze failure patterns
   */
  private analyzeFailurePatterns(records: ExecutionRecord[]): Learning[] {
    const learnings: Learning[] = [];
    const failed = records.filter(r => r.execution.status === 'failed');

    if (failed.length === 0) return learnings;

    // Analyze common failure reasons
    const issueTypes: Record<string, { count: number; examples: string[] }> = {};

    for (const record of failed) {
      for (const issue of record.issues) {
        if (!issueTypes[issue.type]) {
          issueTypes[issue.type] = { count: 0, examples: [] };
        }
        issueTypes[issue.type].count++;
        issueTypes[issue.type].examples.push(issue.description);
      }
    }

    // Create learnings for common issues
    for (const [type, data] of Object.entries(issueTypes)) {
      if (data.count >= 2) {
        learnings.push({
          id: `learning-issue-${type}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'issue',
          description: `Frequent issue type '${type}' (${data.count} occurrences)`,
          evidence: failed.filter(r => r.issues.some(i => i.type === type)).map(r => r.id),
          confidence: Math.min(data.count * 10, 90),
          applications: 0,
          impact: data.count > 3 ? 'high' : 'medium',
        });
      }
    }

    return learnings;
  }

  /**
   * Analyze estimation accuracy
   */
  private analyzeEstimationAccuracy(records: ExecutionRecord[]): Learning[] {
    const learnings: Learning[] = [];
    const withDuration = records.filter(r => r.execution.actualDuration);

    if (withDuration.length === 0) return learnings;

    // Calculate estimation errors by domain
    const domainErrors: Record<string, { errors: number[]; total: number }> = {};

    for (const record of withDuration) {
      if (!domainErrors[record.analysis.domain]) {
        domainErrors[record.analysis.domain] = { errors: [], total: 0 };
      }

      const estimated = record.workflow.estimatedDuration;
      const actual = record.execution.actualDuration!;
      const error = ((actual - estimated) / estimated) * 100;

      domainErrors[record.analysis.domain].errors.push(error);
      domainErrors[record.analysis.domain].total++;
    }

    // Create learnings for systematic estimation bias
    for (const [domain, data] of Object.entries(domainErrors)) {
      if (data.total >= 3) {
        const avgError = data.errors.reduce((a, b) => a + b, 0) / data.errors.length;
        
        if (avgError > 30) {
          learnings.push({
            id: `learning-estimate-${domain}-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'optimization',
            domain,
            description: `Estimates for ${domain} are too optimistic (avg ${avgError.toFixed(1)}% underestimate)`,
            evidence: withDuration.filter(r => r.analysis.domain === domain).map(r => r.id),
            confidence: Math.min(data.total * 15, 85),
            applications: 0,
            impact: 'medium',
          });
        } else if (avgError < -20) {
          learnings.push({
            id: `learning-estimate-${domain}-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'optimization',
            domain,
            description: `Estimates for ${domain} are too conservative (avg ${Math.abs(avgError).toFixed(1)}% overestimate)`,
            evidence: withDuration.filter(r => r.analysis.domain === domain).map(r => r.id),
            confidence: Math.min(data.total * 15, 85),
            applications: 0,
            impact: 'low',
          });
        }
      }
    }

    return learnings;
  }

  /**
   * Analyze agent performance patterns
   */
  private analyzeAgentPerformance(records: ExecutionRecord[]): Learning[] {
    const learnings: Learning[] = [];
    const agentStats: Record<string, {
      successes: number;
      failures: number;
      durations: number[];
      retries: number[];
    }> = {};

    for (const record of records) {
      for (const task of record.tasks) {
        if (!agentStats[task.agentType]) {
          agentStats[task.agentType] = { successes: 0, failures: 0, durations: [], retries: [] };
        }

        if (task.status === 'completed') {
          agentStats[task.agentType].successes++;
        } else {
          agentStats[task.agentType].failures++;
        }

        if (task.actualDuration) {
          agentStats[task.agentType].durations.push(task.actualDuration);
        }
        agentStats[task.agentType].retries.push(task.retries);
      }
    }

    // Analyze patterns
    for (const [agent, stats] of Object.entries(agentStats)) {
      const total = stats.successes + stats.failures;
      if (total < 5) continue;

      const successRate = (stats.successes / total) * 100;
      const avgRetries = stats.retries.reduce((a, b) => a + b, 0) / stats.retries.length;

      if (avgRetries > 1) {
        learnings.push({
          id: `learning-agent-retry-${agent}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'insight',
          description: `Agent '${agent}' often requires retries (avg ${avgRetries.toFixed(1)} per task)`,
          evidence: records
            .filter(r => r.tasks.some(t => t.agentType === agent && t.retries > 0))
            .map(r => r.id),
          confidence: 70,
          applications: 0,
          impact: 'medium',
        });
      }
    }

    return learnings;
  }

  /**
   * Analyze tool effectiveness
   */
  private analyzeToolEffectiveness(records: ExecutionRecord[]): Learning[] {
    const learnings: Learning[] = [];
    const toolStats: Record<string, {
      uses: number;
      successes: number;
      issues: number;
    }> = {};

    for (const record of records) {
      for (const tool of record.tools) {
        if (!toolStats[tool.toolId]) {
          toolStats[tool.toolId] = { uses: 0, successes: 0, issues: 0 };
        }
        toolStats[tool.toolId].uses += tool.usageCount;
        toolStats[tool.toolId].successes += tool.successCount;
      }

      for (const issue of record.issues) {
        if (issue.toolId && toolStats[issue.toolId]) {
          toolStats[issue.toolId].issues++;
        }
      }
    }

    for (const [toolId, stats] of Object.entries(toolStats)) {
      if (stats.uses < 3) continue;

      const successRate = (stats.successes / stats.uses) * 100;
      const issueRate = (stats.issues / stats.uses) * 100;

      if (successRate > 90) {
        learnings.push({
          id: `learning-tool-good-${toolId}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'best_practice',
          description: `Tool '${toolId}' is highly reliable (${successRate.toFixed(1)}% success rate)`,
          evidence: records.filter(r => r.tools.some(t => t.toolId === toolId)).map(r => r.id),
          confidence: Math.min(stats.uses * 10, 90),
          applications: 0,
          impact: 'medium',
        });
      } else if (issueRate > 30) {
        learnings.push({
          id: `learning-tool-bad-${toolId}-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'issue',
          description: `Tool '${toolId}' has high failure rate (${issueRate.toFixed(1)}% issues)`,
          evidence: records
            .filter(r => r.issues.some(i => i.toolId === toolId))
            .map(r => r.id),
          confidence: Math.min(stats.uses * 8, 85),
          applications: 0,
          impact: 'high',
        });
      }
    }

    return learnings;
  }

  /**
   * Get all learnings
   */
  getLearnings(): Learning[] {
    return Array.from(this.learnings.values());
  }

  /**
   * Get learnings by type
   */
  getLearningsByType(type: Learning['type']): Learning[] {
    return Array.from(this.learnings.values()).filter(l => l.type === type);
  }

  /**
   * Get learnings by domain
   */
  getLearningsByDomain(domain: string): Learning[] {
    return Array.from(this.learnings.values()).filter(l => l.domain === domain);
  }

  /**
   * Get high-confidence learnings
   */
  getHighConfidenceLearnings(minConfidence: number = 70): Learning[] {
    return Array.from(this.learnings.values())
      .filter(l => l.confidence >= minConfidence)
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Apply a learning (mark as used)
   */
  applyLearning(learningId: string): void {
    const learning = this.learnings.get(learningId);
    if (learning) {
      learning.applications++;
    }
  }

  /**
   * Generate optimization suggestions based on learnings
   */
  generateOptimizations(): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // Analyze estimation learnings
    const estimationLearnings = this.getLearningsByType('optimization')
      .filter(l => l.description.includes('estimate'));

    for (const learning of estimationLearnings) {
      const match = learning.description.match(/underestimate|overestimate/);
      if (match) {
        const factor = learning.description.includes('underestimate') ? 1.3 : 0.8;
        suggestions.push({
          target: 'estimation',
          description: `Adjust time estimates for ${learning.domain} tasks`,
          currentApproach: 'Using base estimates',
          suggestedApproach: `Multiply estimates by ${factor.toFixed(1)}x for ${learning.domain}`,
          expectedImprovement: 'More accurate planning',
          confidence: learning.confidence,
          evidence: learning.evidence,
        });
      }
    }

    // Analyze agent learnings
    const agentLearnings = this.getLearningsByType('insight')
      .filter(l => l.description.includes('retry'));

    for (const learning of agentLearnings) {
      const agentMatch = learning.description.match(/Agent '(\w+)'/);
      if (agentMatch) {
        suggestions.push({
          target: 'agent_assignment',
          description: `Review ${agentMatch[1]} agent reliability`,
          currentApproach: 'Assigning tasks without retry consideration',
          suggestedApproach: 'Add retry logic or use alternative agents',
          expectedImprovement: 'Reduced task failures',
          confidence: learning.confidence,
          evidence: learning.evidence,
        });
      }
    }

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get patterns for a domain
   */
  getPatternsForDomain(domain: string): Pattern[] {
    const records = executionHistory.findByDomain(domain);
    const patterns: Pattern[] = [];

    // Analyze successful workflow patterns
    const successful = records.filter(r => r.execution.status === 'completed');
    if (successful.length >= 3) {
      patterns.push({
        name: `${domain}_success_pattern`,
        description: `Common success pattern for ${domain} tasks`,
        frequency: successful.length,
        successRate: (successful.length / records.length) * 100,
        applicableDomains: [domain],
      });
    }

    return patterns;
  }

  /**
   * Export learnings
   */
  exportLearnings(): string {
    return JSON.stringify(Array.from(this.learnings.values()), null, 2);
  }

  /**
   * Import learnings
   */
  importLearnings(json: string): void {
    const learnings: Learning[] = JSON.parse(json);
    for (const learning of learnings) {
      this.learnings.set(learning.id, learning);
    }
  }
}

// Singleton instance
export const learningEngine = new LearningEngine();
