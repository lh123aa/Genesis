/**
 * MCP Tool Registry
 * 
 * Manages registry of available MCP tools and their capabilities.
 * Tracks which tools are installed, which are available in the ecosystem,
 * and which need to be created.
 */

export interface MCPToolCapability {
  name: string;
  description: string;
  parameters: Record<string, {
    type: string;
    description: string;
    required: boolean;
  }>;
  returnType: string;
}

export interface MCPToolDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  categories: string[];
  capabilities: MCPToolCapability[];
  installation: {
    npm?: string;
    command?: string;
    config?: Record<string, unknown>;
  };
  requirements?: string[];
  keywords: string[];
  installed: boolean;
  installPath?: string;
  lastUsed?: string;
  usageCount: number;
}

export interface ToolAvailability {
  tool: MCPToolDefinition;
  status: 'installed' | 'available' | 'not_found' | 'installing';
  missingRequirements?: string[];
  autoInstallable: boolean;
}

/**
 * Built-in tool definitions in the Genesis ecosystem
 */
const BUILT_IN_TOOLS: MCPToolDefinition[] = [
  {
    id: 'filesystem',
    name: 'Filesystem MCP',
    description: 'Read and write files, manage directories',
    version: '1.0.0',
    author: '@modelcontextprotocol',
    categories: ['core', 'filesystem'],
    capabilities: [
      {
        name: 'read_file',
        description: 'Read contents of a file',
        parameters: {
          path: { type: 'string', description: 'File path', required: true },
        },
        returnType: 'string',
      },
      {
        name: 'write_file',
        description: 'Write content to a file',
        parameters: {
          path: { type: 'string', description: 'File path', required: true },
          content: { type: 'string', description: 'Content to write', required: true },
        },
        returnType: 'void',
      },
    ],
    installation: {
      npm: '@modelcontextprotocol/server-filesystem',
      command: 'npx -y @modelcontextprotocol/server-filesystem',
    },
    keywords: ['file', 'read', 'write', 'directory', 'path'],
    installed: false,
    usageCount: 0,
  },
  {
    id: 'web-browser',
    name: 'Web Browser MCP',
    description: 'Automate browser interactions, scrape websites',
    version: '1.0.0',
    author: '@modelcontextprotocol',
    categories: ['web', 'automation'],
    capabilities: [
      {
        name: 'navigate',
        description: 'Navigate to a URL',
        parameters: {
          url: { type: 'string', description: 'Target URL', required: true },
        },
        returnType: 'void',
      },
      {
        name: 'click',
        description: 'Click an element',
        parameters: {
          selector: { type: 'string', description: 'CSS selector', required: true },
        },
        returnType: 'void',
      },
      {
        name: 'extract',
        description: 'Extract data from page',
        parameters: {
          selector: { type: 'string', description: 'CSS selector', required: true },
          attribute: { type: 'string', description: 'Attribute to extract', required: false },
        },
        returnType: 'string[]',
      },
    ],
    installation: {
      npm: '@browsermcp/mcp',
      command: 'npx -y @browsermcp/mcp',
    },
    requirements: ['Playwright/Chromium installed'],
    keywords: ['browser', 'scrape', 'web', 'automation', 'playwright', 'puppeteer', 'click', 'navigate'],
    installed: false,
    usageCount: 0,
  },
  {
    id: 'sqlite',
    name: 'SQLite MCP',
    description: 'Query and manage SQLite databases',
    version: '1.0.0',
    author: '@modelcontextprotocol',
    categories: ['database', 'storage'],
    capabilities: [
      {
        name: 'query',
        description: 'Execute SQL query',
        parameters: {
          database: { type: 'string', description: 'Database path', required: true },
          sql: { type: 'string', description: 'SQL query', required: true },
        },
        returnType: 'Record<string, unknown>[]',
      },
      {
        name: 'execute',
        description: 'Execute SQL statement',
        parameters: {
          database: { type: 'string', description: 'Database path', required: true },
          sql: { type: 'string', description: 'SQL statement', required: true },
        },
        returnType: 'void',
      },
    ],
    installation: {
      npm: '@modelcontextprotocol/server-sqlite',
      command: 'npx -y @modelcontextprotocol/server-sqlite',
    },
    keywords: ['database', 'sql', 'sqlite', 'query', 'storage'],
    installed: false,
    usageCount: 0,
  },
  {
    id: 'github',
    name: 'GitHub MCP',
    description: 'Interact with GitHub repositories, issues, PRs',
    version: '1.0.0',
    author: '@modelcontextprotocol',
    categories: ['integration', 'git'],
    capabilities: [
      {
        name: 'create_issue',
        description: 'Create a GitHub issue',
        parameters: {
          owner: { type: 'string', description: 'Repository owner', required: true },
          repo: { type: 'string', description: 'Repository name', required: true },
          title: { type: 'string', description: 'Issue title', required: true },
          body: { type: 'string', description: 'Issue body', required: false },
        },
        returnType: 'object',
      },
      {
        name: 'create_pr',
        description: 'Create a pull request',
        parameters: {
          owner: { type: 'string', description: 'Repository owner', required: true },
          repo: { type: 'string', description: 'Repository name', required: true },
          title: { type: 'string', description: 'PR title', required: true },
          head: { type: 'string', description: 'Branch with changes', required: true },
          base: { type: 'string', description: 'Target branch', required: true },
        },
        returnType: 'object',
      },
    ],
    installation: {
      npm: '@modelcontextprotocol/server-github',
      command: 'npx -y @modelcontextprotocol/server-github',
    },
    requirements: ['GITHUB_TOKEN environment variable'],
    keywords: ['github', 'git', 'pr', 'issue', 'repository', 'integration'],
    installed: false,
    usageCount: 0,
  },
  {
    id: 'fetch',
    name: 'Fetch MCP',
    description: 'Make HTTP requests to APIs and websites',
    version: '1.0.0',
    author: '@modelcontextprotocol',
    categories: ['network', 'http'],
    capabilities: [
      {
        name: 'get',
        description: 'Make GET request',
        parameters: {
          url: { type: 'string', description: 'Target URL', required: true },
          headers: { type: 'object', description: 'Request headers', required: false },
        },
        returnType: 'object',
      },
      {
        name: 'post',
        description: 'Make POST request',
        parameters: {
          url: { type: 'string', description: 'Target URL', required: true },
          body: { type: 'object', description: 'Request body', required: true },
          headers: { type: 'object', description: 'Request headers', required: false },
        },
        returnType: 'object',
      },
    ],
    installation: {
      npm: '@modelcontextprotocol/server-fetch',
      command: 'npx -y @modelcontextprotocol/server-fetch',
    },
    keywords: ['http', 'api', 'request', 'fetch', 'rest', 'network'],
    installed: false,
    usageCount: 0,
  },
  {
    id: 'git',
    name: 'Git MCP',
    description: 'Execute git commands and manage repositories',
    version: '1.0.0',
    author: '@modelcontextprotocol',
    categories: ['core', 'git'],
    capabilities: [
      {
        name: 'status',
        description: 'Check git status',
        parameters: {
          path: { type: 'string', description: 'Repository path', required: true },
        },
        returnType: 'object',
      },
      {
        name: 'commit',
        description: 'Create a commit',
        parameters: {
          path: { type: 'string', description: 'Repository path', required: true },
          message: { type: 'string', description: 'Commit message', required: true },
          files: { type: 'string[]', description: 'Files to commit', required: false },
        },
        returnType: 'void',
      },
      {
        name: 'push',
        description: 'Push to remote',
        parameters: {
          path: { type: 'string', description: 'Repository path', required: true },
          remote: { type: 'string', description: 'Remote name', required: false },
          branch: { type: 'string', description: 'Branch name', required: false },
        },
        returnType: 'void',
      },
    ],
    installation: {
      npm: '@modelcontextprotocol/server-git',
      command: 'npx -y @modelcontextprotocol/server-git',
    },
    requirements: ['Git installed'],
    keywords: ['git', 'commit', 'push', 'repository', 'version-control'],
    installed: false,
    usageCount: 0,
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL MCP',
    description: 'Query and manage PostgreSQL databases',
    version: '1.0.0',
    author: '@modelcontextprotocol',
    categories: ['database', 'storage'],
    capabilities: [
      {
        name: 'query',
        description: 'Execute SQL query',
        parameters: {
          connection: { type: 'string', description: 'Connection string', required: true },
          sql: { type: 'string', description: 'SQL query', required: true },
        },
        returnType: 'Record<string, unknown>[]',
      },
    ],
    installation: {
      npm: '@modelcontextprotocol/server-postgres',
      command: 'npx -y @modelcontextprotocol/server-postgres',
    },
    requirements: ['PostgreSQL connection string'],
    keywords: ['database', 'sql', 'postgresql', 'postgres', 'query'],
    installed: false,
    usageCount: 0,
  },
  {
    id: 'redis',
    name: 'Redis MCP',
    description: 'Interact with Redis databases',
    version: '1.0.0',
    author: '@modelcontextprotocol',
    categories: ['database', 'cache'],
    capabilities: [
      {
        name: 'get',
        description: 'Get value by key',
        parameters: {
          host: { type: 'string', description: 'Redis host', required: true },
          port: { type: 'number', description: 'Redis port', required: false },
          key: { type: 'string', description: 'Key to get', required: true },
        },
        returnType: 'string',
      },
      {
        name: 'set',
        description: 'Set key value',
        parameters: {
          host: { type: 'string', description: 'Redis host', required: true },
          port: { type: 'number', description: 'Redis port', required: false },
          key: { type: 'string', description: 'Key to set', required: true },
          value: { type: 'string', description: 'Value to set', required: true },
        },
        returnType: 'void',
      },
    ],
    installation: {
      npm: '@modelcontextprotocol/server-redis',
      command: 'npx -y @modelcontextprotocol/server-redis',
    },
    requirements: ['Redis server'],
    keywords: ['redis', 'cache', 'database', 'key-value'],
    installed: false,
    usageCount: 0,
  },
  {
    id: 'aws',
    name: 'AWS MCP',
    description: 'Interact with AWS services',
    version: '1.0.0',
    author: '@modelcontextprotocol',
    categories: ['cloud', 'aws'],
    capabilities: [
      {
        name: 's3_list',
        description: 'List S3 buckets',
        parameters: {},
        returnType: 'string[]',
      },
      {
        name: 'lambda_list',
        description: 'List Lambda functions',
        parameters: {},
        returnType: 'string[]',
      },
    ],
    installation: {
      npm: '@modelcontextprotocol/server-aws',
      command: 'npx -y @modelcontextprotocol/server-aws',
    },
    requirements: ['AWS credentials configured'],
    keywords: ['aws', 'cloud', 's3', 'lambda', 'amazon'],
    installed: false,
    usageCount: 0,
  },
  {
    id: 'brave-search',
    name: 'Brave Search MCP',
    description: 'Search the web using Brave Search API',
    version: '1.0.0',
    author: '@modelcontextprotocol',
    categories: ['search', 'web'],
    capabilities: [
      {
        name: 'search',
        description: 'Search the web',
        parameters: {
          query: { type: 'string', description: 'Search query', required: true },
          count: { type: 'number', description: 'Number of results', required: false },
        },
        returnType: 'object[]',
      },
    ],
    installation: {
      npm: '@modelcontextprotocol/server-brave-search',
      command: 'npx -y @modelcontextprotocol/server-brave-search',
    },
    requirements: ['BRAVE_API_KEY environment variable'],
    keywords: ['search', 'web', 'brave', 'google', 'bing'],
    installed: false,
    usageCount: 0,
  },
];

