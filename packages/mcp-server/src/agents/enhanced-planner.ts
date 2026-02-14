/**
 * Enhanced Planner with LLM-like reasoning
 * 
 * Uses advanced heuristics and pattern matching to simulate
 * intelligent task analysis without requiring an external LLM.
 */

import { plannerAgent, type TaskAnalysis } from '../agents/planner.js';

/**
 * Dangerous operation patterns that require extra caution
 */
const DANGEROUS_PATTERNS = {
  delete: ['delete', 'remove', 'drop', 'truncate', 'erase', 'purge'],
  destructive: ['destroy', 'kill', 'terminate', 'cancel all', 'wipe'],
  security: ['bypass', 'hack', 'exploit', 'crack', 'inject', 'sql injection'],
  data: ['all records', 'entire database', 'all users', 'production data'],
  permission: ['sudo', 'root', 'admin', 'chmod 777', 'grant all'],
};

/**
 * Large scale operation indicators
 */
const SCALE_INDICATORS = [
  '1000', '10000', '100000', 'million', 'thousand',
  'bulk', 'batch', 'massive', 'all', 'every',
];

/**
 * Deep thinking patterns for better task analysis
 */
const DEEP_THINK_PATTERNS = {
  // Multi-step reasoning for complex tasks
  reasoningChains: {
    web_scraping: [
      'Identify target website structure',
      'Determine data extraction strategy',
      'Handle dynamic content if needed',
      'Implement rate limiting and ethics',
      'Store and validate extracted data'
    ],
    development: [
      'Analyze requirements and constraints',
      'Design component architecture',
      'Implement core functionality',
      'Add error handling and tests',
      'Document and review code'
    ],
    debugging: [
      'Reproduce the issue consistently',
      'Identify root cause through analysis',
      'Implement fix with tests',
      'Verify fix resolves the issue',
      'Check for similar issues'
    ],
  },
  
  // Success factors for different domains
  successFactors: {
    web_scraping: [
      'Respect robots.txt and rate limits',
      'Handle authentication properly',
      'Deal with CAPTCHAs and blocks',
      'Parse multiple page formats',
      'Handle JavaScript-rendered content'
    ],
    development: [
      'Clear requirements understanding',
      'Proper error handling',
      'Comprehensive testing',
      'Code review and documentation',
      'Backward compatibility'
    ],
    debugging: [
      'Reproducible test case',
      'Minimal reproduction steps',
      'Root cause analysis',
      'Comprehensive fix',
      'Regression prevention'
    ],
  },
  
  // Common failure patterns
  failurePatterns: [
    'Missing error handling for edge cases',
    'Insufficient testing coverage',
    'No consideration for scale',
    'Security vulnerabilities overlooked',
    'Missing documentation'
  ],
};

/**
 * Enhanced analysis with deep thinking
 */
export function deepAnalyze(goal: string, context?: any): TaskAnalysis {
  // First, get base analysis
  const analysis = plannerAgent.quickAnalyze(goal);
  
  // Then enhance with deep thinking
  const enhanced = enhanceWithDeepThinking(analysis, goal, context);
  
  return enhanced;
}

/**
 * Enhance analysis with reasoning chains and success factors
 */
function enhanceWithDeepThinking(
  analysis: TaskAnalysis, 
  goal: string,
  context?: any
): TaskAnalysis {
  const domain = analysis.domain;
  
  // Add reasoning chain
  const reasoningChain = DEEP_THINK_PATTERNS.reasoningChains[domain as keyof typeof DEEP_THINK_PATTERNS.reasoningChains] || 
    DEEP_THINK_PATTERNS.reasoningChains.development;
  
  // Add success factors
  const successFactors = DEEP_THINK_PATTERNS.successFactors[domain as keyof typeof DEEP_THINK_PATTERNS.successFactors] || [];
  
  // Detect specific challenges in the goal
  const specificChallenges = detectSpecificChallenges(goal, domain);
  
  // Enhance potential challenges
  const enhancedChallenges = [
    ...analysis.potentialChallenges,
    ...specificChallenges,
  ];
  
  // Adjust complexity based on specific indicators
  let adjustedComplexity = analysis.complexity;
  if (goal.includes('production') || goal.includes('scale')) {
    if (adjustedComplexity === 'simple') adjustedComplexity = 'moderate';
    else if (adjustedComplexity === 'moderate') adjustedComplexity = 'complex';
  }
  
  // Return enhanced analysis
  return {
    ...analysis,
    complexity: adjustedComplexity,
    potentialChallenges: enhancedChallenges,
    suggestedApproach: generateEnhancedApproach(analysis, reasoningChain, successFactors),
  };
}

