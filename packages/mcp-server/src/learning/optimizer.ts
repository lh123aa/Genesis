/**
 * Optimizer
 * 
 * Applies learnings to optimize future task planning and execution.
 * The action arm of the learning system.
 */

import type { TaskAnalysis } from '../agents/planner.js';
import type { TaskNode } from '../planning/decomposer.js';
import type { WorkflowDefinition } from '../planning/workflow-generator.js';
import { learningEngine, type Learning } from './engine.js';
import { executionHistory } from './history.js';

export interface OptimizationContext {
  goal: string;
  analysis: TaskAnalysis;
  tasks: TaskNode[];
  workflow: WorkflowDefinition;
}

export interface OptimizationResult {
  optimized: boolean;
  changes: OptimizationChange[];
  warnings: string[];
  reasoning: string[];
  newEstimate?: number;
}

export interface OptimizationChange {
  type: 'estimation' | 'agent_swap' | 'task_reorder' | 'tool_swap' | 'add_step' | 'remove_step';
  description: string;
  original: string;
  updated: string;
  confidence: number;
}

/**
 * Optimizer class
 */
export class Optimizer {
  /**
   * Optimize a plan based on historical learnings
   */
  optimize(context: OptimizationContext): OptimizationResult {
    const changes: OptimizationChange[] = [];
    const warnings: string[] = [];
    const reasoning: string[] = [];
    let newEstimate: number | undefined;

    // 1. Optimize estimations
    const estimationChanges = this.optimizeEstimations(context);
    changes.push(...estimationChanges.changes);
    reasoning.push(...estimationChanges.reasoning);
    if (estimationChanges.newEstimate) {
      newEstimate = estimationChanges.newEstimate;
    }

    // 2. Optimize agent assignments
    const agentChanges = this.optimizeAgentAssignments(context);
    changes.push(...agentChanges.changes);
    warnings.push(...agentChanges.warnings);
    reasoning.push(...agentChanges.reasoning);

    // 3. Optimize tool selection
    const toolChanges = this.optimizeToolSelection(context);
    changes.push(...toolChanges.changes);
    reasoning.push(...toolChanges.reasoning);

    // 4. Check for missing steps based on patterns
    const stepChanges = this.optimizeTaskStructure(context);
    changes.push(...stepChanges.changes);
    reasoning.push(...stepChanges.reasoning);

    return {
      optimized: changes.length > 0,
      changes,
      warnings,
      reasoning,
      newEstimate,
    };
  }

  /**
   * Optimize time estimations based on historical data
   */
  private optimizeEstimations(context: OptimizationContext): {
    changes: OptimizationChange[];
    reasoning: string[];
    newEstimate?: number;
  } {
    const changes: OptimizationChange[] = [];
    const reasoning: string[] = [];

    // Check for estimation learnings for this domain
    const domainLearnings = learningEngine.getLearningsByDomain(context.analysis.domain)
      .filter(l => l.type === 'optimization' && l.description.includes('estimate'));

    if (domainLearnings.length > 0) {
      const bestLearning = domainLearnings.sort((a, b) => b.confidence - a.confidence)[0];
      
      // Parse adjustment factor
      const factorMatch = bestLearning.description.match(/(\d+\.?\d*)%/);
      if (factorMatch) {
        const percent = parseFloat(factorMatch[1]);
        const factor = bestLearning.description.includes('underestimate') 
          ? 1 + (percent / 100) 
          : 1 - (percent / 100);

        const originalEstimate = context.workflow.metadata?.estimatedDuration || 0;
        const adjustedEstimate = Math.round(originalEstimate * factor);

        changes.push({
          type: 'estimation',
          description: `Adjusted time estimate based on historical data`,
          original: `${originalEstimate} minutes`,
          updated: `${adjustedEstimate} minutes`,
          confidence: bestLearning.confidence,
        });

        reasoning.push(`Historical data shows ${context.analysis.domain} tasks typically ${bestLearning.description.includes('underestimate') ? 'take longer' : 'take less time'} than estimated`);

        return { changes, reasoning, newEstimate: adjustedEstimate };
      }
    }

    // Check similar past executions
    const similar = executionHistory.findSimilarExecutions(context.goal, 5);
    const completedSimilar = similar.filter(s => s.execution.status === 'completed' && s.execution.actualDuration);

    if (completedSimilar.length >= 3) {
      const avgActual = completedSimilar.reduce((sum, s) => sum + s.execution.actualDuration!, 0) / completedSimilar.length;
      const originalEstimate = context.workflow.metadata?.estimatedDuration || 0;

      if (Math.abs(avgActual - originalEstimate) / originalEstimate > 0.2) {
        changes.push({
          type: 'estimation',
          description: `Adjusted based on similar past executions`,
          original: `${originalEstimate} minutes`,
          updated: `${Math.round(avgActual)} minutes`,
          confidence: 75,
        });

        reasoning.push(`Found ${completedSimilar.length} similar completed executions with average duration of ${Math.round(avgActual)} minutes`);

        return { changes, reasoning, newEstimate: Math.round(avgActual) };
      }
    }

    return { changes, reasoning };
  }

