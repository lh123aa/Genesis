/**
 * Execution History
 * 
 * Records and manages execution history for learning.
 * Tracks what worked, what failed, and why.
 */

export interface ExecutionRecord {
  id: string;
  timestamp: string;
  goal: string;
  analysis: {
    domain: string;
    complexity: string;
    estimatedSteps: number;
  };
  workflow: {
    id: string;
    taskCount: number;
    estimatedDuration: number;
  };
  execution: {
    status: 'completed' | 'failed' | 'cancelled' | 'partial';
    startTime: string;
    endTime?: string;
    actualDuration?: number;
  };
  tasks: TaskExecutionRecord[];
  tools: ToolUsageRecord[];
  metrics: ExecutionMetrics;
  issues: ExecutionIssue[];
  learnings: string[];
  feedback?: UserFeedback;
}

export interface TaskExecutionRecord {
  taskId: string;
  agentType: string;
  description: string;
  status: 'completed' | 'failed' | 'skipped';
  estimatedDuration: number;
  actualDuration?: number;
  error?: string;
  output?: string;
  retries: number;
}

export interface ToolUsageRecord {
  toolId: string;
  toolName: string;
  usageCount: number;
  successCount: number;
  failureCount: number;
  averageResponseTime?: number;
}

export interface ExecutionMetrics {
  successRate: number;
  onTimeCompletion: boolean;
  timeDeviation: number; // percentage
  costEfficiency: number; // 0-100
  qualityScore: number; // 0-100
}

export interface ExecutionIssue {
  type: 'tool_failure' | 'agent_error' | 'timeout' | 'dependency_error' | 'planning_error' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  taskId?: string;
  toolId?: string;
  resolution?: string;
}

export interface UserFeedback {
  rating: number; // 1-5
  comments?: string;
  wouldRecommend: boolean;
  improvementAreas?: string[];
}

/**
 * Execution History Store
 */
export class ExecutionHistory {
  private records: Map<string, ExecutionRecord> = new Map();
  private goalIndex: Map<string, string[]> = new Map(); // goal -> record IDs
  private domainIndex: Map<string, string[]> = new Map(); // domain -> record IDs

  /**
   * Record a new execution
   */
  recordExecution(record: ExecutionRecord): void {
    this.records.set(record.id, record);
    
    // Index by goal
    if (!this.goalIndex.has(record.goal)) {
      this.goalIndex.set(record.goal, []);
    }
    this.goalIndex.get(record.goal)!.push(record.id);
    
    // Index by domain
    if (!this.domainIndex.has(record.analysis.domain)) {
      this.domainIndex.set(record.analysis.domain, []);
    }
    this.domainIndex.get(record.analysis.domain)!.push(record.id);
  }

  /**
   * Get execution by ID
   */
  getExecution(id: string): ExecutionRecord | undefined {
    return this.records.get(id);
  }

  /**
   * Get all executions
   */
  getAllExecutions(): ExecutionRecord[] {
    return Array.from(this.records.values());
  }

  /**
   * Find executions by goal (fuzzy match)
   */
  findByGoal(goal: string): ExecutionRecord[] {
    const normalizedGoal = goal.toLowerCase();
    const results: ExecutionRecord[] = [];
    
    for (const [storedGoal, ids] of this.goalIndex) {
      if (storedGoal.toLowerCase().includes(normalizedGoal) || 
          normalizedGoal.includes(storedGoal.toLowerCase())) {
        for (const id of ids) {
          const record = this.records.get(id);
          if (record) results.push(record);
        }
      }
    }
    
    return results;
  }

  /**
   * Find executions by domain
   */
  findByDomain(domain: string): ExecutionRecord[] {
    const ids = this.domainIndex.get(domain) || [];
    return ids.map(id => this.records.get(id)).filter((r): r is ExecutionRecord => !!r);
  }

  /**
   * Get recent executions
   */
  getRecentExecutions(limit: number = 10): ExecutionRecord[] {
    return Array.from(this.records.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Get successful executions
   */
  getSuccessfulExecutions(): ExecutionRecord[] {
    return Array.from(this.records.values())
      .filter(r => r.execution.status === 'completed');
  }

  /**
   * Get failed executions
   */
  getFailedExecutions(): ExecutionRecord[] {
    return Array.from(this.records.values())
      .filter(r => r.execution.status === 'failed');
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalExecutions: number;
    successRate: number;
    averageDuration: number;
    averageQuality: number;
    topDomains: string[];
    commonIssues: string[];
  } {
    const executions = this.getAllExecutions();
    const completed = executions.filter(e => e.execution.status === 'completed');
    const failed = executions.filter(e => e.execution.status === 'failed');
    
    // Calculate averages
    const durations = executions
      .map(e => e.execution.actualDuration)
      .filter((d): d is number => !!d);
    const avgDuration = durations.length > 0 
      ? durations.reduce((a, b) => a + b, 0) / durations.length 
      : 0;
    
    const qualities = executions.map(e => e.metrics.qualityScore);
    const avgQuality = qualities.length > 0
      ? qualities.reduce((a, b) => a + b, 0) / qualities.length
      : 0;
    
    // Top domains
    const domainCounts = new Map<string, number>();
    for (const e of executions) {
      const count = domainCounts.get(e.analysis.domain) || 0;
      domainCounts.set(e.analysis.domain, count + 1);
    }
    const topDomains = Array.from(domainCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([domain]) => domain);
    
    // Common issues
    const issueCounts = new Map<string, number>();
    for (const e of executions) {
      for (const issue of e.issues) {
        const count = issueCounts.get(issue.type) || 0;
        issueCounts.set(issue.type, count + 1);
      }
    }
    const commonIssues = Array.from(issueCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type]) => type);
    
    return {
      totalExecutions: executions.length,
      successRate: executions.length > 0 ? (completed.length / executions.length) * 100 : 0,
      averageDuration: avgDuration,
      averageQuality: avgQuality,
      topDomains,
      commonIssues,
    };
  }