/**
 * Detect specific challenges in the goal
 */
function detectSpecificChallenges(goal: string, domain: string): string[] {
  const challenges: string[] = [];
  const lowerGoal = goal.toLowerCase();
  
  // Domain-agnostic challenges
  if (lowerGoal.includes('legacy') || lowerGoal.includes('old code')) {
    challenges.push('Working with legacy code requires extra caution and testing');
  }
  
  if (lowerGoal.includes('production') || lowerGoal.includes('live')) {
    challenges.push('Production changes require careful rollback plan');
  }
  
  if (lowerGoal.includes('api') && lowerGoal.includes('external')) {
    challenges.push('External API dependencies may have reliability issues');
  }
  
  if (lowerGoal.includes('database') || lowerGoal.includes('migration')) {
    challenges.push('Database changes require backup and careful migration strategy');
  }
  
  // Domain-specific challenges
  if (domain === 'web_scraping') {
    if (lowerGoal.includes('login') || lowerGoal.includes('auth')) {
      challenges.push('Authentication handling adds complexity - consider session management');
    }
    if (lowerGoal.includes('javascript') || lowerGoal.includes('dynamic')) {
      challenges.push('JavaScript-rendered content requires browser automation');
    }
    if (lowerGoal.includes('bulk') || lowerGoal.includes('many pages')) {
      challenges.push('Bulk scraping requires rate limiting and proxy rotation');
    }
  }
  
  if (domain === 'development') {
    if (lowerGoal.includes('security') || lowerGoal.includes('auth')) {
      challenges.push('Security-critical features require thorough review');
    }
    if (lowerGoal.includes('performance') || lowerGoal.includes('optimize')) {
      challenges.push('Performance optimization requires profiling and benchmarking');
    }
  }
  
  return challenges;
}

/**
 * Generate enhanced approach description
 */
function generateEnhancedApproach(
  analysis: TaskAnalysis,
  reasoningChain: string[],
  successFactors: string[]
): string {
  const base = analysis.suggestedApproach;
  
  // Add success factors as recommendations
  const recommendations = successFactors.slice(0, 3).map(f => `• ${f}`).join('\n');
  
  return `${base}\n\nKey success factors:\n${recommendations}`;
}

/**
 * Smart task breakdown with dependencies
 */
export async function smartDecompose(analysis: TaskAnalysis, goal: string): Promise<any[]> {
  // Dynamic import to avoid circular dependency
  const { taskDecomposer } = await import('../planning/decomposer.js');
  const tasks = taskDecomposer.decompose(analysis);
  
  // Add intelligent dependencies based on task types
  return enhanceTasksWithDependencies(tasks, analysis);
}

/**
 * Detect dangerous operations that require warnings
 */
export function detectDangerousOperations(goal: string): {
  isDangerous: boolean;
  warnings: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
} {
  const warnings: string[] = [];
  const lowerGoal = goal.toLowerCase();
  let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
  
  // Check for delete/destructive operations
  for (const [category, patterns] of Object.entries(DANGEROUS_PATTERNS)) {
    for (const pattern of patterns) {
      if (lowerGoal.includes(pattern)) {
        if (category === 'delete' || category === 'destructive') {
          warnings.push(`⚠️  DANGER: This operation involves ${category} - ensure you have backups!`);
          severity = severity === 'low' ? 'high' : severity;
        } else if (category === 'security') {
          warnings.push(`🔒  WARNING: Security-sensitive operation detected - verify thoroughly!`);
          severity = 'high';
        } else if (category === 'data') {
          warnings.push(`💾  WARNING: Operations on production data detected - use caution!`);
          severity = severity === 'low' ? 'medium' : severity;
        }
      }
    }
  }
  
  // Check for large scale operations
  for (const indicator of SCALE_INDICATORS) {
    if (lowerGoal.includes(indicator)) {
      warnings.push(`📊  SCALE: Large scale operation detected - consider batching or incremental approach`);
      if (severity === 'low') severity = 'medium';
      break;
    }
  }
  
  // Check for production environment
  if (lowerGoal.includes('production') || lowerGoal.includes('prod')) {
    warnings.push(`🏭  PRODUCTION: Operating on production environment - extra caution required!`);
    severity = severity === 'low' ? 'medium' : severity;
  }
  
  return {
    isDangerous: warnings.length > 0,
    warnings,
    severity,
  };
}

