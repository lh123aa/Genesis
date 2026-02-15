/**
 * Task Decomposer
 * 
 * Breaks down complex goals into hierarchical task structures.
 * Uses rule-based decomposition for predictable and fast results.
 */

import type { TaskAnalysis } from '../agents/planner.js';

/**
 * Task node in the decomposition tree
 */
export interface TaskNode {
  id: string;
  name: string;
  description: string;
  agentType: 'scout' | 'coder' | 'tester' | 'reviewer' | 'docs' | 'librarian' | 'oracle' | 'builder' | 'optimizer' | 'integrator';
  estimatedDuration: number; // in minutes
  dependencies: string[]; // IDs of tasks that must complete before this one
  subtasks?: TaskNode[]; // For recursive decomposition
  metadata?: {
    priority?: 'high' | 'medium' | 'low';
    requiresReview?: boolean;
    parallelizable?: boolean;
  };
}

/**
 * Decomposition strategy for different domains
 */
interface DecompositionPattern {
  domain: TaskAnalysis['domain'];
  patterns: {
    match: RegExp;
    tasks: Omit<TaskNode, 'id'>[];
  }[];
}

/**
 * Predefined decomposition patterns
 */
const DECOMPOSITION_PATTERNS: DecompositionPattern[] = [
  {
    domain: 'web_scraping',
    patterns: [
      {
        match: /scrape|extract|collect/i,
        tasks: [
          {
            name: 'Explore Target',
            description: 'Analyze website structure, identify data sources, understand navigation',
            agentType: 'scout',
            estimatedDuration: 30,
            dependencies: [],
            metadata: { priority: 'high', requiresReview: true },
          },
          {
            name: 'Design Extraction Strategy',
            description: 'Plan data extraction approach, selectors, and storage format',
            agentType: 'scout',
            estimatedDuration: 20,
            dependencies: ['explore-target'],
            metadata: { priority: 'high' },
          },
          {
            name: 'Implement Scraper',
            description: 'Write the actual scraping code with error handling and logging',
            agentType: 'coder',
            estimatedDuration: 60,
            dependencies: ['design-extraction-strategy'],
            metadata: { priority: 'high' },
          },
          {
            name: 'Test Extraction',
            description: 'Verify scraper works correctly with sample data',
            agentType: 'tester',
            estimatedDuration: 30,
            dependencies: ['implement-scraper'],
            metadata: { priority: 'medium', requiresReview: true },
          },
          {
            name: 'Run Full Extraction',
            description: 'Execute complete data collection with monitoring',
            agentType: 'coder',
            estimatedDuration: 45,
            dependencies: ['test-extraction'],
            metadata: { priority: 'high' },
          },
          {
            name: 'Generate Report',
            description: 'Create summary report of extracted data and any issues',
            agentType: 'docs',
            estimatedDuration: 20,
            dependencies: ['run-full-extraction'],
            metadata: { priority: 'low', parallelizable: true },
          },
        ],
      },
    ],
  },
  {
    domain: 'development',
    patterns: [
      {
        match: /implement|build|create|develop.*feature/i,
        tasks: [
          {
            name: 'Research and Design',
            description: 'Understand requirements, research approaches, design solution',
            agentType: 'scout',
            estimatedDuration: 45,
            dependencies: [],
            metadata: { priority: 'high', requiresReview: true },
          },
          {
            name: 'Write Implementation',
            description: 'Implement the feature following best practices',
            agentType: 'coder',
            estimatedDuration: 90,
            dependencies: ['research-and-design'],
            metadata: { priority: 'high' },
          },
          {
            name: 'Write Tests',
            description: 'Create unit and integration tests',
            agentType: 'tester',
            estimatedDuration: 45,
            dependencies: ['write-implementation'],
            metadata: { priority: 'high', parallelizable: true },
          },
          {
            name: 'Code Review',
            description: 'Review implementation for quality and standards',
            agentType: 'reviewer',
            estimatedDuration: 30,
            dependencies: ['write-implementation'],
            metadata: { priority: 'medium', requiresReview: true },
          },
          {
            name: 'Fix Issues',
            description: 'Address review comments and test failures',
            agentType: 'coder',
            estimatedDuration: 30,
            dependencies: ['write-tests', 'code-review'],
            metadata: { priority: 'high' },
          },
          {
            name: 'Document Feature',
            description: 'Write documentation and usage examples',
            agentType: 'docs',
            estimatedDuration: 30,
            dependencies: ['fix-issues'],
            metadata: { priority: 'low', parallelizable: true },
          },
        ],
      },
      {
        match: /refactor|optimize|improve/i,
        tasks: [
          {
            name: 'Analyze Current Code',
            description: 'Understand current implementation and identify issues',
            agentType: 'scout',
            estimatedDuration: 30,
            dependencies: [],
            metadata: { priority: 'high' },
          },
          {
            name: 'Plan Refactoring',
            description: 'Design refactoring approach with minimal risk',
            agentType: 'reviewer',
            estimatedDuration: 30,
            dependencies: ['analyze-current-code'],
            metadata: { priority: 'high', requiresReview: true },
          },
          {
            name: 'Execute Refactoring',
            description: 'Perform the code changes systematically',
            agentType: 'coder',
            estimatedDuration: 60,
            dependencies: ['plan-refactoring'],
            metadata: { priority: 'high' },
          },
          {
            name: 'Verify Behavior',
            description: 'Ensure functionality is preserved after changes',
            agentType: 'tester',
            estimatedDuration: 30,
            dependencies: ['execute-refactoring'],
            metadata: { priority: 'high', requiresReview: true },
          },
          {
            name: 'Performance Validation',
            description: 'Confirm improvements meet expectations',
            agentType: 'reviewer',
            estimatedDuration: 20,
            dependencies: ['verify-behavior'],
            metadata: { priority: 'medium' },
          },
        ],
      },
    ],
  },
  {
    domain: 'debugging',
    patterns: [
      {
        match: /bug|fix|error|issue|debug/i,
        tasks: [
          {
            name: 'Reproduce Issue',
            description: 'Create minimal reproduction of the bug',
            agentType: 'scout',
            estimatedDuration: 30,
            dependencies: [],
            metadata: { priority: 'high' },
          },
          {
            name: 'Analyze Root Cause',
            description: 'Investigate code to find the root cause',
            agentType: 'scout',
            estimatedDuration: 45,
            dependencies: ['reproduce-issue'],
            metadata: { priority: 'high', requiresReview: true },
          },
          {
            name: 'Implement Fix',
            description: 'Write the fix with proper tests',
            agentType: 'coder',
            estimatedDuration: 45,
            dependencies: ['analyze-root-cause'],
            metadata: { priority: 'high' },
          },
          {
            name: 'Test Fix',
            description: 'Verify fix resolves the issue without side effects',
            agentType: 'tester',
            estimatedDuration: 30,
            dependencies: ['implement-fix'],
            metadata: { priority: 'high', requiresReview: true },
          },
          {
            name: 'Regression Testing',
            description: 'Ensure no regressions in related functionality',
            agentType: 'tester',
            estimatedDuration: 20,
            dependencies: ['test-fix'],
            metadata: { priority: 'medium' },
          },
        ],
      },
    ],
  },
  {
    domain: 'documentation',
    patterns: [
      {
        match: /document|readme|guide|tutorial/i,
        tasks: [
          {
            name: 'Analyze Documentation Needs',
            description: 'Identify what needs to be documented and for whom',
            agentType: 'scout',
            estimatedDuration: 20,
            dependencies: [],
            metadata: { priority: 'high' },
          },
          {
            name: 'Gather Information',
            description: 'Collect code samples, API specs, usage examples',
            agentType: 'scout',
            estimatedDuration: 30,
            dependencies: ['analyze-documentation-needs'],
            metadata: { priority: 'medium' },
          },
          {
            name: 'Write Documentation',
            description: 'Create clear and comprehensive documentation',
            agentType: 'docs',
            estimatedDuration: 60,
            dependencies: ['gather-information'],
            metadata: { priority: 'high' },
          },
          {
            name: 'Review Documentation',
            description: 'Check for clarity, accuracy, and completeness',
            agentType: 'reviewer',
            estimatedDuration: 30,
            dependencies: ['write-documentation'],
            metadata: { priority: 'medium', requiresReview: true },
          },
          {
            name: 'Update Based on Feedback',
            description: 'Revise documentation based on review',
            agentType: 'docs',
            estimatedDuration: 20,
            dependencies: ['review-documentation'],
            metadata: { priority: 'medium' },
          },
        ],
      },
    ],
  },
  {
    domain: 'research',
    patterns: [
      {
        match: /research|investigate|explore|analyze/i,
        tasks: [
          {
            name: 'Define Research Scope',
            description: 'Clarify research questions and objectives',
            agentType: 'scout',
            estimatedDuration: 20,
            dependencies: [],
            metadata: { priority: 'high' },
          },
          {
            name: 'Literature Review',
            description: 'Survey existing solutions and literature',
            agentType: 'scout',
            estimatedDuration: 60,
            dependencies: ['define-research-scope'],
            metadata: { priority: 'high' },
          },
          {
            name: 'Deep Dive Analysis',
            description: 'Detailed analysis of promising approaches',
            agentType: 'scout',
            estimatedDuration: 90,
            dependencies: ['literature-review'],
            metadata: { priority: 'high' },
          },
          {
            name: 'Compile Findings',
            description: 'Synthesize research into structured report',
            agentType: 'docs',
            estimatedDuration: 45,
            dependencies: ['deep-dive-analysis'],
            metadata: { priority: 'medium', requiresReview: true },
          },
          {
            name: 'Review and Validate',
            description: 'Peer review of research findings',
            agentType: 'reviewer',
            estimatedDuration: 30,
            dependencies: ['compile-findings'],
            metadata: { priority: 'medium' },
          },
        ],
      },
    ],
  },
  {
    domain: 'automation',
    patterns: [
      {
        match: /automate|script|workflow|pipeline/i,
        tasks: [
          {
            name: 'Analyze Current Process',
            description: 'Understand the manual process to be automated',
            agentType: 'scout',
            estimatedDuration: 30,
            dependencies: [],
            metadata: { priority: 'high' },
          },
          {
            name: 'Design Automation',
            description: 'Plan the automation workflow and tool selection',
            agentType: 'scout',
            estimatedDuration: 30,
            dependencies: ['analyze-current-process'],
            metadata: { priority: 'high', requiresReview: true },
          },
          {
            name: 'Implement Automation',
            description: 'Build the automation scripts and workflows',
            agentType: 'coder',
            estimatedDuration: 60,
            dependencies: ['design-automation'],
            metadata: { priority: 'high' },
          },
          {
            name: 'Test Automation',
            description: 'Verify automation works correctly and handles errors',
            agentType: 'tester',
            estimatedDuration: 30,
            dependencies: ['implement-automation'],
            metadata: { priority: 'high', requiresReview: true },
          },
          {
            name: 'Document Process',
            description: 'Document how to use and maintain the automation',
            agentType: 'docs',
            estimatedDuration: 20,
            dependencies: ['test-automation'],
            metadata: { priority: 'low' },
          },
        ],
      },
    ],
  },
];

