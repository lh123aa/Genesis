/**
 * Workflow Generator
 * 
 * Converts task trees into executable workflow definitions.
 */

import type { TaskNode } from './decomposer.js';

/**
 * Workflow definition (compatible with existing WorkflowCreateArgs)
 */
export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  tasks: WorkflowTask[];
  variables?: WorkflowVariable[];
  metadata?: {
    generatedAt: string;
    sourceGoal: string;
    estimatedDuration: number;
    totalTasks: number;
  };
}

export interface WorkflowTask {
  id: string;
  agentType: 'scout' | 'coder' | 'tester' | 'reviewer' | 'docs' | 'librarian' | 'oracle' | 'builder' | 'optimizer' | 'integrator';
  description: string;
  template: string;
  dependencies?: string[];
  estimatedDuration?: number;
  metadata?: {
    priority?: 'high' | 'medium' | 'low';
    parallelizable?: boolean;
  };
}

export interface WorkflowVariable {
  name: string;
  description: string;
  required: boolean;
  defaultValue?: string;
}

/**
 * Generated plan structure
 */
export interface GeneratedPlan {
  planId: string;
  goal: string;
  analysis: {
    domain: string;
    complexity: string;
    estimatedSteps: number;
  };
  workflow: WorkflowDefinition;
  executionStrategy: {
    parallelGroups: string[][];
    criticalPath: string[];
    estimatedTotalDuration: number;
  };
}

/**
 * Workflow Generator class
 */
export class WorkflowGenerator {
  /**
   * Generate a workflow from task nodes
   */
  generateWorkflow(
    goal: string,
    taskNodes: TaskNode[],
    options?: {
      name?: string;
      description?: string;
    }
  ): WorkflowDefinition {
    const workflowId = `wf-${Date.now()}`;
    
    // Convert task nodes to workflow tasks
    const tasks = taskNodes.map(node => this.convertNodeToTask(node));

    // Calculate total estimated duration
    const totalDuration = this.calculateWorkflowDuration(taskNodes);

    return {
      id: workflowId,
      name: options?.name || this.generateWorkflowName(goal),
      description: options?.description || `Auto-generated workflow for: ${goal}`,
      tasks,
      metadata: {
        generatedAt: new Date().toISOString(),
        sourceGoal: goal,
        estimatedDuration: totalDuration,
        totalTasks: tasks.length,
      },
    };
  }

  /**
   * Generate a complete execution plan
   */
  generatePlan(
    goal: string,
    analysis: {
      domain: string;
      complexity: string;
      estimatedSteps: number;
    },
    taskNodes: TaskNode[]
  ): GeneratedPlan {
    const planId = `plan-${Date.now()}`;
    const workflow = this.generateWorkflow(goal, taskNodes);

    // Determine execution strategy
    const executionStrategy = this.determineExecutionStrategy(taskNodes);

    return {
      planId,
      goal,
      analysis,
      workflow,
      executionStrategy,
    };
  }

  /**
   * Convert a task node to workflow task format
   */
  private convertNodeToTask(node: TaskNode): WorkflowTask {
    // Generate template based on agent type
    const template = this.generateTaskTemplate(node);

    return {
      id: node.id,
      agentType: node.agentType,
      description: node.description,
      template,
      dependencies: node.dependencies.length > 0 ? node.dependencies : undefined,
      estimatedDuration: node.estimatedDuration,
      metadata: {
        priority: node.metadata?.priority || 'medium',
        parallelizable: node.metadata?.parallelizable || false,
      },
    };
  }

