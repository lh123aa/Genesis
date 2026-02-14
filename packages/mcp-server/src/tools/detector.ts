/**
 * Tool Detector
 * 
 * Analyzes tasks to determine which MCP tools are required.
 * Detects missing tools and suggests alternatives.
 */

import type { TaskAnalysis } from '../agents/planner.js';
import type { TaskNode } from '../planning/decomposer.js';
import { toolRegistry, type MCPToolDefinition } from './registry.js';

export interface ToolRequirement {
  tool: MCPToolDefinition;
  requiredBy: string[]; // Task IDs that need this tool
  critical: boolean;
  alternatives: MCPToolDefinition[];
}

export interface ToolDetectionResult {
  requiredTools: ToolRequirement[];
  missingTools: ToolRequirement[];
  installedTools: ToolRequirement[];
  unavailableTools: string[]; // Tool IDs that don't exist in registry
  recommendations: {
    install: MCPToolDefinition[];
    create: string[]; // Tool capabilities that need custom creation
  };
}

/**
 * Tool capability patterns
 * Maps common task patterns to required tools
 */
const TOOL_PATTERNS: Record<string, { toolId: string; patterns: RegExp[]; critical: boolean }> = {
  web_scraping: {
    toolId: 'web-browser',
    patterns: [
      /scrape|crawl|extract|harvest|spider/i,
      /browser|web page|html|dom/i,
      /click|navigate|form|login/i,
      /playwright|puppeteer|selenium/i,
    ],
    critical: true,
  },
  file_operations: {
    toolId: 'filesystem',
    patterns: [
      /read file|write file|save|load/i,
      /directory|folder|path/i,
      /config|configuration|json|yaml/i,
    ],
    critical: true,
  },
  http_requests: {
    toolId: 'fetch',
    patterns: [
      /api|http|request|endpoint|rest/i,
      /get|post|put|delete.*data/i,
      /fetch|axios|http client/i,
    ],
    critical: false,
  },
  database_sqlite: {
    toolId: 'sqlite',
    patterns: [
      /sqlite|local database/i,
      /\.db$|\.sqlite$/i,
    ],
    critical: false,
  },
  database_postgres: {
    toolId: 'postgresql',
    patterns: [
      /postgres|postgresql/i,
      /relational database|rdbms/i,
    ],
    critical: false,
  },
  database_redis: {
    toolId: 'redis',
    patterns: [
      /redis|cache/i,
      /key.value|in.memory/i,
    ],
    critical: false,
  },
  version_control: {
    toolId: 'git',
    patterns: [
      /git|commit|push|pull|branch/i,
      /repository|repo|version control/i,
    ],
    critical: false,
  },
  github_integration: {
    toolId: 'github',
    patterns: [
      /github|gh/i,
      /pull request|pr|issue/i,
      /fork|clone.*github/i,
    ],
    critical: false,
  },
  cloud_aws: {
    toolId: 'aws',
    patterns: [
      /aws|amazon web services/i,
      /s3|lambda|ec2|rds/i,
      /cloud.*aws/i,
    ],
    critical: false,
  },
  web_search: {
    toolId: 'brave-search',
    patterns: [
      /search.*web|web.*search/i,
      /google|bing|brave/i,
      /find.*online|lookup/i,
    ],
    critical: false,
  },
};

/**
 * Alternative tool mappings
 */
const ALTERNATIVE_TOOLS: Record<string, string[]> = {
  'web-browser': ['fetch'],
  'fetch': ['web-browser'],
  'postgresql': ['sqlite'],
  'sqlite': ['postgresql'],
  'brave-search': ['web-browser', 'fetch'],
};

/**
 * Tool Detector class
 */
export class ToolDetector {
  /**
   * Detect required tools from task analysis
   */
  detectFromAnalysis(analysis: TaskAnalysis): ToolDetectionResult {
    const requiredTools: ToolRequirement[] = [];
    const toolTaskMap = new Map<string, string[]>();

    // Check patterns in goal
    for (const [patternName, config] of Object.entries(TOOL_PATTERNS)) {
      for (const pattern of config.patterns) {
        if (pattern.test(analysis.goal)) {
          const tool = toolRegistry.getTool(config.toolId);
          if (tool) {
            if (!toolTaskMap.has(config.toolId)) {
              toolTaskMap.set(config.toolId, []);
            }
            toolTaskMap.get(config.toolId)!.push('goal');
          }
          break;
        }
      }
    }

    // Check required tools from analysis
    if (analysis.requiredTools) {
      for (const toolId of analysis.requiredTools) {
        const tool = toolRegistry.getTool(toolId);
        if (tool) {
          if (!toolTaskMap.has(toolId)) {
            toolTaskMap.set(toolId, []);
          }
          toolTaskMap.get(toolId)!.push('analysis');
        }
      }
    }

    // Build requirements
    for (const [toolId, requiredBy] of toolTaskMap) {
      const tool = toolRegistry.getTool(toolId);
      if (!tool) continue;

      const alternatives = this.findAlternatives(toolId);
      const isCritical = this.isToolCritical(toolId, analysis.goal);

      requiredTools.push({
        tool,
        requiredBy,
        critical: isCritical,
        alternatives,
      });
    }

    return this.categorizeTools(requiredTools);
  }