/**
 * Task Decomposer class
 */
export class TaskDecomposer {
  private taskCounter: number = 0;

  /**
   * Decompose a task analysis into task nodes
   */
  decompose(analysis: TaskAnalysis): TaskNode[] {
    this.taskCounter = 0;

    // Find matching pattern for the domain
    const pattern = this.findPattern(analysis);

    if (pattern) {
      return this.instantiateTasks(pattern, analysis);
    }

    // Fallback to generic decomposition
    return this.genericDecomposition(analysis);
  }

  /**
   * Find matching decomposition pattern
   */
  private findPattern(analysis: TaskAnalysis): DecompositionPattern['patterns'][0] | null {
    const domainPattern = DECOMPOSITION_PATTERNS.find(p => p.domain === analysis.domain);

    if (!domainPattern) return null;

    // Find first matching pattern
    for (const pattern of domainPattern.patterns) {
      if (pattern.match.test(analysis.goal)) {
        return pattern;
      }
    }

    // Return first pattern as default for this domain
    return domainPattern.patterns[0] || null;
  }

  /**
   * Instantiate task nodes from pattern
   */
  private instantiateTasks(
    pattern: DecompositionPattern['patterns'][0],
    analysis: TaskAnalysis
  ): TaskNode[] {
    const nodes: TaskNode[] = [];
    const idMap = new Map<string, string>();

    // First pass: create nodes and assign IDs
    for (const taskTemplate of pattern.tasks) {
      const id = `task-${++this.taskCounter}`;
      idMap.set(this.slugify(taskTemplate.name), id);

      const node: TaskNode = {
        id,
        name: taskTemplate.name,
        description: this.customizeDescription(taskTemplate.description, analysis),
        agentType: taskTemplate.agentType,
        estimatedDuration: this.adjustDuration(taskTemplate.estimatedDuration, analysis.complexity),
        dependencies: [], // Will be updated in second pass
        metadata: taskTemplate.metadata,
      };

      nodes.push(node);
    }

    // Second pass: resolve dependencies
    for (let i = 0; i < pattern.tasks.length; i++) {
      const taskTemplate = pattern.tasks[i];
      const node = nodes[i];

      // Map dependency names to IDs
      node.dependencies = taskTemplate.dependencies.map(depName => {
        const depId = idMap.get(depName);
        if (!depId) {
          console.warn(`Warning: Unknown dependency "${depName}" for task "${node.name}"`);
          return '';
        }
        return depId;
      }).filter(id => id !== '');
    }

    return nodes;
  }

