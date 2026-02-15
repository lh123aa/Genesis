#!/usr/bin/env node
/**
 * Genesis CLI - Natural Language Agent Interface
 * 
 * Usage:
 *   npx tsx packages/mcp-server/src/cli.ts              # Start in REPL mode
 *   npx tsx packages/mcp-server/src/cli.ts "your task"  # Execute task directly
 *   npx tsx packages/mcp-server/src/cli.ts --repl       # Explicit REPL mode
 *   npx tsx packages/mcp-server/src/cli.ts --help       # Show help
 *   npx tsx packages/mcp-server/src/cli.ts "task" --execute  # Auto execute
 * 
 * Or use as MCP tool via stdin/stdout
 */

import { executeWithVisualization } from './executor.js';

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0] || '';

/**
 * Quick execute mode - run a task directly with beautiful visualization
 */
async function quickExecute(goal: string, options?: {
  autoExecute?: boolean;
  verbose?: boolean;
}): Promise<void> {
  try {
    await executeWithVisualization(goal, {
      autoExecute: options?.autoExecute,
      showThinking: true,
      verbose: options?.verbose,
    });

    if (!options?.autoExecute) {
      console.log('\n   To execute with auto-run: --execute flag\n');
    }
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

/**
 * REPL mode - interactive agent conversation
 */
async function startREPL(): Promise<void> {
  console.log('\n🚀 Starting Genesis Agent Mode...\n');
  console.log('   Type your goal and press Enter to begin!');
  console.log('   Commands: /help, /status, /exit\n');
  
  // Simple REPL implementation
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '\n🎯 > ',
  });

  rl.prompt();

  rl.on('line', async (line) => {
    const input = line.trim();
    
    if (!input) {
      rl.prompt();
      return;
    }

    if (input === '/exit' || input === '/quit') {
      console.log('\n👋 Goodbye!\n');
      process.exit(0);
    }

    if (input === '/help') {
      console.log(`
  Commands:
    /exit, /quit   - Exit the agent
    /help          - Show this help
    /clear         - Clear screen
    
  Just type your goal to get started!
      `);
      rl.prompt();
      return;
    }

    if (input === '/clear') {
      console.clear();
      rl.prompt();
      return;
    }

    // Execute the goal with visualization
    await quickExecute(input, { autoExecute: false });
    rl.prompt();
  });

  rl.on('close', () => {
    console.log('\n👋 Goodbye!\n');
    process.exit(0);
  });
}

/**
 * Show help
 */
function showHelp(): void {
  console.log(`
 🤖 Genesis CLI - AI-Powered Task Orchestration

 Usage:
   npx tsx src/cli.ts                    Start in REPL mode
   npx tsx src/cli.ts "your task"        Execute task with visualization
   npx tsx src/cli.ts "task" --execute   Auto-execute the task
   npx tsx src/cli.ts --repl             Explicit REPL mode
   npx tsx src/cli.ts --help             Show this help

 Examples:
   npx tsx src/cli.ts "Analyze how to implement user authentication"
   npx tsx src/cli.ts "Create a web scraping workflow" --execute
   npx tsx src/cli.ts "Research best practices for React state management"

 Features:
    🎯 智能任务分解
    🔍 Agent 分配可视化  
    💭 思考过程展示
    📊 进度追踪
    🎉 精美执行总结

 In REPL mode:
   Just type naturally what you want to do!
   • "Create a feature workflow"
   • "Help me debug this issue"
   • "Research API integration"

   Commands:
   /help    - Show help
   /clear   - Clear screen
   /exit    - Exit REPL

 MCP Mode:
   This CLI also works as an MCP server via stdio.
   Configure in your .opencode/mcp-servers.json:
   
   {
     "mcpServers": {
       "genesis": {
         "command": "npx",
         "args": ["tsx", "packages/mcp-server/src/cli.ts"]
       }
     }
   }
`);
}

// Main entry point
async function main(): Promise<void> {
  // Check if there's piped input
  const hasPipedInput = !process.stdin.isTTY;
  
  // Check for flags
  if (command === '--help' || command === '-h') {
    showHelp();
    return;
  }

  if (command === '--repl' || command === '-r') {
    await startREPL();
    return;
  }

  if (command === '--version' || command === '-v') {
    console.log('Genesis v2.1.0');
    console.log('AI-Powered Task Orchestration');
    return;
  }

  // Check for auto-execute flag
  const autoExecute = args.includes('--execute') || args.includes('-e');
  const cleanGoal = args.filter(arg => !arg.startsWith('--') && !arg.startsWith('-')).join(' ');

  // If there's a task, execute it directly
  if (cleanGoal) {
    await quickExecute(cleanGoal, { autoExecute });
    return;
  }

  // If piped input exists, execute it
  if (hasPipedInput) {
    // Read from stdin
    const chunks: string[] = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    const pipedCommand = chunks.join('').trim();
    if (pipedCommand) {
      await quickExecute(pipedCommand, { autoExecute });
      return;
    }
  }

  // Default: start REPL
  await startREPL();
}

main().catch(console.error);
