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
 *   npx tsx packages/mcp-server/src/cli.ts --lang zh    # Switch to Chinese
 *   npx tsx packages/mcp-server/src/cli.ts --lang en    # Switch to English
 * 
 * Or use as MCP tool via stdin/stdout
 */

import { executeWithVisualization } from './executor.js';
import { getLocale, setLocale, toggleLocale, t } from './i18n/index.js';

// Parse command line arguments
const args = process.argv.slice(2);

// Parse language first (before determining command)
for (let i = 0; i < args.length; i++) {
  if ((args[i] === '--lang' || args[i] === '-l') && args[i + 1]) {
    const lang = args[i + 1];
    if (lang === 'zh' || lang === 'en') {
      setLocale(lang);
    }
  }
}

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
  const locale = getLocale();
  const langName = locale === 'zh' ? '中文' : 'English';
  
  console.log(`\n🚀 Starting Genesis Agent Mode (${langName})...\n`);
  console.log('   Type your goal and press Enter to begin!');
  console.log('   Commands: /help, /status, /exit, /lang\n');
  
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
      const helpText = locale === 'zh' ? `
  命令:
    /exit, /quit   - 退出
    /help          - 显示帮助
    /clear         - 清屏
    /lang          - 切换语言 (zh/en)
    /status        - 查看系统状态
    
  直接输入你的目标开始!
      ` : `
  Commands:
    /exit, /quit   - Exit the agent
    /help          - Show this help
    /clear         - Clear screen
    /lang          - Switch language (zh/en)
    /status        - Show system status
    
  Just type your goal to get started!
      `;
      console.log(helpText);
      rl.prompt();
      return;
    }

    if (input === '/clear') {
      console.clear();
      rl.prompt();
      return;
    }
    
    // Language switch command
    if (input === '/lang') {
      const newLocale = toggleLocale();
      const newLangName = newLocale === 'zh' ? '中文' : 'English';
      console.log(`\n🌍 ${locale === 'zh' ? '语言已切换到' : 'Language switched to'}: ${newLangName}\n`);
      // Restart REPL with new language
      rl.close();
      await startREPL();
      return;
    }
    
    // Status command
    if (input === '/status') {
      const currentLocale = getLocale();
      console.log(`\n📊 Genesis Status:`);
      console.log(`   Language: ${currentLocale === 'zh' ? '中文' : 'English'}`);
      console.log(`   Version: v2.1.0\n`);
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
 * Show help - bilingual
 */
function showHelp(): void {
  const locale = getLocale();
  
  if (locale === 'zh') {
    console.log(`
 🤖 Genesis CLI - AI Agent 编排系统

 使用方法:
   npx tsx src/cli.ts                    启动 REPL 模式
   npx tsx src/cli.ts "你的任务"         执行任务并可视化
   npx tsx src/cli.ts "任务" --execute   自动执行任务
   npx tsx src/cli.ts --repl             显式 REPL 模式
   npx tsx src/cli.ts --help             显示帮助
   npx tsx src/cli.ts --lang zh          切换到中文
   npx tsx src/cli.ts --lang en          切换到英文

 示例:
   npx tsx src/cli.ts "分析如何实现用户认证"
   npx tsx src/cli.ts "创建网页爬虫工作流" --execute
   npx tsx src/cli.ts "研究 React 状态管理最佳实践"

 特性:
     🎯 智能任务分解
     🔍 Agent 专属颜色
     💭 独立思考过程展示
     📊 进度追踪
     🌍 中英文切换
     🎉 精美执行总结

 REPL 模式:
    直接输入你想要做的事情!
    • "创建一个功能工作流"
    • "帮我调试这个问题"
    • "研究 API 集成"

    命令:
    /help    - 显示帮助
    /clear   - 清屏
    /exit    - 退出
    /lang    - 切换语言
    /status  - 查看状态

 MCP 模式:
    此 CLI 也可以作为 MCP 服务器使用。
    在 .opencode/mcp-servers.json 中配置:
    
    {
      "mcpServers": {
        "genesis": {
          "command": "npx",
          "args": ["tsx", "packages/mcp-server/src/cli.ts"]
        }
      }
    }
`);
  } else {
    console.log(`
 🤖 Genesis CLI - AI-Powered Task Orchestration

 Usage:
   npx tsx src/cli.ts                    Start in REPL mode
   npx tsx src/cli.ts "your task"        Execute task with visualization
   npx tsx src/cli.ts "task" --execute   Auto-execute the task
   npx tsx src/cli.ts --repl             Explicit REPL mode
   npx tsx src/cli.ts --help             Show this help
   npx tsx src/cli.ts --lang zh          Switch to Chinese
   npx tsx src/cli.ts --lang en          Switch to English

 Examples:
   npx tsx src/cli.ts "Analyze how to implement user authentication"
   npx tsx src/cli.ts "Create a web scraping workflow" --execute
   npx tsx src/cli.ts "Research best practices for React state management"

 Features:
     🎯 Smart Task Decomposition
     🔍 Agent-Specific Colors
     💭 Independent Thinking Display
     📊 Progress Tracking
     🌍 Chinese/English Toggle
     🎉 Beautiful Execution Summary

 In REPL mode:
    Just type naturally what you want to do!
    • "Create a feature workflow"
    • "Help me debug this issue"
    • "Research API integration"

    Commands:
    /help    - Show help
    /clear   - Clear screen
    /exit    - Exit REPL
    /lang    - Switch language
    /status  - Show status

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
}

// Main entry point
async function main(): Promise<void> {
  // Check if there's piped input
  const hasPipedInput = !process.stdin.isTTY;
  
  // Check for flags (also check if --help is anywhere in args)
  const hasHelp = args.includes('--help') || args.includes('-h');
  if (command === '--help' || command === '-h' || hasHelp) {
    showHelp();
    return;
  }

  if (command === '--repl' || command === '-r') {
    await startREPL();
    return;
  }

  if (command === '--version' || command === '-v') {
    const locale = getLocale();
    console.log(`Genesis v2.1.0`);
    console.log(locale === 'zh' ? 'AI-Agent 编排系统' : 'AI-Powered Task Orchestration');
    return;
  }
  
  if (command === '--lang' || command === '-l') {
    // Check if there's also a goal after --lang
    const goalArgs = args.filter(arg => !arg.startsWith('--') && !arg.startsWith('-'));
    if (goalArgs.length > 0) {
      // Has goal, execute it
      const autoExecute = args.includes('--execute') || args.includes('-e');
      await quickExecute(goalArgs.join(' '), { autoExecute });
      return;
    }
    // No goal, just show language info
    const locale = getLocale();
    console.log(`\n🌍 ${locale === 'zh' ? '当前语言' : 'Current language'}: ${locale === 'zh' ? '中文' : 'English'}`);
    console.log(locale === 'zh' ? '使用 --lang zh 切换到中文' : 'Use --lang en to switch to English');
    console.log(locale === 'zh' ? '使用 --lang en 切换到英文' : 'Use --lang zh to switch to Chinese\n');
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
