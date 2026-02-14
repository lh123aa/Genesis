#!/usr/bin/env node
/**
 * Genesis CLI - Natural Language Agent Interface
 * 
 * Usage:
 *   npx tsx packages/mcp-server/src/cli.ts              # Start in REPL mode
 *   npx tsx packages/mcp-server/src/cli.ts "your task"  # Execute task directly
 *   npx tsx packages/mcp-server/src/cli.ts --repl       # Explicit REPL mode
 *   npx tsx packages/mcp-server/src/cli.ts --help       # Show help
 * 
 * Or use as MCP tool via stdin/stdout
 */

import { AgentREPL } from './repl/agent-repl.js';
import { plannerAgent } from './agents/planner.js';
import { deepAnalyze, smartDecompose, generateSuggestions, detectDangerousOperations } from './agents/enhanced-planner.js';
import { taskDecomposer } from './planning/decomposer.js';
import { workflowGenerator } from './planning/workflow-generator.js';
import { toolDetector } from './tools/detector.js';
import { optimizer } from './learning/optimizer.js';
import { knowledgeBase } from './learning/knowledge.js';
import { executionHistory } from './learning/history.js';
import { adaptiveLearning } from './learning/adaptive.js';

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0] || '';

/**
 * Quick execute mode - run a task directly from command line
 */
async function quickExecute(goal: string): Promise<void> {
  console.log('\n🎯 Genesis Quick Execute');
  console.log('='.repeat(60));
  console.log(`\nGoal: ${goal}\n`);

  try {
    // 1. Deep Analysis (enhanced)
    console.log('🧠 Analyzing...');
    const analysis = deepAnalyze(goal);
    console.log(`   Domain: ${analysis.domain}`);
    console.log(`   Complexity: ${analysis.complexity}`);
    console.log(`   Estimated steps: ${analysis.estimatedSteps}`);

    // 2. Smart Decompose with dependencies
    console.log('\n🔨 Breaking into tasks...');
    const tasks = await smartDecompose(analysis, goal);
    console.log(`   Created ${tasks.length} tasks`);
    tasks.forEach((task: any, i: number) => {
      const deps = task.dependencies?.length > 0 ? ` (depends on: ${task.dependencies.join(', ')})` : '';
      console.log(`   ${i + 1}. [${task.agentType.toUpperCase()}] ${task.name}${deps}`);
    });

    // 3. Generate smart suggestions
    const suggestions = generateSuggestions(goal, analysis);
    if (suggestions.length > 0) {
      console.log('\n💡 Smart Suggestions:');
      suggestions.forEach(s => console.log(`   ${s}`));
    }

    // 3.5. Detect dangerous operations
    const dangerCheck = detectDangerousOperations(goal);
    if (dangerCheck.isDangerous) {
      console.log('\n🚨 DANGER DETECTED:');
      console.log(`   Severity: ${dangerCheck.severity.toUpperCase()}`);
      dangerCheck.warnings.forEach(w => console.log(`   ${w}`));
    }

    // 4. Detect tools
    console.log('\n🔍 Checking tools...');
    const detection = toolDetector.detectAll(analysis, tasks);
    console.log(`   Required: ${detection.requiredTools.length}`);
    console.log(`   Missing: ${detection.missingTools.length}`);

    if (detection.missingTools.length > 0) {
      console.log('\n   ⚠️  Missing tools:');
      detection.missingTools.forEach(req => {
        console.log(`   - ${req.tool.name}`);
      });
    }

    // 5. Generate workflow
    console.log('\n📋 Generating workflow...');
    const workflow = workflowGenerator.generateWorkflow(goal, tasks);
    console.log(`   Workflow ID: ${workflow.id}`);
    console.log(`   Tasks: ${workflow.tasks.length}`);

    // 6. Optimize
    console.log('\n🧠 Optimizing...');
    const optimization = optimizer.optimize({ goal, analysis, tasks, workflow });
    if (optimization.optimized) {
      console.log(`   Applied ${optimization.changes.length} optimizations`);
      optimization.changes.forEach(change => {
        console.log(`   • ${change.description}`);
      });
    }

    // 7. Predict
    const prediction = optimizer.predictSuccess({ goal, analysis, tasks, workflow });
    console.log(`\n📊 Success Prediction: ${prediction.probability.toFixed(1)}%`);
    prediction.factors.forEach(factor => {
      console.log(`   • ${factor}`);
    });

    // 8. Get recommendations
    const recommendations = optimizer.getRecommendations(goal, analysis.domain);
    if (recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      recommendations.slice(0, 3).forEach(rec => {
        console.log(`   • ${rec}`);
      });
    }

    // 9. Get knowledge base info
    const kbRecs = knowledgeBase.getRecommendations(analysis.domain);
    if (kbRecs.length > 0) {
      console.log('\n📚 Related Knowledge:');
      kbRecs.slice(0, 2).forEach(kb => {
        console.log(`   • ${kb.title}`);
      });
    }

    // 10. Show adaptive learning stats
    const alsStats = adaptiveLearning.getStatistics();
    if (alsStats.totalInsights > 0) {
      console.log('\n🧠 Adaptive Learning Stats:');
      console.log(`   Total executions: ${alsStats.totalInsights}`);
      console.log(`   Success rate: ${alsStats.successRate.toFixed(1)}%`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Planning complete!\n');
    console.log('To execute with auto-execution: --execute flag\n');

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
  const repl = new AgentREPL();
  await repl.start();
}

/**
 * Show help
 */
function showHelp(): void {
  console.log(`
🤖 Genesis CLI - Natural Language Agent Interface

Usage:
  npx tsx src/cli.ts                    Start in REPL mode
  npx tsx src/cli.ts "your task"        Execute task directly
  npx tsx src/cli.ts --repl             Explicit REPL mode
  npx tsx src/cli.ts --help             Show this help

Examples:
  npx tsx src/cli.ts "Scrape Qatar tourism events"
  npx tsx src/cli.ts "Fix the login bug"
  npx tsx src/cli.ts "Implement JWT authentication"

In REPL mode:
  Just type naturally what you want to do!
  • "Scrape website data"
  • "Fix this bug"
  • "Help me implement..."

  Commands:
  /help    - Show help
  /status  - Show system status
  /history - Show execution history
  /learn   - Show learned insights
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
    console.log('Genesis v2.0.0');
    return;
  }

  // Check for natural language triggers
  const fullCommand = args.join(' ');
  const lower = fullCommand.toLowerCase();

  // Trigger phrases for Agent mode
  const agentTriggers = [
    'open agent',
    'start agent',
    'agent mode',
    '^agent$',
    '^genesis$',
    'hey agent',
    'hey genesis',
  ];

  const isAgentTrigger = agentTriggers.some(trigger => {
    if (trigger.startsWith('^') && trigger.endsWith('$')) {
      return new RegExp(trigger, 'i').test(lower);
    }
    return lower.includes(trigger.toLowerCase());
  });

  if (isAgentTrigger) {
    console.log('\n🤖 Starting Genesis Agent Mode...\n');
    await startREPL();
    return;
  }

  // If there's a task, execute it directly
  if (fullCommand) {
    await quickExecute(fullCommand);
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
      await quickExecute(pipedCommand);
      return;
    }
  }

  // Default: start REPL
  await startREPL();
}

main().catch(console.error);
