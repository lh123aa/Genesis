/**
 * Planner Agent
 * 
 * The "brain" of the autonomous task decomposition system.
 * Analyzes natural language goals and produces task analysis.
 */

import { z } from 'zod';

/**
 * Task analysis result
 */
export interface TaskAnalysis {
  goal: string;
  domain: 'web_scraping' | 'development' | 'debugging' | 'documentation' | 'research' | 'automation' | 'unknown';
  complexity: 'simple' | 'moderate' | 'complex' | 'very_complex';
  estimatedSteps: number;
  requiresResearch: boolean;
  requiresImplementation: boolean;
  requiresTesting: boolean;
  requiresDocumentation: boolean;
  keywords: string[];
  suggestedApproach: string;
  potentialChallenges: string[];
  requiredTools?: string[];
}

/**
 * Schema for task analysis input
 */
export const TaskAnalysisSchema = z.object({
  goal: z.string().describe('Natural language description of the goal'),
  context: z.object({
    projectType: z.string().optional(),
    techStack: z.array(z.string()).optional(),
    constraints: z.array(z.string()).optional(),
  }).optional().describe('Additional context about the project'),
});

export type TaskAnalysisInput = z.infer<typeof TaskAnalysisSchema>;

/**
 * Domain detection patterns (English + Chinese)
 */
const DOMAIN_PATTERNS: Record<string, { keywords: string[]; weight: number }[]> = {
  web_scraping: [
    { keywords: ['scrape', 'crawl', 'extract', 'spider', 'data collection', 'harvest'], weight: 10 },
    { keywords: ['website', 'web page', 'html', 'dom', 'selenium', 'puppeteer', 'playwright'], weight: 8 },
    { keywords: ['url', 'link', 'navigation', 'sitemap'], weight: 6 },
    // Chinese - higher weight for explicit scraping
    { keywords: ['爬虫', '抓取', '采集数据', '网页爬取'], weight: 12 },
    { keywords: ['爬取', '数据采集'], weight: 10 },
  ],
  development: [
    { keywords: ['implement', 'develop', 'build', 'create', 'feature', 'functionality'], weight: 10 },
    { keywords: ['code', 'programming', 'api', 'endpoint', 'component', 'module'], weight: 8 },
    { keywords: ['refactor', 'optimize', 'improve', 'clean'], weight: 6 },
    // Chinese
    { keywords: ['开发', '实现', '创建', '编写', '写', '构建', '功能'], weight: 10 },
    { keywords: ['程序', '代码', '接口', '组件', '模块'], weight: 8 },
  ],
  debugging: [
    { keywords: ['bug', 'fix', 'error', 'issue', 'debug', 'troubleshoot', 'broken'], weight: 10 },
    { keywords: ['crash', 'exception', 'failure', 'not working', 'problem'], weight: 8 },
    { keywords: ['investigate', 'diagnose', 'find root cause'], weight: 7 },
    // Chinese
    { keywords: ['修复', '调试', '解决', '错误', 'bug', '问题', '崩溃'], weight: 10 },
    { keywords: ['排查', '诊断', '找出原因'], weight: 8 },
  ],
  documentation: [
    { keywords: ['document', 'readme', 'guide', 'manual', 'wiki'], weight: 10 },
    { keywords: ['explain', 'describe', 'tutorial', 'how-to', 'getting started'], weight: 8 },
    { keywords: ['api doc', 'reference', 'specification'], weight: 7 },
    // Chinese
    { keywords: ['文档', '说明', '教程', '文档化'], weight: 10 },
  ],
  research: [
    { keywords: ['research', 'investigate', 'study', 'analyze', 'explore'], weight: 10 },
    { keywords: ['find', 'discover', 'gather information', 'learn about'], weight: 8 },
    { keywords: ['survey', 'comparison', 'benchmark'], weight: 7 },
    // Chinese
    { keywords: ['研究', '调研', '分析', '调查', '了解'], weight: 10 },
  ],
  automation: [
    { keywords: ['automate', 'script', 'cron', 'schedule', 'pipeline'], weight: 10 },
    { keywords: ['workflow', 'ci/cd', 'deploy', 'integration'], weight: 8 },
    { keywords: ['bot', 'routine', 'recurring'], weight: 6 },
    // Chinese
    { keywords: ['自动化', '脚本', '定时', '部署', '流水线'], weight: 10 },
  ],
};