/**
 * Tool Registry class
 */
export class ToolRegistry {
  private tools: Map<string, MCPToolDefinition>;
  private customTools: Map<string, MCPToolDefinition>;

  constructor() {
    this.tools = new Map();
    this.customTools = new Map();
    
    // Register built-in tools
    BUILT_IN_TOOLS.forEach(tool => {
      this.tools.set(tool.id, tool);
    });
  }

  /**
   * Get all available tools
   */
  listAllTools(): MCPToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get installed tools only
   */
  listInstalledTools(): MCPToolDefinition[] {
    return Array.from(this.tools.values()).filter(t => t.installed);
  }

  /**
   * Get available (not installed) tools
   */
  listAvailableTools(): MCPToolDefinition[] {
    return Array.from(this.tools.values()).filter(t => !t.installed);
  }

  /**
   * Get tool by ID
   */
  getTool(id: string): MCPToolDefinition | undefined {
    return this.tools.get(id) || this.customTools.get(id);
  }

  /**
   * Find tools by keyword
   */
  findToolsByKeyword(keyword: string): MCPToolDefinition[] {
    const normalizedKeyword = keyword.toLowerCase();
    return Array.from(this.tools.values()).filter(tool =>
      tool.keywords.some(k => k.toLowerCase().includes(normalizedKeyword)) ||
      tool.name.toLowerCase().includes(normalizedKeyword) ||
      tool.description.toLowerCase().includes(normalizedKeyword) ||
      tool.categories.some(c => c.toLowerCase().includes(normalizedKeyword))
    );
  }