  /**
   * Generate task template based on agent type and task
   */
  private generateTaskTemplate(node: TaskNode): string {
    const agentType = node.agentType;
    const name = node.name;

    const templates: Record<string, (name: string, description: string) => string> = {
      scout: (name, desc) => `
## ${name}

**Objective:** ${desc}

### Steps
1. Gather all relevant information
2. Analyze findings
3. Document insights
4. Provide recommendations

### Output
- Research findings
- Analysis summary
- Recommended approach
`.trim(),

      coder: (name, desc) => `
## ${name}

**Objective:** ${desc}

### Implementation Checklist
- [ ] Understand requirements
- [ ] Write clean, maintainable code
- [ ] Add error handling
- [ ] Include logging
- [ ] Test manually
- [ ] Commit changes

### Output
- Implementation code
- Brief documentation
- Test results
`.trim(),

      tester: (name, desc) => `
## ${name}

**Objective:** ${desc}

### Testing Checklist
- [ ] Write test cases covering happy path
- [ ] Write test cases for edge cases
- [ ] Write test cases for error scenarios
- [ ] Run tests and verify pass
- [ ] Check code coverage
- [ ] Document any bugs found

### Output
- Test files
- Test results
- Bug reports (if any)
`.trim(),

      reviewer: (name, desc) => `
## ${name}

**Objective:** ${desc}

### Review Checklist
- [ ] Check code quality and style
- [ ] Verify logic correctness
- [ ] Assess performance implications
- [ ] Check security considerations
- [ ] Review test coverage
- [ ] Verify documentation completeness

### Output
- Review comments
- Approval or revision request
- Suggestions for improvement
`.trim(),

      docs: (name, desc) => `
## ${name}

**Objective:** ${desc}

### Documentation Checklist
- [ ] Identify target audience
- [ ] Outline key sections
- [ ] Write clear, concise content
- [ ] Add code examples
- [ ] Include diagrams if needed
- [ ] Review for accuracy

### Output
- Documentation file(s)
- Usage examples
- Updated README if applicable
`.trim(),
    };

    const templateGenerator = templates[agentType] || templates.scout;
    return templateGenerator(name, node.description);
  }

  /**
   * Determine execution strategy (parallel groups, critical path)
   */
  private determineExecutionStrategy(taskNodes: TaskNode[]): GeneratedPlan['executionStrategy'] {
    // Build dependency graph
    const dependencyGraph = new Map<string, Set<string>>();
    const reverseGraph = new Map<string, Set<string>>();

    for (const node of taskNodes) {
      dependencyGraph.set(node.id, new Set(node.dependencies));
      
      // Build reverse graph
      for (const dep of node.dependencies) {
        if (!reverseGraph.has(dep)) {
          reverseGraph.set(dep, new Set());
        }
        reverseGraph.get(dep)!.add(node.id);
      }
    }

    // Find parallel groups (tasks with same dependencies can run in parallel)
    const dependencyKeyMap = new Map<string, string[]>();
    
    for (const node of taskNodes) {
      const depKey = [...node.dependencies].sort().join(',');
      if (!dependencyKeyMap.has(depKey)) {
        dependencyKeyMap.set(depKey, []);
      }
      dependencyKeyMap.get(depKey)!.push(node.id);
    }

    const parallelGroups = Array.from(dependencyKeyMap.values())
      .filter(group => group.length > 1);

    // Find critical path (longest path in terms of duration)
    const criticalPath = this.findCriticalPath(taskNodes);

    // Calculate total duration
    const totalDuration = this.calculateWorkflowDuration(taskNodes);

    return {
      parallelGroups,
      criticalPath,
      estimatedTotalDuration: totalDuration,
    };
  }

  /**
   * Find the critical path (longest duration path)
   */
  private findCriticalPath(taskNodes: TaskNode[]): string[] {
    // Build duration map
    const durationMap = new Map(taskNodes.map(n => [n.id, n.estimatedDuration]));
    
    // Build dependency graph
    const depsMap = new Map(taskNodes.map(n => [n.id, n.dependencies]));

    // Calculate earliest finish time for each node
    const earliestFinish = new Map<string, number>();
    const pathTo = new Map<string, string[]>();

    const calculateEarliest = (nodeId: string, visited: Set<string>): number => {
      if (earliestFinish.has(nodeId)) {
        return earliestFinish.get(nodeId)!;
      }

      if (visited.has(nodeId)) {
        return 0; // Circular, break
      }

      visited.add(nodeId);
      const deps = depsMap.get(nodeId) || [];
      
      const maxDepFinish = deps.length > 0
        ? Math.max(...deps.map(depId => calculateEarliest(depId, new Set(visited))))
        : 0;

      const finish = maxDepFinish + (durationMap.get(nodeId) || 0);
      earliestFinish.set(nodeId, finish);

      // Track path
      const longestDep = deps.length > 0
        ? deps.reduce((a, b) => 
            (earliestFinish.get(a) || 0) > (earliestFinish.get(b) || 0) ? a : b
          )
        : null;
      
      pathTo.set(nodeId, longestDep ? [...(pathTo.get(longestDep) || []), longestDep] : []);

      return finish;
    };

    // Calculate for all nodes
    for (const node of taskNodes) {
      calculateEarliest(node.id, new Set());
    }

    // Find node with maximum earliest finish
    let maxFinish = 0;
    let endNode = '';
    for (const [nodeId, finish] of earliestFinish) {
      if (finish > maxFinish) {
        maxFinish = finish;
        endNode = nodeId;
      }
    }

    // Reconstruct path
    const path: string[] = [];
    let current = endNode;
    while (current) {
      path.unshift(current);
      const deps = depsMap.get(current) || [];
      const longestDep = deps.length > 0
        ? deps.reduce((a, b) => 
            (earliestFinish.get(a) || 0) > (earliestFinish.get(b) || 0) ? a : b
          )
        : null;
      current = longestDep || '';
    }

    return path;
  }