/**
 * Complexity indicators
 */
const COMPLEXITY_INDICATORS = {
  simple: {
    maxWords: 10,
    keywords: ['fix typo', 'update', 'change color', 'add comment', 'rename'],
    score: 1,
  },
  moderate: {
    maxWords: 25,
    keywords: ['add field', 'update form', 'simple query', 'basic component'],
    score: 2,
  },
  complex: {
    maxWords: 50,
    keywords: ['integration', 'authentication', 'database', 'api', 'multiple'],
    score: 3,
  },
  very_complex: {
    maxWords: Infinity,
    keywords: ['system', 'architecture', 'platform', 'framework', 'microservice', 'distributed'],
    score: 5,
  },
};

/**
 * Tool detection patterns
 */
const TOOL_PATTERNS: Record<string, string[]> = {
  'web-browser': ['scrape', 'browser', 'web page', 'html', 'click', 'navigate', 'playwright', 'puppeteer'],
  'database': ['database', 'sql', 'query', 'store', 'save data', 'sqlite', 'postgres', 'mongodb'],
  'file-system': ['file', 'read', 'write', 'directory', 'path', 'save', 'load'],
  'api-client': ['api', 'http', 'request', 'endpoint', 'rest', 'graphql', 'fetch'],
  'code-editor': ['code', 'implement', 'write function', 'class', 'module', 'refactor'],
  'git': ['git', 'commit', 'branch', 'merge', 'pull request', 'repository'],
};

/**
 * Planner Agent class
 */
export class PlannerAgent {
  /**
   * Analyze a goal and produce task analysis
   */
  analyze(input: TaskAnalysisInput): TaskAnalysis {
    const { goal, context } = input;
    const normalizedGoal = goal.toLowerCase();
    
    // Detect domain
    const domain = this.detectDomain(normalizedGoal);
    
    // Assess complexity
    const complexity = this.assessComplexity(normalizedGoal);
    
    // Estimate steps
    const estimatedSteps = this.estimateSteps(normalizedGoal, complexity);
    
    // Detect requirements
    const requirements = this.detectRequirements(normalizedGoal);
    
    // Extract keywords
    const keywords = this.extractKeywords(normalizedGoal);
    
    // Determine suggested approach
    const suggestedApproach = this.suggestApproach(domain, complexity);
    
    // Identify potential challenges
    const potentialChallenges = this.identifyChallenges(normalizedGoal, domain);
    
    // Detect required tools
    const requiredTools = this.detectTools(normalizedGoal);

    return {
      goal,
      domain,
      complexity,
      estimatedSteps,
      ...requirements,
      keywords,
      suggestedApproach,
      potentialChallenges,
      requiredTools,
    };
  }

  /**
   * Detect the domain of the task
   */
  private detectDomain(goal: string): TaskAnalysis['domain'] {
    const scores: Record<string, number> = {};

    for (const [domain, patterns] of Object.entries(DOMAIN_PATTERNS)) {
      scores[domain] = 0;
      for (const pattern of patterns) {
        for (const keyword of pattern.keywords) {
          if (goal.includes(keyword.toLowerCase())) {
            scores[domain] += pattern.weight;
          }
        }
      }
    }

    // Find highest scoring domain
    let maxScore = 0;
    let detectedDomain: TaskAnalysis['domain'] = 'unknown';

    for (const [domain, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        detectedDomain = domain as TaskAnalysis['domain'];
      }
    }

    return detectedDomain;
  }