  /**
   * Find tools by category
   */
  findToolsByCategory(category: string): MCPToolDefinition[] {
    const normalizedCategory = category.toLowerCase();
    return Array.from(this.tools.values()).filter(tool =>
      tool.categories.some(c => c.toLowerCase() === normalizedCategory)
    );
  }

  /**
   * Find tools by capability
   */
  findToolsByCapability(capabilityName: string): MCPToolDefinition[] {
    const normalizedName = capabilityName.toLowerCase();
    return Array.from(this.tools.values()).filter(tool =>
      tool.capabilities.some(c => 
        c.name.toLowerCase().includes(normalizedName) ||
        c.description.toLowerCase().includes(normalizedName)
      )
    );
  }

  /**
   * Mark a tool as installed
   */
  markToolInstalled(toolId: string, installPath?: string): void {
    const tool = this.tools.get(toolId) || this.customTools.get(toolId);
    if (tool) {
      tool.installed = true;
      tool.installPath = installPath;
    }
  }

  /**
   * Mark a tool as uninstalled
   */
  markToolUninstalled(toolId: string): void {
    const tool = this.tools.get(toolId) || this.customTools.get(toolId);
    if (tool) {
      tool.installed = false;
      tool.installPath = undefined;
    }
  }

  /**
   * Record tool usage
   */
  recordToolUsage(toolId: string): void {
    const tool = this.tools.get(toolId) || this.customTools.get(toolId);
    if (tool) {
      tool.usageCount++;
      tool.lastUsed = new Date().toISOString();
    }
  }

