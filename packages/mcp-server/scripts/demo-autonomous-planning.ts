#!/usr/bin/env tsx
/**
 * Demo: Autonomous Planning with Genesis
 * 
 * This script demonstrates Phase 2: Genesis can now think and plan autonomously.
 * 
 * Usage: npx tsx scripts/demo-autonomous-planning.ts
 */

import { plannerAgent } from '../src/agents/planner.js';
import { agentRegistry } from '../src/agents/registry.js';
import { taskDecomposer } from '../src/planning/decomposer.js';
import { workflowGenerator } from '../src/planning/workflow-generator.js';

console.log('\n🚀 Genesis Autonomous Planning Demo\n');
console.log('='.repeat(60));

// Test goals
const testGoals = [
  {
    name: 'Web Scraping Task',
    goal: '抓取 visitqatar.com 的活动信息并生成 markdown 报告',
    context: {
      projectType: 'web scraping',
      techStack: ['TypeScript', 'Playwright'],
    },
  },
  {
    name: 'Feature Development',
    goal: 'Implement JWT authentication with refresh tokens for my REST API',
    context: {
      projectType: 'backend API',
      techStack: ['Node.js', 'Express', 'TypeScript'],
    },
  },
  {
    name: 'Bug Fix',
    goal: 'Fix the intermittent login failure that happens on production but not locally',
    context: {
      projectType: 'web application',
      techStack: ['React', 'Node.js'],
    },
  },
  {
    name: 'Documentation',
    goal: 'Create comprehensive API documentation with examples for my GraphQL endpoint',
    context: {
      projectType: 'API documentation',
      techStack: ['GraphQL', 'Node.js'],
    },
  },
];

console.log('\n📊 Agent Registry Status');
console.log('-'.repeat(40));
const stats = agentRegistry.getRegistryStats();
console.log(`Total Agents: ${stats.totalAgents}`);
console.log(`Agent Types: ${stats.agentTypes.join(', ')}`);
console.log(`Total Capabilities: ${stats.totalCapabilities}`);

console.log('\n🤖 Available Agents');
console.log('-'.repeat(40));
for (const agent of agentRegistry.listAvailableAgents()) {
  console.log(`\n${agent.name} (${agent.type})`);
  console.log(`  Description: ${agent.description}`);
  console.log(`  Capabilities: ${agent.capabilities.map(c => c.name).join(', ')}`);
}

console.log('\n' + '='.repeat(60));