  /**
   * Calculate total workflow duration
   */
  private calculateWorkflowDuration(taskNodes: TaskNode[]): number {
    // Build dependency graph
    const depsMap = new Map(taskNodes.map(n => [n.id, n.dependencies]));
    const durationMap = new Map(taskNodes.map(n => [n.id, n.estimatedDuration]));
    
    const earliestFinish = new Map<string, number>();

    const calculate = (nodeId: string, visited: Set<string>): number => {
      if (earliestFinish.has(nodeId)) {
        return earliestFinish.get(nodeId)!;
      }

      if (visited.has(nodeId)) {
        return 0;
      }

      visited.add(nodeId);
      const deps = depsMap.get(nodeId) || [];
      const maxDepFinish = deps.length > 0
        ? Math.max(...deps.map(depId => calculate(depId, new Set(visited))))
        : 0;

      const finish = maxDepFinish + (durationMap.get(nodeId) || 0);
      earliestFinish.set(nodeId, finish);
      return finish;
    };

    // Calculate for all nodes
    for (const node of taskNodes) {
      calculate(node.id, new Set());
    }

    return Math.max(...earliestFinish.values());
  }

  /**
   * Generate a name for the workflow
   */
  private generateWorkflowName(goal: string): string {
    // Extract key action words
    const actionWords = ['scrape', 'implement', 'build', 'create', 'fix', 'debug', 
                        'document', 'research', 'automate', 'refactor', 'optimize'];
    
    const words = goal.toLowerCase().split(/\s+/);
    const action = actionWords.find(word => words.includes(word)) || 'process';
    
    // Extract subject (next 2-3 words after action, or first noun)
    const actionIndex = words.indexOf(action);
    const subject = words.slice(actionIndex + 1, actionIndex + 4).join('-');
    
    return `${action}-${subject || 'task'}`.replace(/[^a-z0-9-]/g, '').substring(0, 50);
  }

  /**
   * Export workflow to JSON format for storage
   */
  exportWorkflow(workflow: WorkflowDefinition): string {
    return JSON.stringify(workflow, null, 2);
  }

  /**
   * Validate workflow structure
   */
  validateWorkflow(workflow: WorkflowDefinition): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!workflow.id) errors.push('Workflow missing ID');
    if (!workflow.name) errors.push('Workflow missing name');
    if (!workflow.tasks || workflow.tasks.length === 0) {
      errors.push('Workflow must have at least one task');
    }

    // Check task dependencies exist
    const taskIds = new Set(workflow.tasks?.map(t => t.id) || []);
    for (const task of workflow.tasks || []) {
      if (task.dependencies) {
        for (const dep of task.dependencies) {
          if (!taskIds.has(dep)) {
            errors.push(`Task "${task.id}" has unknown dependency "${dep}"`);
          }
        }
      }

      // Validate agent type
      const validTypes = ['scout', 'coder', 'tester', 'reviewer', 'docs', 'librarian', 'oracle', 'builder', 'optimizer', 'integrator'];
      if (!validTypes.includes(task.agentType)) {
        errors.push(`Task "${task.id}" has invalid agent type "${task.agentType}"`);
      }
    }

    // Check for circular dependencies
    const hasCircular = this.detectCircularDependencies(workflow.tasks || []);
    if (hasCircular) {
      errors.push('Workflow has circular dependencies');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Detect circular dependencies in tasks
   */
  private detectCircularDependencies(tasks: WorkflowTask[]): boolean {
    const graph = new Map<string, Set<string>>();
    
    for (const task of tasks) {
      graph.set(task.id, new Set(task.dependencies || []));
    }

    const visited = new Set<string>();
    const recStack = new Set<string>();

    const hasCycle = (node: string): boolean => {
      visited.add(node);
      recStack.add(node);

      const neighbors = graph.get(node) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycle(neighbor)) return true;
        } else if (recStack.has(neighbor)) {
          return true;
        }
      }

      recStack.delete(node);
      return false;
    };

    for (const node of graph.keys()) {
      if (!visited.has(node)) {
        if (hasCycle(node)) return true;
      }
    }

    return false;
  }
}

// Singleton instance
export const workflowGenerator = new WorkflowGenerator();