  /**
   * Register a custom tool
   */
  registerCustomTool(tool: MCPToolDefinition): void {
    this.customTools.set(tool.id, tool);
  }

  /**
   * Get tool statistics
   */
  getRegistryStats(): {
    total: number;
    installed: number;
    available: number;
    custom: number;
    categories: string[];
  } {
    const allTools = this.listAllTools();
    const categories = new Set<string>();
    allTools.forEach(t => t.categories.forEach(c => categories.add(c)));

    return {
      total: allTools.length + this.customTools.size,
      installed: this.listInstalledTools().length,
      available: this.listAvailableTools().length,
      custom: this.customTools.size,
      categories: Array.from(categories),
    };
  }

  /**
   * Check if a tool is installed
   */
  isToolInstalled(toolId: string): boolean {
    const tool = this.getTool(toolId);
    return tool?.installed || false;
  }

  /**
   * Get installation command for a tool
   */
  getInstallationCommand(toolId: string): string | undefined {
    const tool = this.getTool(toolId);
    if (!tool) return undefined;
    
    if (tool.installation.command) {
      return tool.installation.command;
    }
    
    if (tool.installation.npm) {
      return `npm install -g ${tool.installation.npm}`;
    }
    
    return undefined;
  }

  /**
   * Check if tool can be auto-installed
   */
  canAutoInstall(toolId: string): boolean {
    const tool = this.getTool(toolId);
    if (!tool) return false;
    
    // Can auto-install if it has npm package or simple command
    return !!tool.installation.npm || !!tool.installation.command;
  }

  /**
   * Get most popular tools
   */
  getMostPopularTools(limit: number = 5): MCPToolDefinition[] {
    return Array.from(this.tools.values())
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  /**
   * Get recently used tools
   */
  getRecentlyUsedTools(limit: number = 5): MCPToolDefinition[] {
    return Array.from(this.tools.values())
      .filter(t => t.lastUsed)
      .sort((a, b) => new Date(b.lastUsed!).getTime() - new Date(a.lastUsed!).getTime())
      .slice(0, limit);
  }

  /**
   * Suggest tools for a task
   */
  suggestToolsForTask(taskDescription: string): MCPToolDefinition[] {
    const normalized = taskDescription.toLowerCase();
    const scoredTools: { tool: MCPToolDefinition; score: number }[] = [];

    for (const tool of this.tools.values()) {
      let score = 0;

      // Match keywords
      for (const keyword of tool.keywords) {
        if (normalized.includes(keyword.toLowerCase())) {
          score += 10;
        }
      }

      // Match capability descriptions
      for (const capability of tool.capabilities) {
        if (normalized.includes(capability.name.toLowerCase())) {
          score += 15;
        }
        for (const param of Object.values(capability.parameters)) {
          if (normalized.includes(param.description.toLowerCase())) {
            score += 5;
          }
        }
      }

      // Boost installed tools
      if (tool.installed) {
        score += 5;
      }

      // Boost by usage (popularity)
      score += Math.min(tool.usageCount, 20);

      if (score > 0) {
        scoredTools.push({ tool, score });
      }
    }

    // Sort by score
    scoredTools.sort((a, b) => b.score - a.score);

    // Return top results
    return scoredTools.slice(0, 5).map(st => st.tool);
  }
}

// Singleton instance
export const toolRegistry = new ToolRegistry();
