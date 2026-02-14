#!/usr/bin/env tsx
/**
 * Demo: MCP Tool Ecosystem (Phase 3)
 * 
 * This script demonstrates Genesis's tool ecosystem capabilities:
 * - Tool registry with 10 built-in MCP tools
 * - Tool detection based on task requirements
 * - Installation planning and suggestions
 * - Automatic tool generation for missing capabilities
 * 
 * Usage: npx tsx scripts/demo-tool-ecosystem.ts
 */

import { toolRegistry } from '../src/tools/registry.js';
import { toolDetector } from '../src/tools/detector.js';
import { toolInstaller } from '../src/tools/installer.js';
import { toolGenerator } from '../src/tools/generator.js';
import { plannerAgent } from '../src/agents/planner.js';
import { taskDecomposer } from '../src/planning/decomposer.js';

console.log('\n🛠️  Genesis MCP Tool Ecosystem Demo\n');
console.log('='.repeat(70));

// ============================================
// Part 1: Tool Registry Overview
// ============================================
console.log('\n📦 Part 1: Tool Registry Overview');
console.log('-'.repeat(70));

const stats = toolRegistry.getRegistryStats();
console.log(`\nRegistry Statistics:`);
console.log(`  Total tools: ${stats.total}`);
console.log(`  Installed: ${stats.installed}`);
console.log(`  Available: ${stats.available}`);
console.log(`  Custom tools: ${stats.custom}`);
console.log(`  Categories: ${stats.categories.join(', ')}`);

console.log('\n🔧 Built-in Tools:');
const allTools = toolRegistry.listAllTools();
for (const tool of allTools) {
  const status = tool.installed ? '✅' : '⏳';
  const auto = toolRegistry.canAutoInstall(tool.id) ? '(auto)' : '(manual)';
  console.log(`  ${status} ${tool.name} ${auto}`);
  console.log(`     Categories: ${tool.categories.join(', ')}`);
  console.log(`     Capabilities: ${tool.capabilities.length}`);
}

// ============================================
// Part 2: Tool Detection
// ============================================
console.log('\n' + '='.repeat(70));
console.log('\n🔍 Part 2: Tool Detection for Tasks');
console.log('-'.repeat(70));

const testGoals = [
  {
    name: 'Web Scraping',
    goal: 'Scrape events from visitqatar.com and save to JSON',
  },
  {
    name: 'API Development',
    goal: 'Create a REST API with database storage and file uploads',
  },
  {
    name: 'Database Operations',
    goal: 'Query the SQLite database and generate reports',
  },
  {
    name: 'Git Workflow',
    goal: 'Commit changes and push to GitHub, then create a pull request',
  },
];

for (const test of testGoals) {
  console.log(`\n🎯 Task: ${test.name}`);
  console.log(`   Goal: ${test.goal}`);
  
  // Analyze and detect
  const analysis = plannerAgent.quickAnalyze(test.goal);
  const taskNodes = taskDecomposer.decompose(analysis);
  const detection = toolDetector.detectAll(analysis, taskNodes);
  
  console.log(`   Detected Tools:`);
  for (const req of detection.requiredTools) {
    const status = req.tool.installed ? '✅' : '❌';
    const critical = req.critical ? '(critical)' : '(optional)';
    console.log(`     ${status} ${req.tool.name} ${critical}`);
  }
  
  if (detection.missingTools.length > 0) {
    console.log(`   Missing Tools:`);
    for (const req of detection.missingTools) {
      const cmd = toolRegistry.getInstallationCommand(req.tool.id);
      if (cmd) {
        console.log(`     📦 ${req.tool.name}: ${cmd}`);
      } else {
        console.log(`     🔧 ${req.tool.name}: Manual installation required`);
      }
    }
    
    const installPlan = toolDetector.generateInstallationPlan(detection);
    if (!installPlan.canProceed) {
      console.log(`   ⚠️  Cannot auto-proceed: Manual steps required`);
    }
  }
  
  console.log(`   Summary: ${detection.installedTools.length}/${detection.requiredTools.length} tools ready`);
}

// ============================================
// Part 3: Tool Search & Discovery
// ============================================
console.log('\n' + '='.repeat(70));
console.log('\n🔎 Part 3: Tool Search & Discovery');
console.log('-'.repeat(70));

const searchQueries = ['scrape', 'database', 'git', 'api', 'file'];

for (const query of searchQueries) {
  console.log(`\n  Search: "${query}"`);
  const results = toolRegistry.findToolsByKeyword(query);
  for (const tool of results.slice(0, 3)) {
    console.log(`    • ${tool.name}: ${tool.description.substring(0, 60)}...`);
  }
}

console.log('\n  Search by Category: "database"');
const dbTools = toolRegistry.findToolsByCategory('database');
for (const tool of dbTools) {
  console.log(`    • ${tool.name}`);
}

// ============================================
// Part 4: Tool Installation Simulation
// ============================================
console.log('\n' + '='.repeat(70));
console.log('\n📦 Part 4: Tool Installation (Simulation)');
console.log('-'.repeat(70));

const toolsToInstall = ['fetch', 'filesystem'];

console.log('\nSimulating installation of tools...\n');
for (const toolId of toolsToInstall) {
  const result = await toolInstaller.simulateInstall(toolId);
  console.log(`  ${result.success ? '✅' : '⏳'} ${result.message}`);
  if (result.manualInstructions) {
    console.log(`     Manual steps available`);
  }
}