  /**
   * Detect required tools from task nodes
   */
  detectFromTasks(taskNodes: TaskNode[]): ToolDetectionResult {
    const requiredTools: ToolRequirement[] = [];
    const toolTaskMap = new Map<string, string[]>();

    for (const task of taskNodes) {
      const taskText = `${task.name} ${task.description}`.toLowerCase();

      for (const [patternName, config] of Object.entries(TOOL_PATTERNS)) {
        for (const pattern of config.patterns) {
          if (pattern.test(taskText)) {
            if (!toolTaskMap.has(config.toolId)) {
              toolTaskMap.set(config.toolId, []);
            }
            if (!toolTaskMap.get(config.toolId)!.includes(task.id)) {
              toolTaskMap.get(config.toolId)!.push(task.id);
            }
            break;
          }
        }
      }
    }

    // Build requirements
    for (const [toolId, requiredBy] of toolTaskMap) {
      const tool = toolRegistry.getTool(toolId);
      if (!tool) continue;

      const alternatives = this.findAlternatives(toolId);
      const isCritical = requiredBy.length > 1; // Critical if multiple tasks need it

      requiredTools.push({
        tool,
        requiredBy,
        critical: isCritical,
        alternatives,
      });
    }

    return this.categorizeTools(requiredTools);
  }

  /**
   * Detect required tools from goal and tasks combined
   */
  detectAll(analysis: TaskAnalysis, taskNodes: TaskNode[]): ToolDetectionResult {
    const fromAnalysis = this.detectFromAnalysis(analysis);
    const fromTasks = this.detectFromTasks(taskNodes);

    // Merge results
    const allTools = new Map<string, ToolRequirement>();

    for (const req of fromAnalysis.requiredTools) {
      allTools.set(req.tool.id, req);
    }

    for (const req of fromTasks.requiredTools) {
      if (allTools.has(req.tool.id)) {
        // Merge requiredBy
        const existing = allTools.get(req.tool.id)!;
        existing.requiredBy = [...new Set([...existing.requiredBy, ...req.requiredBy])];
        existing.critical = existing.critical || req.critical;
      } else {
        allTools.set(req.tool.id, req);
      }
    }

    return this.categorizeTools(Array.from(allTools.values()));
  }

  /**
   * Find alternative tools
   */
  private findAlternatives(toolId: string): MCPToolDefinition[] {
    const alternatives: MCPToolDefinition[] = [];
    const alternativeIds = ALTERNATIVE_TOOLS[toolId] || [];

    for (const altId of alternativeIds) {
      const alt = toolRegistry.getTool(altId);
      if (alt && alt.installed) {
        alternatives.push(alt);
      }
    }

    return alternatives;
  }

  /**
   * Check if a tool is critical for a task
   */
  private isToolCritical(toolId: string, goal: string): boolean {
    const pattern = TOOL_PATTERNS[toolId];
    return pattern?.critical || false;
  }

  /**
   * Categorize tools into installed/missing/unavailable
   */
  private categorizeTools(requirements: ToolRequirement[]): ToolDetectionResult {
    const installed: ToolRequirement[] = [];
    const missing: ToolRequirement[] = [];
    const unavailable: string[] = [];

    for (const req of requirements) {
      if (req.tool.installed) {
        installed.push(req);
      } else {
        missing.push(req);
      }
    }

    // Find tools that don't exist in registry
    const goalKeywords = requirements.flatMap(r => r.tool.keywords);
    const uniqueKeywords = [...new Set(goalKeywords)];

    // Check for any capability gaps
    const requiredCapabilities = this.extractRequiredCapabilities(
      requirements.flatMap(r => r.requiredBy).join(' ')
    );

    for (const cap of requiredCapabilities) {
      const matchingTools = toolRegistry.findToolsByCapability(cap);
      if (matchingTools.length === 0) {
        unavailable.push(cap);
      }
    }

    // Generate recommendations
    const installRecommendations = missing
      .filter(req => toolRegistry.canAutoInstall(req.tool.id))
      .map(req => req.tool);

    const createRecommendations = unavailable.filter(cap => {
      // Recommend creating if it's a critical gap
      return !toolRegistry.findToolsByCapability(cap).length;
    });

    return {
      requiredTools: requirements,
      missingTools: missing,
      installedTools: installed,
      unavailableTools: unavailable,
      recommendations: {
        install: installRecommendations,
        create: createRecommendations,
      },
    };
  }