/**
 * Add dependencies between tasks based on their types
 */
function enhanceTasksWithDependencies(tasks: any[], analysis: TaskAnalysis): any[] {
  // Build dependency map
  const dependencies = new Map<string, string[]>();
  
  // Research should come first
  const researchTasks = tasks.filter(t => t.agentType === 'scout');
  const codeTasks = tasks.filter(t => t.agentType === 'coder');
  const testTasks = tasks.filter(t => t.agentType === 'tester');
  const reviewTasks = tasks.filter(t => t.agentType === 'reviewer');
  const docTasks = tasks.filter(t => t.agentType === 'docs');
  
  // Code depends on research
  for (const code of codeTasks) {
    if (researchTasks.length > 0) {
      dependencies.set(code.id, [researchTasks[0].id]);
    }
  }
  
  // Tests depend on code
  for (const test of testTasks) {
    const relevantCode = codeTasks.find(c => 
      test.name.toLowerCase().includes(c.name.toLowerCase()) ||
      test.description.toLowerCase().includes(c.description.toLowerCase())
    );
    if (relevantCode) {
      dependencies.set(test.id, [...(dependencies.get(test.id) || []), relevantCode.id]);
    } else if (codeTasks.length > 0) {
      dependencies.set(test.id, [codeTasks[0].id]);
    }
  }
  
  // Review depends on tests (or code if no tests)
  for (const review of reviewTasks) {
    const deps = testTasks.length > 0 
      ? testTasks.map(t => t.id)
      : codeTasks.map(t => t.id);
    if (deps.length > 0) {
      dependencies.set(review.id, deps);
    }
  }
  
  // Docs depend on code (can be parallel with review)
  for (const doc of docTasks) {
    if (codeTasks.length > 0) {
      dependencies.set(doc.id, [codeTasks[0].id]);
    }
  }
  
  // Apply dependencies
  return tasks.map(task => ({
    ...task,
    dependencies: dependencies.get(task.id) || task.dependencies || [],
  }));
}

/**
 * Context-aware suggestion generator
 */
export function generateSuggestions(goal: string, analysis: TaskAnalysis): string[] {
  const suggestions: string[] = [];
  const lowerGoal = goal.toLowerCase();
  
  // Time-based suggestions
  if (analysis.complexity === 'very_complex') {
    suggestions.push('⏱️ This is a complex task. Consider breaking it into smaller subtasks.');
  }
  
  // Tool suggestions
  if (analysis.requiresResearch && !analysis.requiredTools?.includes('web-browser')) {
    suggestions.push('🔍 Research task detected - web browsing tool recommended.');
  }
  
  // Quality suggestions
  if (!lowerGoal.includes('test') && analysis.complexity !== 'simple') {
    suggestions.push('🧪 Consider adding explicit testing to your task description.');
  }
  
  // Documentation suggestions
  if (analysis.requiresImplementation && !lowerGoal.includes('document')) {
    suggestions.push('📝 Adding documentation to your task ensures maintainability.');
  }
  
  // Security suggestions
  if (lowerGoal.includes('auth') || lowerGoal.includes('login') || lowerGoal.includes('password')) {
    suggestions.push('🔐 Security-sensitive task - ensure proper handling of credentials.');
  }
  
  return suggestions;
}

export default {
  deepAnalyze,
  smartDecompose,
  generateSuggestions,
};