  /**
   * Assess complexity of the task
   */
  private assessComplexity(goal: string): TaskAnalysis['complexity'] {
    const wordCount = goal.split(/\s+/).length;
    let complexityScore = 0;

    // Score based on word count
    if (wordCount <= COMPLEXITY_INDICATORS.simple.maxWords) {
      complexityScore += COMPLEXITY_INDICATORS.simple.score;
    } else if (wordCount <= COMPLEXITY_INDICATORS.moderate.maxWords) {
      complexityScore += COMPLEXITY_INDICATORS.moderate.score;
    } else if (wordCount <= COMPLEXITY_INDICATORS.complex.maxWords) {
      complexityScore += COMPLEXITY_INDICATORS.complex.score;
    } else {
      complexityScore += COMPLEXITY_INDICATORS.very_complex.score;
    }

    // Score based on keywords
    for (const [level, indicators] of Object.entries(COMPLEXITY_INDICATORS)) {
      for (const keyword of indicators.keywords) {
        if (goal.includes(keyword.toLowerCase())) {
          complexityScore += indicators.score;
        }
      }
    }

    // Determine complexity level
    if (complexityScore <= 2) return 'simple';
    if (complexityScore <= 5) return 'moderate';
    if (complexityScore <= 8) return 'complex';
    return 'very_complex';
  }

  /**
   * Estimate number of steps needed
   */
  private estimateSteps(goal: string, complexity: TaskAnalysis['complexity']): number {
    const baseSteps: Record<TaskAnalysis['complexity'], number> = {
      simple: 2,
      moderate: 4,
      complex: 6,
      very_complex: 10,
    };

    let steps = baseSteps[complexity];

    // Adjust based on conjunctions (indicate multiple actions)
    const conjunctions = ['and', 'then', 'also', 'additionally', 'furthermore'];
    for (const conj of conjunctions) {
      if (goal.includes(` ${conj} `)) {
        steps += 1;
      }
    }

    // Adjust based on specific patterns
    if (goal.includes('test') || goal.includes('validate')) steps += 1;
    if (goal.includes('document') || goal.includes('readme')) steps += 1;
    if (goal.includes('review') || goal.includes('audit')) steps += 1;

    return Math.min(steps, 15); // Cap at 15 steps
  }

  /**
   * Detect what types of work are required
   */
  private detectRequirements(goal: string): {
    requiresResearch: boolean;
    requiresImplementation: boolean;
    requiresTesting: boolean;
    requiresDocumentation: boolean;
  } {
    return {
      requiresResearch: /research|investigate|explore|find|discover|analyze/.test(goal),
      requiresImplementation: /implement|build|create|develop|code|write|add/.test(goal),
      requiresTesting: /test|validate|verify|check|ensure/.test(goal),
      requiresDocumentation: /document|readme|guide|explain|describe/.test(goal),
    };
  }

  /**
   * Extract relevant keywords from the goal
   */
  private extractKeywords(goal: string): string[] {
    // Technical keywords that indicate specific technologies or approaches
    const techKeywords = [
      'api', 'rest', 'graphql', 'database', 'sql', 'nosql', 'frontend', 'backend',
      'react', 'vue', 'angular', 'node', 'python', 'typescript', 'javascript',
      'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'ci/cd', 'git',
      'authentication', 'authorization', 'jwt', 'oauth', 'scraping',
      'playwright', 'puppeteer', 'selenium', 'testing', 'jest', 'vitest',
    ];

    const found: string[] = [];
    for (const keyword of techKeywords) {
      if (goal.includes(keyword.toLowerCase())) {
        found.push(keyword);
      }
    }

    return found;
  }