  /**
   * Extract required capabilities from text
   */
  private extractRequiredCapabilities(text: string): string[] {
    const capabilities: string[] = [];
    const normalized = text.toLowerCase();

    // Web capabilities
    if (/scrape|extract.*web|html/.test(normalized)) {
      capabilities.push('web_scraping');
    }
    if (/click|navigate|form|interaction/.test(normalized)) {
      capabilities.push('browser_automation');
    }

    // File capabilities
    if (/read.*file|write.*file|save.*file/.test(normalized)) {
      capabilities.push('file_operations');
    }

    // Database capabilities
    if (/database|query|sql/.test(normalized)) {
      capabilities.push('database_operations');
    }

    // API capabilities
    if (/api|http|request|endpoint/.test(normalized)) {
      capabilities.push('http_requests');
    }

    // Git capabilities
    if (/git|commit|push|branch/.test(normalized)) {
      capabilities.push('version_control');
    }

    return capabilities;
  }

  /**
   * Check if a specific capability is available
   */
  hasCapability(capability: string): boolean {
    const tools = toolRegistry.findToolsByCapability(capability);
    return tools.some(t => t.installed);
  }

  /**
   * Get missing critical tools
   */
  getMissingCriticalTools(result: ToolDetectionResult): ToolRequirement[] {
    return result.missingTools.filter(req => req.critical);
  }

  /**
   * Generate installation plan
   */
  generateInstallationPlan(result: ToolDetectionResult): {
    canProceed: boolean;
    steps: string[];
    autoInstallable: boolean;
    manualInstallations: string[];
  } {
    const steps: string[] = [];
    const manualInstallations: string[] = [];

    // Critical missing tools must be addressed
    const criticalMissing = this.getMissingCriticalTools(result);
    
    if (criticalMissing.length > 0) {
      steps.push('⚠️  Critical tools are missing and must be installed:');
      for (const req of criticalMissing) {
        const cmd = toolRegistry.getInstallationCommand(req.tool.id);
        if (cmd) {
          steps.push(`   Install ${req.tool.name}: ${cmd}`);
          if (!toolRegistry.canAutoInstall(req.tool.id)) {
            manualInstallations.push(req.tool.id);
          }
        } else {
          steps.push(`   ${req.tool.name}: Manual installation required`);
          manualInstallations.push(req.tool.id);
        }
      }
    }

    // Non-critical missing tools
    const nonCriticalMissing = result.missingTools.filter(req => !req.critical);
    if (nonCriticalMissing.length > 0) {
      steps.push('\n📦 Optional tools available:');
      for (const req of nonCriticalMissing) {
        const cmd = toolRegistry.getInstallationCommand(req.tool.id);
        if (cmd && toolRegistry.canAutoInstall(req.tool.id)) {
          steps.push(`   ${req.tool.name}: ${cmd}`);
        } else {
          steps.push(`   ${req.tool.name}: ${req.tool.description}`);
        }
      }
    }

    // Check if we can proceed
    const canProceed = criticalMissing.every(req => 
      toolRegistry.canAutoInstall(req.tool.id) || req.alternatives.length > 0
    );

    const autoInstallable = criticalMissing.every(req => 
      toolRegistry.canAutoInstall(req.tool.id)
    );

    return {
      canProceed,
      steps,
      autoInstallable,
      manualInstallations,
    };
  }

  /**
   * Get tool requirements summary
   */
  getSummary(result: ToolDetectionResult): string {
    const lines: string[] = [];
    
    lines.push(`Tool Requirements Summary:`);
    lines.push(`  Total required: ${result.requiredTools.length}`);
    lines.push(`  ✅ Installed: ${result.installedTools.length}`);
    lines.push(`  ❌ Missing: ${result.missingTools.length}`);
    
    if (result.missingTools.length > 0) {
      const critical = result.missingTools.filter(r => r.critical).length;
      if (critical > 0) {
        lines.push(`  ⚠️  Critical missing: ${critical}`);
      }
    }

    if (result.unavailableTools.length > 0) {
      lines.push(`  🔧 Need creation: ${result.unavailableTools.length}`);
    }

    return lines.join('\n');
  }
}

// Singleton instance
export const toolDetector = new ToolDetector();