  /**
   * Get performance metrics for a specific agent type
   */
  getAgentPerformance(agentType: string): {
    totalTasks: number;
    successRate: number;
    averageDuration: number;
    commonErrors: string[];
  } {
    const executions = this.getAllExecutions();
    const agentTasks: TaskExecutionRecord[] = [];
    
    for (const e of executions) {
      for (const task of e.tasks) {
        if (task.agentType === agentType) {
          agentTasks.push(task);
        }
      }
    }
    
    const completed = agentTasks.filter(t => t.status === 'completed');
    const durations = agentTasks
      .map(t => t.actualDuration)
      .filter((d): d is number => !!d);
    
    const errors = agentTasks
      .filter(t => t.error)
      .map(t => t.error!);
    
    return {
      totalTasks: agentTasks.length,
      successRate: agentTasks.length > 0 ? (completed.length / agentTasks.length) * 100 : 0,
      averageDuration: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
      commonErrors: [...new Set(errors)].slice(0, 5),
    };
  }

  /**
   * Get performance metrics for a specific tool
   */
  getToolPerformance(toolId: string): {
    usageCount: number;
    successRate: number;
    averageResponseTime?: number;
    issues: string[];
  } {
    const executions = this.getAllExecutions();
    let totalUsage = 0;
    let successCount = 0;
    const responseTimes: number[] = [];
    const issues: string[] = [];
    
    for (const e of executions) {
      for (const tool of e.tools) {
        if (tool.toolId === toolId) {
          totalUsage += tool.usageCount;
          successCount += tool.successCount;
          if (tool.averageResponseTime) {
            responseTimes.push(tool.averageResponseTime);
          }
        }
      }
      
      for (const issue of e.issues) {
        if (issue.toolId === toolId) {
          issues.push(issue.description);
        }
      }
    }
    
    return {
      usageCount: totalUsage,
      successRate: totalUsage > 0 ? (successCount / totalUsage) * 100 : 0,
      averageResponseTime: responseTimes.length > 0 
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
        : undefined,
      issues: [...new Set(issues)].slice(0, 5),
    };
  }

  /**
   * Find similar past executions
   */
  findSimilarExecutions(goal: string, limit: number = 5): ExecutionRecord[] {
    // Extract keywords from goal
    const keywords = goal.toLowerCase().split(/\s+/);
    const scored: { record: ExecutionRecord; score: number }[] = [];
    
    for (const record of this.records.values()) {
      let score = 0;
      const recordWords = record.goal.toLowerCase();
      
      for (const keyword of keywords) {
        if (recordWords.includes(keyword)) {
          score += 1;
        }
      }
      
      // Boost score for successful executions
      if (record.execution.status === 'completed') {
        score *= 1.5;
      }
      
      if (score > 0) {
        scored.push({ record, score });
      }
    }
    
    // Sort by score and return top matches
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map(s => s.record);
  }

  /**
   * Get best practices from successful executions
   */
  extractBestPractices(domain?: string): string[] {
    const executions = domain 
      ? this.findByDomain(domain).filter(e => e.execution.status === 'completed')
      : this.getSuccessfulExecutions();
    
    const learnings: string[] = [];
    for (const e of executions) {
      learnings.push(...e.learnings);
    }
    
    // Count occurrences and return most common
    const counts = new Map<string, number>();
    for (const learning of learnings) {
      const count = counts.get(learning) || 0;
      counts.set(learning, count + 1);
    }
    
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([learning]) => learning);
  }

  /**
   * Clear old history
   */
  clearHistory(olderThanDays?: number): number {
    if (!olderThanDays) {
      const count = this.records.size;
      this.records.clear();
      this.goalIndex.clear();
      this.domainIndex.clear();
      return count;
    }
    
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - olderThanDays);
    
    let cleared = 0;
    for (const [id, record] of this.records) {
      if (new Date(record.timestamp) < cutoff) {
        this.records.delete(id);
        cleared++;
      }
    }
    
    return cleared;
  }

  /**
   * Export history to JSON
   */
  exportHistory(): string {
    return JSON.stringify(Array.from(this.records.values()), null, 2);
  }

  /**
   * Import history from JSON
   */
  importHistory(json: string): void {
    const records: ExecutionRecord[] = JSON.parse(json);
    for (const record of records) {
      this.recordExecution(record);
    }
  }
}

// Singleton instance
export const executionHistory = new ExecutionHistory();