  /**
   * Create a generic decomposition when no pattern matches
   */
  private genericDecomposition(analysis: TaskAnalysis): TaskNode[] {
    const nodes: TaskNode[] = [];

    // Always start with analysis
    nodes.push({
      id: `task-${++this.taskCounter}`,
      name: 'Analyze Requirements',
      description: `Understand the goal: ${analysis.goal}`,
      agentType: 'scout',
      estimatedDuration: 30,
      dependencies: [],
      metadata: { priority: 'high' },
    });

    // Add implementation if needed
    if (analysis.requiresImplementation) {
      nodes.push({
        id: `task-${++this.taskCounter}`,
        name: 'Implement Solution',
        description: 'Build the solution based on analysis',
        agentType: 'coder',
        estimatedDuration: analysis.complexity === 'simple' ? 30 : analysis.complexity === 'moderate' ? 60 : 120,
        dependencies: [nodes[nodes.length - 1].id],
        metadata: { priority: 'high' },
      });
    }

    // Add testing if needed
    if (analysis.requiresTesting) {
      nodes.push({
        id: `task-${++this.taskCounter}`,
        name: 'Validate Solution',
        description: 'Test and verify the implementation',
        agentType: 'tester',
        estimatedDuration: 30,
        dependencies: nodes.length > 1 ? [nodes[nodes.length - 1].id] : [],
        metadata: { priority: 'medium' },
      });
    }

    // Add review
    nodes.push({
      id: `task-${++this.taskCounter}`,
      name: 'Review and Finalize',
      description: 'Final review and quality check',
      agentType: 'reviewer',
      estimatedDuration: 20,
      dependencies: nodes.length > 1 ? [nodes[nodes.length - 1].id] : [],
      metadata: { priority: 'medium' },
    });

    return nodes;
  }

