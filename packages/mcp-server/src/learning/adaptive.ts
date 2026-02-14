/**
 * Adaptive Learning System
 * 
 * Automatically learns from each execution to improve future planning.
 * Runs in the background to collect insights without explicit triggers.
 */

import { executionHistory } from './history.js';
import { learningEngine } from './engine.js';
import { knowledgeBase } from './knowledge.js';

export interface ExecutionInsight {
  timestamp: string;
  goal: string;
  domain: string;
  success: boolean;
  duration?: number;
  issues?: string[];
  learnings: string[];
}

/**
 * Adaptive Learning Controller
 * 
 * Monitors executions and extracts learnings automatically.
 */
export class AdaptiveLearning {
  private insights: ExecutionInsight[] = [];
  private lastAnalysis: string = '';
  private analysisInterval: number = 5; // Analyze every N executions
  
  /**
   * Record an execution result for learning
   */
  recordExecution(result: {
    goal: string;
    domain: string;
    success: boolean;
    duration?: number;
    issues?: string[];
  }): void {
    const insight: ExecutionInsight = {
      timestamp: new Date().toISOString(),
      goal: result.goal,
      domain: result.domain,
      success: result.success,
      duration: result.duration,
      issues: result.issues,
      learnings: [],
    };
    
    this.insights.push(insight);
    
    // Auto-analyze if we have enough insights
    if (this.insights.length % this.analysisInterval === 0) {
      this.triggerAnalysis();
    }
  }
  
  /**
   * Extract learnings from recent executions
   */
  extractLearnings(): string[] {
    const learnings: string[] = [];
    
    // Analyze recent executions
    const recent = this.insights.slice(-10);
    
    // Group by success/failure
    const successful = recent.filter(i => i.success);
    const failed = recent.filter(i => !i.success);
    
    // Extract patterns from successful executions
    if (successful.length >= 3) {
      const commonDomains = this.getCommonElements(successful.map(i => i.domain));
      if (commonDomains.length > 0) {
        learnings.push(`✅ ${commonDomains[0]} tasks have high success rate`);
      }
    }
    
    // Extract patterns from failed executions
    if (failed.length >= 1) {
      for (const fail of failed) {
        if (fail.issues && fail.issues.length > 0) {
          learnings.push(`⚠️  Issue detected in ${fail.domain}: ${fail.issues[0]}`);
        }
      }
    }
    
    // Time-based insights
    const withDuration = recent.filter(i => i.duration);
    if (withDuration.length >= 3) {
      const avgDuration = withDuration.reduce((sum, i) => sum + (i.duration || 0), 0) / withDuration.length;
      learnings.push(`⏱️  Average execution time: ${Math.round(avgDuration / 60000)} minutes`);
    }
    
    return learnings;
  }
  
  /**
   * Trigger background analysis
   */
  private triggerAnalysis(): void {
    // Don't analyze too frequently
    const now = Date.now();
    if (this.lastAnalysis && now - parseInt(this.lastAnalysis) < 60000) {
      return; // Only analyze once per minute
    }
    this.lastAnalysis = now.toString();
    
    // Run learning engine analysis
    const newLearnings = learningEngine.analyzeHistory();
    
    if (newLearnings.length > 0) {
      console.log(`🧠 Adaptive Learning: Found ${newLearnings.length} new insights`);
    }
  }
  
  /**
   * Get statistics for display
   */
  getStatistics(): {
    totalInsights: number;
    successRate: number;
    averageDuration: number;
    topDomains: string[];
  } {
    const total = this.insights.length;
    const successful = this.insights.filter(i => i.success).length;
    const withDuration = this.insights.filter(i => i.duration);
    const avgDuration = withDuration.length > 0
      ? withDuration.reduce((sum, i) => sum + (i.duration || 0), 0) / withDuration.length
      : 0;
    
    return {
      totalInsights: total,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      averageDuration: avgDuration,
      topDomains: this.getTopDomains(),
    };
  }
  
  /**
   * Get most common domains
   */
  private getTopDomains(): string[] {
    const domainCounts = new Map<string, number>();
    for (const insight of this.insights) {
      domainCounts.set(insight.domain, (domainCounts.get(insight.domain) || 0) + 1);
    }
    return Array.from(domainCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([domain]) => domain);
  }
  
  /**
   * Get common elements from array
   */
  private getCommonElements(arr: string[]): string[] {
    const counts = new Map<string, number>();
    for (const item of arr) {
      counts.set(item, (counts.get(item) || 0) + 1);
    }
    return Array.from(counts.entries())
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .map(([item]) => item);
  }
  
  /**
   * Get recent insights for display
   */
  getRecentInsights(count: number = 5): ExecutionInsight[] {
    return this.insights.slice(-count);
  }
  
  /**
   * Clear old insights (keep last N)
   */
  prune(maxInsights: number = 100): void {
    if (this.insights.length > maxInsights) {
      this.insights = this.insights.slice(-maxInsights);
    }
  }
}

// Singleton instance
export const adaptiveLearning = new AdaptiveLearning();

export default adaptiveLearning;