  /**
   * Optimize agent assignments based on performance history
   */
  private optimizeAgentAssignments(context: OptimizationContext): {
    changes: OptimizationChange[];
    warnings: string[];
    reasoning: string[];
  } {
    const changes: OptimizationChange[] = [];
    const warnings: string[] = [];
    const reasoning: string[] = [];

    for (const task of context.tasks) {
      const agentPerf = executionHistory.getAgentPerformance(task.agentType);

      // Check if this agent has reliability issues
      if (agentPerf.successRate < 60 && agentPerf.totalTasks >= 5) {
        warnings.push(`Agent '${task.agentType}' has low success rate (${agentPerf.successRate.toFixed(1)}%). Consider alternatives.`);

        // Suggest retry logic
        changes.push({
          type: 'add_step',
          description: `Added retry logic for ${task.agentType} task`,
          original: `${task.name} (single attempt)`,
          updated: `${task.name} (with retries)`,
          confidence: 70,
        });
      }

      // Check for common errors
      if (agentPerf.commonErrors.length > 0) {
        reasoning.push(`Agent '${task.agentType}' commonly encounters: ${agentPerf.commonErrors[0]}`);
      }
    }

    // Check learning engine for agent insights
    const agentLearnings = learningEngine.getLearningsByType('insight')
      .filter(l => l.description.includes('retry') || l.description.includes('reliability'));

    for (const learning of agentLearnings) {
      const agentMatch = learning.description.match(/Agent '(\w+)'/);
      if (agentMatch) {
        const agentType = agentMatch[1];
        const hasTask = context.tasks.some(t => t.agentType === agentType);
        
        if (hasTask) {
          warnings.push(`Learning: ${learning.description}`);
        }
      }
    }

    return { changes, warnings, reasoning };
  }

  /**
   * Optimize tool selection
   */
  private optimizeToolSelection(context: OptimizationContext): {
    changes: OptimizationChange[];
    reasoning: string[];
  } {
    const changes: OptimizationChange[] = [];
    const reasoning: string[] = [];

    // Check for tool effectiveness learnings
    const toolLearnings = learningEngine.getLearningsByType('best_practice')
      .filter(l => l.description.includes('reliable'));

    for (const learning of toolLearnings) {
      const toolMatch = learning.description.match(/Tool '(\w+)'/);
      if (toolMatch && learning.confidence > 80) {
        reasoning.push(`Tool '${toolMatch[1]}' has proven highly reliable (${learning.confidence.toFixed(0)}% confidence)`);
      }
    }

    // Check for tool issues
    const issueLearnings = learningEngine.getLearningsByType('issue')
      .filter(l => l.description.includes('Tool'));

    for (const learning of issueLearnings) {
      const toolMatch = learning.description.match(/Tool '(\w+)'/);
      if (toolMatch) {
        reasoning.push(`Warning: Tool '${toolMatch[1]}' has known issues`);
      }
    }

    return { changes, reasoning };
  }

  /**
   * Optimize task structure based on patterns
   */
  private optimizeTaskStructure(context: OptimizationContext): {
    changes: OptimizationChange[];
    reasoning: string[];
  } {
    const changes: OptimizationChange[] = [];
    const reasoning: string[] = [];

    // Get patterns for this domain
    const patterns = learningEngine.getPatternsForDomain(context.analysis.domain);

    for (const pattern of patterns) {
      if (pattern.successRate > 75) {
        reasoning.push(`Domain '${context.analysis.domain}' has ${pattern.successRate.toFixed(0)}% success rate based on ${pattern.frequency} executions`);

        // Check if we're following the successful pattern
        const hasReviewStep = context.tasks.some(t => 
          t.agentType === 'reviewer' || t.name.toLowerCase().includes('review')
        );

        if (!hasReviewStep && pattern.frequency >= 5) {
          changes.push({
            type: 'add_step',
            description: 'Added review step based on success patterns',
            original: 'Workflow without review',
            updated: 'Workflow with review step',
            confidence: pattern.successRate,
          });

          reasoning.push(`Adding review step improves success rate in ${context.analysis.domain} tasks`);
        }
      }
    }

    // Check for missing common steps
    const hasTestStep = context.tasks.some(t => 
      t.agentType === 'tester' || t.name.toLowerCase().includes('test')
    );

    if (!hasTestStep && context.analysis.requiresTesting) {
      changes.push({
        type: 'add_step',
        description: 'Added testing step (detected testing requirement)',
        original: 'No testing step',
        updated: 'Includes testing step',
        confidence: 85,
      });

      reasoning.push('Task analysis indicates testing is required but no test step was found');
    }

    return { changes, reasoning };
  }