// Show installation status
const installStatus = toolInstaller.getInstallationStatus();
console.log('\n  Installation Status:');
console.log(`    Installed: ${installStatus.installed.length}`);
console.log(`    Not Installed: ${installStatus.notInstalled.length}`);
console.log(`    Can Auto-Install: ${installStatus.canAutoInstall.length}`);
console.log(`    Requires Manual: ${installStatus.requiresManual.length}`);

// ============================================
// Part 5: Tool Generation
// ============================================
console.log('\n' + '='.repeat(70));
console.log('\n🔨 Part 5: Tool Generation (Self-Evolution)');
console.log('-'.repeat(70));

const missingCapabilities = [
  'web_scraping',
  'file_operations',
  'http_requests',
];

for (const capability of missingCapabilities) {
  console.log(`\n  Generating tool for: ${capability}`);
  
  const request = toolGenerator.analyzeToolNeed(capability, `Need ${capability} capability`);
  const result = toolGenerator.generateTool(request);
  
  if (result.success && result.generatedTool) {
    console.log(`    ✅ Generated: ${result.generatedTool.name}`);
    console.log(`       ID: ${result.generatedTool.id}`);
    console.log(`       Files: ${Object.keys(result.generatedTool.code).join(', ')}`);
    console.log(`       Next steps:`);
    result.installationSteps?.slice(0, 3).forEach(step => {
      console.log(`         ${step}`);
    });
  } else {
    console.log(`    ❌ Failed: ${result.message}`);
  }
}

// Show generation history
const history = toolGenerator.getGenerationHistory();
console.log(`\n  Generation History: ${history.length} tools created`);

// ============================================
// Part 6: Integrated Workflow
// ============================================
console.log('\n' + '='.repeat(70));
console.log('\n🎮 Part 6: Integrated Workflow - Complete Task Analysis');
console.log('-'.repeat(70));

const complexGoal = 'Scrape visitqatar.com events, save to SQLite database, and create a markdown report';

console.log(`\n  Goal: ${complexGoal}\n`);
console.log('  Genesis analyzing...\n');

// Full analysis pipeline
const analysis = plannerAgent.quickAnalyze(complexGoal);
console.log(`  📊 Analysis:`);
console.log(`     Domain: ${analysis.domain}`);
console.log(`     Complexity: ${analysis.complexity}`);
console.log(`     Required Tools: ${analysis.requiredTools?.join(', ') || 'None'}`);

const taskNodes = taskDecomposer.decompose(analysis);
console.log(`\n  🔨 Task Decomposition: ${taskNodes.length} tasks`);

taskNodes.forEach((task, i) => {
  console.log(`     ${i + 1}. [${task.agentType.toUpperCase()}] ${task.name}`);
});

const detection = toolDetector.detectAll(analysis, taskNodes);
console.log(`\n  🔍 Tool Detection:`);
console.log(`     Required: ${detection.requiredTools.length}`);
console.log(`     Installed: ${detection.installedTools.length}`);
console.log(`     Missing: ${detection.missingTools.length}`);

if (detection.missingTools.length > 0) {
  console.log(`\n  📦 Missing Tools:`);
  for (const req of detection.missingTools) {
    console.log(`     ❌ ${req.tool.name} (${req.critical ? 'critical' : 'optional'})`);
    const canGenerate = !toolRegistry.getTool(req.tool.id);
    if (canGenerate) {
      console.log(`        💡 Can generate automatically`);
    }
  }
  
  console.log(`\n  🎯 Recommendations:`);
  console.log(`     1. Install missing tools with: genesis_tool_manage`);
  console.log(`     2. Generate custom tools if needed`);
  console.log(`     3. Or use alternative tools: ${detection.missingTools[0]?.alternatives.map(a => a.name).join(', ') || 'None'}`);
}

// ============================================
// Summary
// ============================================
console.log('\n' + '='.repeat(70));
console.log('\n✨ Phase 3 Complete: MCP Tool Ecosystem\n');

console.log('Genesis can now:');
console.log('  ✅ Maintain registry of 10+ MCP tools');
console.log('  ✅ Detect required tools from task descriptions');
console.log('  ✅ Analyze tool gaps and missing capabilities');
console.log('  ✅ Suggest installation commands');
console.log('  ✅ Generate new MCP tools automatically');
console.log('  ✅ Provide alternatives when tools are missing');

console.log('\nKey Features:');
console.log('  📦 Tool Registry - 10 built-in tools across 5 categories');
console.log('  🔍 Tool Detection - Pattern matching for requirements');
console.log('  📊 Installation Planning - Auto vs manual installation');
console.log('  🔨 Tool Generation - Create missing tools on demand');
console.log('  🔄 Self-Evolution - System can extend its own capabilities');

console.log('\nNew MCP Tools Added:');
console.log('  • genesis_tool_manage - List, detect, install, generate tools');

console.log('\nExample Usage:');
console.log('  genesis_tool_manage({ action: "list" })');
console.log('  genesis_tool_manage({ action: "detect", goal: "Scrape website" })');
console.log('  genesis_tool_manage({ action: "install", toolId: "web-browser" })');
console.log('  genesis_tool_manage({ action: "generate", capability: "web_scraping" })');

console.log('\n' + '='.repeat(70));
console.log('\nNext: Phase 4 - Self-Learning & Optimization\n');
