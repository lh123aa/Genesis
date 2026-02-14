/**
 * Tool Generator
 * 
 * Automatically generates MCP tool implementations when tools are missing.
 * This is the core capability of Phase 3 - self-evolution through tool creation.
 */

import { toolRegistry, type MCPToolDefinition } from './registry.js';
import { plannerAgent } from '../agents/planner.js';
import { taskDecomposer } from '../planning/decomposer.js';
import { workflowGenerator } from '../planning/workflow-generator.js';

export interface ToolGenerationRequest {
  capability: string;
  description: string;
  parameters?: Record<string, {
    type: string;
    description: string;
    required: boolean;
  }>;
  reason: string; // Why this tool is needed
}

export interface ToolGenerationResult {
  success: boolean;
  request: ToolGenerationRequest;
  generatedTool?: GeneratedTool;
  message: string;
  installationSteps?: string[];
}

export interface GeneratedTool {
  id: string;
  name: string;
  description: string;
  category: string;
  capabilities: string[];
  code: {
    index: string;
    server: string;
    tools: string;
    types: string;
  };
  packageJson: object;
  readme: string;
  testScript: string;
}

/**
 * Tool Generator class
 */
export class ToolGenerator {
  private generationHistory: ToolGenerationResult[] = [];

  /**
   * Analyze what tool needs to be created
   */
  analyzeToolNeed(missingCapability: string, context?: string): ToolGenerationRequest {
    // Analyze the capability to understand what's needed
    const capabilityPatterns: Record<string, { description: string; parameters: Record<string, any> }> = {
      'web_scraping': {
        description: 'Scrape data from websites with JavaScript rendering support',
        parameters: {
          url: { type: 'string', description: 'Target URL to scrape', required: true },
          selector: { type: 'string', description: 'CSS selector for extraction', required: true },
          waitFor: { type: 'string', description: 'Element to wait for before extraction', required: false },
        },
      },
      'browser_automation': {
        description: 'Automate browser interactions like clicking and form filling',
        parameters: {
          url: { type: 'string', description: 'Starting URL', required: true },
          actions: { type: 'array', description: 'List of actions to perform', required: true },
        },
      },
      'file_operations': {
        description: 'Read and write files on the local filesystem',
        parameters: {
          operation: { type: 'string', description: 'read or write', required: true },
          path: { type: 'string', description: 'File path', required: true },
          content: { type: 'string', description: 'Content for write operations', required: false },
        },
      },
      'database_operations': {
        description: 'Execute SQL queries against databases',
        parameters: {
          connection: { type: 'string', description: 'Database connection string', required: true },
          query: { type: 'string', description: 'SQL query to execute', required: true },
        },
      },
      'http_requests': {
        description: 'Make HTTP requests to APIs and websites',
        parameters: {
          method: { type: 'string', description: 'HTTP method', required: true },
          url: { type: 'string', description: 'Target URL', required: true },
          headers: { type: 'object', description: 'Request headers', required: false },
          body: { type: 'object', description: 'Request body', required: false },
        },
      },
      'version_control': {
        description: 'Execute git commands and manage repositories',
        parameters: {
          command: { type: 'string', description: 'Git command to execute', required: true },
          args: { type: 'array', description: 'Command arguments', required: false },
        },
      },
    };

    const pattern = capabilityPatterns[missingCapability] || {
      description: `MCP tool for ${missingCapability}`,
      parameters: {
        input: { type: 'string', description: 'Input parameter', required: true },
      },
    };

    return {
      capability: missingCapability,
      description: pattern.description,
      parameters: pattern.parameters,
      reason: context || `Missing capability: ${missingCapability}`,
    };
  }