  /**
   * Customize task description with analysis context
   */
  private customizeDescription(baseDescription: string, analysis: TaskAnalysis): string {
    // Add context about required tools if any
    if (analysis.requiredTools && analysis.requiredTools.length > 0) {
      return `${baseDescription}\n\nRequired tools: ${analysis.requiredTools.join(', ')}`;
    }
    return baseDescription;
  }

  /**
   * Adjust duration based on complexity
   */
  private adjustDuration(baseDuration: number, complexity: TaskAnalysis['complexity']): number {
    const multipliers: Record<TaskAnalysis['complexity'], number> = {
      simple: 0.7,
      moderate: 1.0,
      complex: 1.5,
      very_complex: 2.5,
    };

    return Math.round(baseDuration * multipliers[complexity]);
  }

  /**
   * Convert name to slug for ID generation
   */
  private slugify(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  /**
   * Calculate total estimated duration for a task tree
   */
  calculateTotalDuration(nodes: TaskNode[]): number {
    // Build dependency graph
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const visited = new Set<string>();
    const durations = new Map<string, number>();

    const getDuration = (nodeId: string): number => {
      if (durations.has(nodeId)) {
        return durations.get(nodeId)!;
      }

      if (visited.has(nodeId)) {
        return 0; // Circular dependency, skip
      }

      visited.add(nodeId);
      const node = nodeMap.get(nodeId);

      if (!node) return 0;

      // Calculate dependency duration (max of dependencies for parallel)
      const depDuration = node.dependencies.length > 0
        ? Math.max(...node.dependencies.map(depId => getDuration(depId)))
        : 0;

      const total = depDuration + node.estimatedDuration;
      durations.set(nodeId, total);

      return total;
    };

    // Calculate for all root nodes (those not depended upon)
    const dependedOn = new Set(nodes.flatMap(n => n.dependencies));
    const rootNodes = nodes.filter(n => !dependedOn.has(n.id));

    if (rootNodes.length === 0) {
      // No dependencies, calculate for all
      return Math.max(...nodes.map(n => getDuration(n.id)));
    }

    return Math.max(...rootNodes.map(n => getDuration(n.id)));
  }
}

// Singleton instance
export const taskDecomposer = new TaskDecomposer();