// Process each test goal
for (const testCase of testGoals) {
  console.log(`\n🎯 Test Case: ${testCase.name}`);
  console.log(`   Goal: ${testCase.goal}`);
  console.log('\n' + '-'.repeat(60));

  // Step 1: Analyze
  console.log('\n  📊 Step 1: Analyzing Goal');
  const analysis = plannerAgent.analyze({
    goal: testCase.goal,
    context: testCase.context,
  });

  console.log(`     Domain: ${analysis.domain}`);
  console.log(`     Complexity: ${analysis.complexity}`);
  console.log(`     Estimated Steps: ${analysis.estimatedSteps}`);
  console.log(`     Requires Research: ${analysis.requiresResearch ? 'Yes' : 'No'}`);
  console.log(`     Requires Implementation: ${analysis.requiresImplementation ? 'Yes' : 'No'}`);
  console.log(`     Requires Testing: ${analysis.requiresTesting ? 'Yes' : 'No'}`);
  console.log(`     Keywords: ${analysis.keywords.join(', ') || 'None'}`);
  console.log(`\n     Suggested Approach:`);
  console.log(`       ${analysis.suggestedApproach}`);
  
  if (analysis.potentialChallenges.length > 0) {
    console.log(`\n     ⚠️  Potential Challenges:`);
    analysis.potentialChallenges.forEach(challenge => {
      console.log(`       • ${challenge}`);
    });
  }

  if (analysis.requiredTools && analysis.requiredTools.length > 0) {
    console.log(`\n     🛠️  Required Tools: ${analysis.requiredTools.join(', ')}`);
  }

  // Step 2: Decompose
  console.log('\n  🔨 Step 2: Decomposing Tasks');
  const taskNodes = taskDecomposer.decompose(analysis);
  console.log(`     Generated ${taskNodes.length} tasks:`);

  for (const task of taskNodes) {
    console.log(`\n     Task: ${task.name}`);
    console.log(`       Agent: ${task.agentType}`);
    console.log(`       Duration: ${task.estimatedDuration} min`);
    console.log(`       Dependencies: ${task.dependencies.length > 0 ? task.dependencies.join(', ') : 'None'}`);
    if (task.metadata?.priority) {
      console.log(`       Priority: ${task.metadata.priority}`);
    }
  }

  // Step 3: Generate Workflow
  console.log('\n  📋 Step 3: Generating Workflow');
  const workflow = workflowGenerator.generateWorkflow(testCase.goal, taskNodes, {
    name: `demo-${analysis.domain}`,
    description: `Demo workflow for: ${testCase.goal}`,
  });

  console.log(`     Workflow ID: ${workflow.id}`);
  console.log(`     Workflow Name: ${workflow.name}`);
  console.log(`     Total Tasks: ${workflow.tasks.length}`);
  console.log(`     Estimated Duration: ${workflow.metadata?.estimatedDuration} minutes`);
  console.log(`     Generated At: ${workflow.metadata?.generatedAt}`);

  // Step 4: Generate Plan
  console.log('\n  🎯 Step 4: Execution Strategy');
  const plan = workflowGenerator.generatePlan(testCase.goal, analysis, taskNodes);
  
  console.log(`     Plan ID: ${plan.planId}`);
  console.log(`\n     Parallel Groups:`);
  if (plan.executionStrategy.parallelGroups.length > 0) {
    plan.executionStrategy.parallelGroups.forEach((group, i) => {
      console.log(`       Group ${i + 1}: ${group.join(', ')}`);
    });
  } else {
    console.log(`       No parallel groups (sequential execution)`);
  }
  
  console.log(`\n     Critical Path: ${plan.executionStrategy.criticalPath.join(' → ')}`);
  console.log(`     Total Duration: ${plan.executionStrategy.estimatedTotalDuration} minutes`);

  // Validate workflow
  console.log('\n  ✓ Step 5: Validating Workflow');
  const validation = workflowGenerator.validateWorkflow(workflow);
  if (validation.valid) {
    console.log('     ✅ Workflow is valid');
  } else {
    console.log('     ❌ Workflow has errors:');
    validation.errors.forEach(error => {
      console.log(`       • ${error}`);
    });
  }

  console.log('\n' + '='.repeat(60));
}

// Interactive example
console.log('\n🎮 Interactive Example');
console.log('='.repeat(60));

const exampleGoal = 'Scrape the Qatar tourism website for events and generate a markdown report';
console.log(`\nGoal: ${exampleGoal}\n`);

console.log('Genesis is thinking...\n');

const analysis = plannerAgent.quickAnalyze(exampleGoal);
console.log(`🧠 Analysis:`);
console.log(`   This is a ${analysis.complexity} ${analysis.domain} task`);
console.log(`   Will take approximately ${analysis.estimatedSteps} steps`);

const tasks = taskDecomposer.decompose(analysis);
console.log(`\n📋 Task Breakdown:`);
tasks.forEach((task, i) => {
  const agent = agentRegistry.getAgentByType(task.agentType);
  console.log(`   ${i + 1}. [${task.agentType.toUpperCase()}] ${task.name}`);
  console.log(`      ${task.description.substring(0, 60)}...`);
  console.log(`      Estimated: ${task.estimatedDuration} min | Agent: ${agent?.name}`);
});

console.log(`\n🎯 Recommended Agent Assignment:`);
for (const task of tasks) {
  const bestAgents = agentRegistry.getAgentsForTask(task.description, task.agentType);
  const primary = bestAgents[0];
  const backup = bestAgents[1];
  console.log(`   ${task.name}: ${primary?.name}${backup ? ` (backup: ${backup.name})` : ''}`);
}

console.log('\n' + '='.repeat(60));
console.log('\n✨ Demo Complete!\n');
console.log('Genesis can now:');
console.log('  ✓ Analyze natural language goals');
console.log('  ✓ Determine domain and complexity');
console.log('  ✓ Break down into specific tasks');
console.log('  ✓ Assign appropriate agents');
console.log('  ✓ Generate executable workflows');
console.log('  ✓ Calculate execution strategy');
console.log('\nNext: Use genesis_think MCP tool to plan your tasks!\n');