  /**
   * Generate a complete MCP tool implementation
   */
  generateTool(request: ToolGenerationRequest): ToolGenerationResult {
    try {
      console.log(`🔨 Generating MCP tool for: ${request.capability}`);

      const toolId = `genesis-${request.capability.replace(/_/g, '-')}`;
      const toolName = this.capitalizeFirst(request.capability.replace(/_/g, ' '));

      // Generate tool code
      const code = this.generateToolCode(toolId, request);
      
      // Generate package.json
      const packageJson = this.generatePackageJson(toolId, request);

      // Generate README
      const readme = this.generateReadme(toolId, request);

      // Generate test script
      const testScript = this.generateTestScript(toolId, request);

      const generatedTool: GeneratedTool = {
        id: toolId,
        name: `${toolName} MCP`,
        description: request.description,
        category: 'generated',
        capabilities: [request.capability],
        code,
        packageJson,
        readme,
        testScript,
      };

      // Register as a custom tool
      toolRegistry.registerCustomTool({
        id: toolId,
        name: generatedTool.name,
        description: request.description,
        version: '0.1.0',
        author: 'Genesis Auto-Generator',
        categories: ['generated', request.capability],
        capabilities: [{
          name: request.capability,
          description: request.description,
          parameters: request.parameters || {},
          returnType: 'unknown',
        }],
        installation: {
          command: `cd tools/${toolId} && npm install`,
        },
        keywords: [request.capability, 'generated', 'auto'],
        installed: false,
        usageCount: 0,
      });

      const result: ToolGenerationResult = {
        success: true,
        request,
        generatedTool,
        message: `Successfully generated MCP tool: ${toolId}`,
        installationSteps: [
          `1. Create directory: mkdir -p tools/${toolId}`,
          `2. Save files to tools/${toolId}/`,
          `3. Install dependencies: cd tools/${toolId} && npm install`,
          `4. Build: cd tools/${toolId} && npm run build`,
          `5. Add to MCP config in .opencode/mcp-servers.json`,
        ],
      };

      this.generationHistory.push(result);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        request,
        message: `Tool generation failed: ${errorMessage}`,
      };
    }
  }

  /**
   * Generate tool source code
   */
  private generateToolCode(toolId: string, request: ToolGenerationRequest): GeneratedTool['code'] {
    const className = this.toPascalCase(toolId);
    
    // Generate index.ts
    const index = `
#!/usr/bin/env node
/**
 * ${request.description}
 * 
 * Auto-generated by Genesis Tool Generator
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { tools } from './tools.js';

async function main() {
  const server = new Server(
    {
      name: '${toolId}',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools,
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const tool = tools.find(t => t.name === request.params.name);
    if (!tool) {
      throw new Error(\`Tool not found: \${request.params.name}\`);
    }

    try {
      const result = await tool.handler(request.params.arguments);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: 'text',
            text: \`Error: \${message}\`,
          },
        ],
        isError: true,
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
`.trim();

    // Generate tools.ts
    const paramSchemas = Object.entries(request.parameters || {})
      .map(([name, config]) => {
        const required = config.required ? '' : '?.optional()';
        return `      ${name}: z.${config.type}()${required},`;
      })
      .join('\n');

    const tools = `
import { z } from 'zod';
import type { Tool } from './types.js';

/**
 * Tool: ${request.capability}
 */
const ${request.capability}: Tool = {
  name: '${request.capability}',
  description: '${request.description}',
  inputSchema: {
    type: 'object',
    properties: {
${Object.entries(request.parameters || {}).map(([name, config]) => `      ${name}: {
        type: '${config.type}',
        description: '${config.description}',
      },`).join('\n')}
    },
    required: [${Object.entries(request.parameters || {})
      .filter(([_, config]) => config.required)
      .map(([name]) => `'${name}'`)
      .join(', ')}],
  },
  handler: async (args) => {
    // TODO: Implement ${request.capability} functionality
    // This is a generated stub - implement the actual logic
    
    console.log('Executing ${request.capability} with args:', args);
    
    return {
      success: true,
      message: '${request.capability} executed',
      data: args,
    };
  },
};

export const tools: Tool[] = [
  ${request.capability},
];
`.trim();

    // Generate types.ts
    const types = `
/**
 * Tool type definition
 */
export interface Tool {
  name: string;
  description: string;
  inputSchema: object;
  handler: (args: unknown) => Promise<unknown>;
}
`.trim();

    // Generate server.ts (alternative structure)
    const server = `
/**
 * Server configuration
 */
export const SERVER_CONFIG = {
  name: '${toolId}',
  version: '0.1.0',
  description: '${request.description}',
};
`.trim();

    return { index, tools, types, server };
  }

  /**
   * Generate package.json
   */
  private generatePackageJson(toolId: string, request: ToolGenerationRequest): object {
    return {
      name: `@genesis/${toolId}`,
      version: '0.1.0',
      description: request.description,
      type: 'module',
      bin: {
        [toolId]: './dist/index.js',
      },
      scripts: {
        build: 'tsc',
        dev: 'tsc --watch',
        start: 'node dist/index.js',
      },
      dependencies: {
        '@modelcontextprotocol/sdk': '^1.0.0',
        'zod': '^3.22.0',
      },
      devDependencies: {
        '@types/node': '^20.0.0',
        'typescript': '^5.3.0',
      },
    };
  }

  /**
   * Generate README
   */
  private generateReadme(toolId: string, request: ToolGenerationRequest): string {
    return `
# ${this.capitalizeFirst(request.capability.replace(/_/g, ' '))} MCP

${request.description}

## Installation

\`\`\`bash
npm install
npm run build
\`\`\`

## Usage

Add to your MCP configuration:

\`\`\`json
{
  "mcpServers": {
    "${toolId}": {
      "command": "node",
      "args": ["/path/to/${toolId}/dist/index.js"]
    }
  }
}
\`\`\`

## Tools

### ${request.capability}

${request.description}

**Parameters:**
${Object.entries(request.parameters || {})
  .map(([name, config]) => `- \`${name}\` (${config.type}${config.required ? ', required' : ''}): ${config.description}`)
  .join('\n')}