  /**
   * Get optimization recommendations for a goal
   */
  getRecommendations(goal: string, domain?: string): string[] {
    const recommendations: string[] = [];

    // Find similar executions
    const similar = executionHistory.findSimilarExecutions(goal, 3);
    
    if (similar.length > 0) {
      const successful = similar.filter(s => s.execution.status === 'completed');
      if (successful.length > 0) {
        recommendations.push(`💡 ${successful.length} similar tasks completed successfully in the past`);
        
        // Extract learnings
        for (const record of successful) {
          if (record.learnings.length > 0) {
            recommendations.push(`   → ${record.learnings[0]}`);
          }
        }
      }
    }

    // Get domain-specific learnings
    if (domain) {
      const domainLearnings = learningEngine.getLearningsByDomain(domain)
        .filter(l => l.confidence > 70)
        .slice(0, 3);

      if (domainLearnings.length > 0) {
        recommendations.push(`\n📊 Learnings from ${domain} tasks:`);
        for (const learning of domainLearnings) {
          recommendations.push(`   • ${learning.description}`);
        }
      }
    }

    // Get general best practices
    const bestPractices = learningEngine.getLearningsByType('best_practice')
      .filter(l => l.confidence > 80)
      .slice(0, 2);

    if (bestPractices.length > 0) {
      recommendations.push(`\n⭐ Best practices:`);
      for (const practice of bestPractices) {
        recommendations.push(`   • ${practice.description}`);
      }
    }

    return recommendations;
  }

  /**
   * Predict success probability
   */
  predictSuccess(context: OptimizationContext): {
    probability: number;
    factors: string[];
  } {
    const factors: string[] = [];
    let score = 50; // Base probability

    // Factor 1: Domain success rate
    const domainRecords = executionHistory.findByDomain(context.analysis.domain);
    if (domainRecords.length > 0) {
      const successRate = (domainRecords.filter(r => r.execution.status === 'completed').length / domainRecords.length) * 100;
      score += (successRate - 50) * 0.3;
      factors.push(`Domain '${context.analysis.domain}' has ${successRate.toFixed(0)}% historical success rate`);
    }

    // Factor 2: Similar executions
    const similar = executionHistory.findSimilarExecutions(context.goal, 5);
    if (similar.length > 0) {
      const similarSuccess = (similar.filter(r => r.execution.status === 'completed').length / similar.length) * 100;
      score += (similarSuccess - 50) * 0.2;
      factors.push(`Found ${similar.length} similar executions with ${similarSuccess.toFixed(0)}% success`);
    }

    // Factor 3: Complexity
    if (context.analysis.complexity === 'simple') {
      score += 10;
      factors.push('Low complexity increases success probability');
    } else if (context.analysis.complexity === 'very_complex') {
      score -= 15;
      factors.push('High complexity reduces success probability');
    }

    // Factor 4: Available tools
    const hasRequiredTools = context.analysis.requiredTools?.every(toolId => {
      // In real implementation, check toolRegistry
      return true;
    });
    if (!hasRequiredTools) {
      score -= 20;
      factors.push('Missing required tools may impact success');
    }

    return {
      probability: Math.max(0, Math.min(100, score)),
      factors,
    };
  }

  /**
   * Compare with best practices
   */
  compareWithBestPractices(context: OptimizationContext): {
    alignment: number;
    gaps: string[];
    suggestions: string[];
  } {
    const gaps: string[] = [];
    const suggestions: string[] = [];
    let alignment = 100;

    // Check against domain best practices from history
    const bestPractices = executionHistory.extractBestPractices(context.analysis.domain);

    for (const practice of bestPractices) {
      // Simple keyword matching (in real implementation, use more sophisticated analysis)
      const practiceKeywords = practice.toLowerCase().split(' ');
      const hasPractice = context.tasks.some(task => 
        practiceKeywords.some((kw: string) => task.description.toLowerCase().includes(kw))
      );

      if (!hasPractice) {
        gaps.push(`Missing best practice: ${practice}`);
        suggestions.push(`Consider adding: ${practice}`);
        alignment -= 10;
      }
    }

    return {
      alignment: Math.max(0, alignment),
      gaps,
      suggestions,
    };
  }
}

// Singleton instance
export const optimizer = new Optimizer();