  /**
   * Suggest an approach based on domain and complexity
   */
  private suggestApproach(domain: TaskAnalysis['domain'], complexity: TaskAnalysis['complexity']): string {
    const approaches: Record<TaskAnalysis['domain'], Record<TaskAnalysis['complexity'], string>> = {
      web_scraping: {
        simple: 'Use direct HTTP requests with minimal parsing',
        moderate: 'Use browser automation with structured data extraction',
        complex: 'Multi-page crawling with session management and rate limiting',
        very_complex: 'Distributed crawling with proxy rotation, CAPTCHA handling, and data pipeline',
      },
      development: {
        simple: 'Direct implementation with minimal planning',
        moderate: 'Design-first approach with component breakdown',
        complex: 'Architecture planning with API design and integration testing',
        very_complex: 'Full SDLC with RFC, implementation phases, and comprehensive testing',
      },
      debugging: {
        simple: 'Quick fix based on error message',
        moderate: 'Systematic reproduction and root cause analysis',
        complex: 'Deep investigation with logging, tracing, and hypothesis testing',
        very_complex: 'Multi-system analysis with performance profiling and architectural review',
      },
      documentation: {
        simple: 'Inline comments and brief README update',
        moderate: 'Structured documentation with examples and usage guide',
        complex: 'Comprehensive docs with API reference, tutorials, and best practices',
        very_complex: 'Full documentation suite with multiple formats and automated generation',
      },
      research: {
        simple: 'Quick survey of existing solutions',
        moderate: 'Comparative analysis with pros/cons evaluation',
        complex: 'Deep dive with benchmarking and feasibility study',
        very_complex: 'Extensive research with PoC and comprehensive report',
      },
      automation: {
        simple: 'Single script with basic scheduling',
        moderate: 'Workflow automation with error handling and notifications',
        complex: 'Pipeline with multiple stages, monitoring, and rollback capability',
        very_complex: 'Platform-level automation with orchestration and self-healing',
      },
      unknown: {
        simple: 'Explore and understand requirements first',
        moderate: 'Break down into smaller, well-defined tasks',
        complex: 'Phased approach with exploration and incremental delivery',
        very_complex: 'Discovery phase followed by iterative implementation',
      },
    };

    return approaches[domain][complexity];
  }

  /**
   * Identify potential challenges
   */
  private identifyChallenges(goal: string, domain: TaskAnalysis['domain']): string[] {
    const challenges: string[] = [];

    // Domain-specific challenges
    if (domain === 'web_scraping') {
      if (goal.includes('dynamic') || goal.includes('javascript')) {
        challenges.push('May require browser automation for JavaScript-heavy sites');
      }
      if (goal.includes('login') || goal.includes('auth')) {
        challenges.push('Authentication and session management required');
      }
      if (goal.includes('rate') || goal.includes('limit')) {
        challenges.push('Need to handle rate limiting and throttling');
      }
    }

    if (domain === 'development') {
      if (goal.includes('legacy') || goal.includes('old')) {
        challenges.push('Integration with legacy systems may have compatibility issues');
      }
      if (goal.includes('performance') || goal.includes('scale')) {
        challenges.push('Performance optimization requires careful profiling and testing');
      }
    }

    if (domain === 'debugging') {
      if (goal.includes('intermittent') || goal.includes('random')) {
        challenges.push('Intermittent issues are difficult to reproduce consistently');
      }
      if (goal.includes('production') || goal.includes('live')) {
        challenges.push('Limited debugging capability in production environment');
      }
    }

    // Generic challenges
    if (goal.includes('integration') || goal.includes('third-party')) {
      challenges.push('Third-party dependencies may change or have limitations');
    }
    if (goal.includes('deadline') || goal.includes('urgent')) {
      challenges.push('Time constraints may limit thoroughness');
    }

    return challenges;
  }

  /**
   * Detect required MCP tools
   */
  private detectTools(goal: string): string[] {
    const tools: string[] = [];
    const normalizedGoal = goal.toLowerCase();

    for (const [tool, keywords] of Object.entries(TOOL_PATTERNS)) {
      for (const keyword of keywords) {
        if (normalizedGoal.includes(keyword.toLowerCase())) {
          tools.push(tool);
          break;
        }
      }
    }

    return [...new Set(tools)]; // Remove duplicates
  }

  /**
   * Quick analysis for simple cases
   */
  quickAnalyze(goal: string): TaskAnalysis {
    return this.analyze({ goal });
  }
}

// Singleton instance
export const plannerAgent = new PlannerAgent();