## Development

Auto-generated by Genesis Tool Generator.
`.trim();
  }

  /**
   * Generate test script
   */
  private generateTestScript(toolId: string, request: ToolGenerationRequest): string {
    return `
#!/usr/bin/env node
/**
 * Test script for ${toolId}
 */

import { tools } from './tools.js';

async function test() {
  console.log('Testing ${toolId}...\n');
  
  const tool = tools.find(t => t.name === '${request.capability}');
  if (!tool) {
    console.error('Tool not found');
    process.exit(1);
  }
  
  console.log('Tool:', tool.name);
  console.log('Description:', tool.description);
  console.log('Schema:', JSON.stringify(tool.inputSchema, null, 2));
  
  // Test with sample data
  const testArgs = {
    ${Object.entries(request.parameters || {})
      .map(([name, config]) => `${name}: ${config.type === 'string' ? `"test-${name}"` : config.type === 'number' ? '123' : '{}'},`)
      .join('\n    ')}
  };
  
  console.log('\nTest args:', testArgs);
  
  try {
    const result = await tool.handler(testArgs);
    console.log('\nResult:', JSON.stringify(result, null, 2));
    console.log('\n✓ Test passed');
  } catch (error) {
    console.error('\n✗ Test failed:', error);
    process.exit(1);
  }
}

test();
`.trim();
  }

  /**
   * Generate a workflow for tool creation
   */
  generateCreationWorkflow(request: ToolGenerationRequest): {
    plan: string;
    tasks: string[];
  } {
    const toolId = `genesis-${request.capability.replace(/_/g, '-')}`;
    
    return {
      plan: `Create ${toolId} MCP tool`,
      tasks: [
        `Create directory structure for ${toolId}`,
        `Generate package.json with dependencies`,
        `Implement ${request.capability} tool handler`,
        `Create TypeScript types`,
        `Write index.ts entry point`,
        `Add README with usage instructions`,
        `Create test script`,
        `Install dependencies`,
        `Build the tool`,
        `Test the implementation`,
      ],
    };
  }

  /**
   * Get generation history
   */
  getGenerationHistory(): ToolGenerationResult[] {
    return [...this.generationHistory];
  }

  /**
   * Check if a tool was previously generated
   */
  wasToolGenerated(capability: string): boolean {
    return this.generationHistory.some(
      h => h.request.capability === capability && h.success
    );
  }

  /**
   * Utility: Capitalize first letter
   */
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Utility: Convert to PascalCase
   */
  private toPascalCase(str: string): string {
    return str
      .split(/[-_]/)
      .map(word => this.capitalizeFirst(word))
      .join('');
  }
}

// Singleton instance
export const toolGenerator = new ToolGenerator();
