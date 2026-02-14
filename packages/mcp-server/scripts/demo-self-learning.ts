#!/usr/bin/env tsx
/**
 * Demo: Self-Learning & Optimization (Phase 4)
 * 
 * This script demonstrates Genesis's self-learning capabilities:
 * - Execution history tracking
 * - Learning extraction from past executions
 * - Knowledge base with best practices
 * - Plan optimization based on history
 * - Success prediction
 * 
 * Usage: npx tsx scripts/demo-self-learning.ts
 */

import { executionHistory, type ExecutionRecord } from '../src/learning/history.js';
import { learningEngine } from '../src/learning/engine.js';
import { optimizer } from '../src/learning/optimizer.js';
import { knowledgeBase } from '../src/learning/knowledge.js';
import { plannerAgent } from '../src/agents/planner.js';
import { taskDecomposer } from '../src/planning/decomposer.js';
import { workflowGenerator } from '../src/planning/workflow-generator.js';

console.log('\n🧠 Genesis Self-Learning & Optimization Demo\n');
console.log('='.repeat(70));

// ============================================
// Part 1: Seed Execution History
// ============================================
console.log('\n📊 Part 1: Seeding Execution History');
console.log('-'.repeat(70));

const mockExecutions: ExecutionRecord[] = [
  {
    id: 'exec-001',
    timestamp: '2026-02-10T10:00:00Z',
    goal: 'Scrape Qatar tourism events from visitqatar.com',
    analysis: {
      domain: 'web_scraping',
      complexity: 'moderate',
      estimatedSteps: 6,
    },
    workflow: {
      id: 'wf-001',
      taskCount: 6,
      estimatedDuration: 120,
    },
    execution: {
      status: 'completed',
      startTime: '2026-02-10T10:00:00Z',
      endTime: '2026-02-10T12:30:00Z',
      actualDuration: 150,
    },
    tasks: [
      { taskId: 't1', agentType: 'scout', description: 'Explore website', status: 'completed', estimatedDuration: 30, actualDuration: 25, retries: 0 },
      { taskId: 't2', agentType: 'coder', description: 'Implement scraper', status: 'completed', estimatedDuration: 45, actualDuration: 60, retries: 1 },
      { taskId: 't3', agentType: 'tester', description: 'Test extraction', status: 'completed', estimatedDuration: 20, actualDuration: 30, retries: 2 },
      { taskId: 't4', agentType: 'coder', description: 'Run extraction', status: 'completed', estimatedDuration: 15, actualDuration: 25, retries: 0 },
      { taskId: 't5', agentType: 'docs', description: 'Generate report', status: 'completed', estimatedDuration: 10, actualDuration: 10, retries: 0 },
    ],
    tools: [
      { toolId: 'web-browser', toolName: 'Web Browser MCP', usageCount: 10, successCount: 9, failureCount: 1 },
      { toolId: 'filesystem', toolName: 'Filesystem MCP', usageCount: 5, successCount: 5, failureCount: 0 },
    ],
    metrics: {
      successRate: 100,
      onTimeCompletion: false,
      timeDeviation: 25,
      costEfficiency: 85,
      qualityScore: 90,
    },
    issues: [],
    learnings: [
      'Website required JavaScript rendering - need browser automation',
      'Rate limiting caused delays - add delays in future',
    ],
  },
  {
    id: 'exec-002',
    timestamp: '2026-02-11T14:00:00Z',
    goal: 'Scrape Dubai events from dubai.com',
    analysis: {
      domain: 'web_scraping',
      complexity: 'simple',
      estimatedSteps: 5,
    },
    workflow: {
      id: 'wf-002',
      taskCount: 5,
      estimatedDuration: 90,
    },
    execution: {
      status: 'completed',
      startTime: '2026-02-11T14:00:00Z',
      endTime: '2026-02-11T15:45:00Z',
      actualDuration: 105,
    },
    tasks: [
      { taskId: 't1', agentType: 'scout', description: 'Explore website', status: 'completed', estimatedDuration: 20, actualDuration: 20, retries: 0 },
      { taskId: 't2', agentType: 'coder', description: 'Implement scraper', status: 'completed', estimatedDuration: 40, actualDuration: 50, retries: 0 },
      { taskId: 't3', agentType: 'tester', description: 'Test extraction', status: 'completed', estimatedDuration: 15, actualDuration: 20, retries: 0 },
      { taskId: 't4', agentType: 'coder', description: 'Run extraction', status: 'completed', estimatedDuration: 10, actualDuration: 10, retries: 0 },
      { taskId: 't5', agentType: 'docs', description: 'Generate report', status: 'completed', estimatedDuration: 5, actualDuration: 5, retries: 0 },
    ],
    tools: [
      { toolId: 'web-browser', toolName: 'Web Browser MCP', usageCount: 8, successCount: 8, failureCount: 0 },
    ],
    metrics: {
      successRate: 100,
      onTimeCompletion: false,
      timeDeviation: 16,
      costEfficiency: 90,
      qualityScore: 95,
    },
    issues: [],
    learnings: [
      'Simpler site structure made extraction easier',
      'Less rate limiting than Qatar site',
    ],
  },
  {
    id: 'exec-003',
    timestamp: '2026-02-12T09:00:00Z',
    goal: 'Implement JWT authentication',
    analysis: {
      domain: 'development',
      complexity: 'complex',
      estimatedSteps: 8,
    },
    workflow: {
      id: 'wf-003',
      taskCount: 8,
      estimatedDuration: 240,
    },
    execution: {
      status: 'failed',
      startTime: '2026-02-12T09:00:00Z',
      endTime: '2026-02-12T11:00:00Z',
    },
    tasks: [
      { taskId: 't1', agentType: 'scout', description: 'Research JWT', status: 'completed', estimatedDuration: 30, actualDuration: 30, retries: 0 },
      { taskId: 't2', agentType: 'coder', description: 'Implement auth', status: 'failed', estimatedDuration: 90, actualDuration: 60, retries: 3, error: 'Token validation failed' },
      { taskId: 't3', agentType: 'tester', description: 'Write tests', status: 'skipped', estimatedDuration: 45, retries: 0 },
    ],
    tools: [
      { toolId: 'filesystem', toolName: 'Filesystem MCP', usageCount: 3, successCount: 3, failureCount: 0 },
    ],
    metrics: {
      successRate: 33,
      onTimeCompletion: false,
      timeDeviation: 0,
      costEfficiency: 40,
      qualityScore: 30,
    },
    issues: [
      { type: 'agent_error', severity: 'high', description: 'Coder agent failed to implement JWT correctly', taskId: 't2' },
    ],
    learnings: [
      'JWT implementation requires careful secret key management',
      'Coder agent needs more guidance on security best practices',
    ],
  },
  {
    id: 'exec-004',
    timestamp: '2026-02-13T10:00:00Z',
    goal: 'Fix login bug',
    analysis: {
      domain: 'debugging',
      complexity: 'simple',
      estimatedSteps: 3,
    },
    workflow: {
      id: 'wf-004',
      taskCount: 3,
      estimatedDuration: 60,
    },
    execution: {
      status: 'completed',
      startTime: '2026-02-13T10:00:00Z',
      endTime: '2026-02-13T10:45:00Z',
      actualDuration: 45,
    },
    tasks: [
      { taskId: 't1', agentType: 'scout', description: 'Reproduce bug', status: 'completed', estimatedDuration: 15, actualDuration: 10, retries: 0 },
      { taskId: 't2', agentType: 'coder', description: 'Fix code', status: 'completed', estimatedDuration: 30, actualDuration: 25, retries: 0 },
      { taskId: 't3', agentType: 'tester', description: 'Verify fix', status: 'completed', estimatedDuration: 15, actualDuration: 10, retries: 0 },
    ],
    tools: [],
    metrics: {
      successRate: 100,
      onTimeCompletion: true,
      timeDeviation: -25,
      costEfficiency: 95,
      qualityScore: 100,
    },
    issues: [],
    learnings: [
      'Quick reproduction led to fast resolution',
      'Simple bugs can be fixed efficiently',
    ],
  },
];

// Add executions to history
for (const execution of mockExecutions) {
  executionHistory.recordExecution(execution);
  console.log(`  ✅ Recorded: ${execution.goal.substring(0, 50)}... [${execution.execution.status}]`);
}

console.log(`\n  Total executions: ${executionHistory.getAllExecutions().length}`);

// ============================================
// Part 2: Learning Analysis
// ============================================
console.log('\n' + '='.repeat(70));
console.log('\n🔍 Part 2: Learning Analysis');
console.log('-'.repeat(70));

console.log('\n  Analyzing execution history...\n');
const learnings = learningEngine.analyzeHistory();

console.log(`  Found ${learnings.length} learnings:\n`);
for (const learning of learnings) {
  const icon = learning.type === 'best_practice' ? '⭐' : 
               learning.type === 'issue' ? '⚠️' : 
               learning.type === 'optimization' ? '🔧' : '💡';
  console.log(`  ${icon} [${learning.type.toUpperCase()}] ${learning.description}`);
  console.log(`     Confidence: ${learning.confidence.toFixed(0)}% | Impact: ${learning.impact}`);
  console.log(`     Based on ${learning.evidence.length} executions\n`);
}

// ============================================
// Part 3: Statistics & Insights
// ============================================
console.log('\n' + '='.repeat(70));
console.log('\n📊 Part 3: Statistics & Insights');
console.log('-'.repeat(70));

const stats = executionHistory.getStatistics();
console.log(`\n  Execution Statistics:`);
console.log(`    Total executions: ${stats.totalExecutions}`);
console.log(`    Success rate: ${stats.successRate.toFixed(1)}%`);
console.log(`    Average duration: ${stats.averageDuration.toFixed(0)} minutes`);
console.log(`    Average quality: ${stats.averageQuality.toFixed(0)}/100`);
console.log(`    Top domains: ${stats.topDomains.join(', ')}`);
console.log(`    Common issues: ${stats.commonIssues.join(', ') || 'None'}`);

// Agent performance
console.log(`\n  Agent Performance:`);
const agentTypes = ['scout', 'coder', 'tester', 'reviewer', 'docs'];
for (const agentType of agentTypes) {
  const perf = executionHistory.getAgentPerformance(agentType);
  if (perf.totalTasks > 0) {
    const status = perf.successRate > 80 ? '✅' : perf.successRate > 50 ? '⚠️' : '❌';
    console.log(`    ${status} ${agentType}: ${perf.successRate.toFixed(0)}% success (${perf.totalTasks} tasks)`);
  }
}

// ============================================
// Part 4: Knowledge Base
// ============================================
console.log('\n' + '='.repeat(70));
console.log('\n📚 Part 4: Knowledge Base');
console.log('-'.repeat(70));

const kbStats = knowledgeBase.getStatistics();
console.log(`\n  Knowledge Base Statistics:`);
console.log(`    Total entries: ${kbStats.totalEntries}`);
console.log(`    By category:`, kbStats.byCategory);
console.log(`    By domain:`, kbStats.byDomain);
console.log(`    Total tags: ${kbStats.totalTags}`);

console.log(`\n  Best Practices for Web Scraping:`);
const webScrapingKnowledge = knowledgeBase.getRecommendations('web_scraping');
for (const entry of webScrapingKnowledge.slice(0, 3)) {
  console.log(`    • ${entry.title}: ${entry.content.substring(0, 60)}...`);
}

// ============================================
// Part 5: Plan Optimization
// ============================================
console.log('\n' + '='.repeat(70));
console.log('\n🔧 Part 5: Plan Optimization');
console.log('-'.repeat(70));

const testGoal = 'Scrape events from abudhabi.com and create a report';
console.log(`\n  Goal: ${testGoal}\n`);

const analysis = plannerAgent.quickAnalyze(testGoal);
const taskNodes = taskDecomposer.decompose(analysis);
const workflow = workflowGenerator.generateWorkflow(testGoal, taskNodes);

const optimization = optimizer.optimize({
  goal: testGoal,
  analysis,
  tasks: taskNodes,
  workflow,
});

if (optimization.optimized) {
  console.log('  ✅ Optimizations found:\n');
  for (const change of optimization.changes) {
    console.log(`    [${change.type.toUpperCase()}] ${change.description}`);
    console.log(`      From: ${change.original}`);
    console.log(`      To: ${change.updated}`);
    console.log(`      Confidence: ${change.confidence}%\n`);
  }
  
  if (optimization.newEstimate) {
    console.log(`    📊 Adjusted estimate: ${optimization.newEstimate} minutes`);
  }
} else {
  console.log('  ℹ️  No optimizations needed - plan looks good!');
}

if (optimization.warnings.length > 0) {
  console.log('\n  ⚠️  Warnings:');
  for (const warning of optimization.warnings) {
    console.log(`    • ${warning}`);
  }
}

// Get recommendations
console.log('\n  💡 Recommendations:');
const recommendations = optimizer.getRecommendations(testGoal, analysis.domain);
for (const rec of recommendations.slice(0, 5)) {
  console.log(`    • ${rec}`);
}

// ============================================
// Part 6: Success Prediction
// ============================================
console.log('\n' + '='.repeat(70));
console.log('\n🔮 Part 6: Success Prediction');
console.log('-'.repeat(70));

const prediction = optimizer.predictSuccess({
  goal: testGoal,
  analysis,
  tasks: taskNodes,
  workflow,
});

console.log(`\n  Success Probability: ${prediction.probability.toFixed(1)}%`);
console.log(`  Confidence Level: ${prediction.probability > 70 ? 'HIGH ✅' : prediction.probability > 40 ? 'MEDIUM ⚠️' : 'LOW ❌'}`);

console.log('\n  Factors:');
for (const factor of prediction.factors) {
  console.log(`    • ${factor}`);
}

// Compare with best practices
console.log('\n  📋 Best Practice Alignment:');
const alignment = optimizer.compareWithBestPractices({
  goal: testGoal,
  analysis,
  tasks: taskNodes,
  workflow,
});

console.log(`    Alignment score: ${alignment.alignment}%`);
if (alignment.gaps.length > 0) {
  console.log('\n    Gaps:');
  for (const gap of alignment.gaps.slice(0, 3)) {
    console.log(`      • ${gap}`);
  }
}

// ============================================
// Part 7: High Confidence Learnings
// ============================================
console.log('\n' + '='.repeat(70));
console.log('\n⭐ Part 7: High-Confidence Learnings');
console.log('-'.repeat(70));

const highConfidence = learningEngine.getHighConfidenceLearnings(70);
console.log(`\n  ${highConfidence.length} high-confidence learnings (≥70%):\n`);

for (const learning of highConfidence.slice(0, 5)) {
  console.log(`    [${learning.confidence.toFixed(0)}%] ${learning.description}`);
  if (learning.domain) {
    console.log(`    Domain: ${learning.domain}`);
  }
  console.log('');
}

// ============================================
// Part 8: Optimization Suggestions
// ============================================
console.log('\n' + '='.repeat(70));
console.log('\n🎯 Part 8: Optimization Suggestions');
console.log('-'.repeat(70));

const suggestions = learningEngine.generateOptimizations();
console.log(`\n  ${suggestions.length} optimization suggestions:\n`);

for (const suggestion of suggestions) {
  console.log(`  📌 ${suggestion.description}`);
  console.log(`     Target: ${suggestion.target}`);
  console.log(`     Current: ${suggestion.currentApproach}`);
  console.log(`     Suggested: ${suggestion.suggestedApproach}`);
  console.log(`     Expected: ${suggestion.expectedImprovement}`);
  console.log(`     Confidence: ${suggestion.confidence}%\n`);
}

// ============================================
// Summary
// ============================================
console.log('='.repeat(70));
console.log('\n✨ Phase 4 Complete: Self-Learning & Optimization\n');

console.log('Genesis can now:');
console.log('  ✅ Record execution history');
console.log('  ✅ Extract learnings from successes and failures');
console.log('  ✅ Maintain knowledge base of best practices');
console.log('  ✅ Optimize plans based on historical data');
console.log('  ✅ Predict task success probability');
console.log('  ✅ Identify patterns and improvement opportunities');
console.log('  ✅ Compare plans against best practices');

console.log('\nKey Features:');
console.log('  📊 Execution History - Complete record of all executions');
console.log('  🧠 Learning Engine - Extract insights from patterns');
console.log('  📚 Knowledge Base - Best practices and pitfalls');
console.log('  🔧 Optimizer - Apply learnings to improve plans');
console.log('  🔮 Prediction - Forecast success probability');
console.log('  💡 Recommendations - Context-aware suggestions');

console.log('\nNew MCP Tool Added:');
console.log('  • genesis_learn - Analyze, optimize, predict, and query knowledge');

console.log('\nExample Usage:');
console.log('  genesis_learn({ action: "analyze" })');
console.log('  genesis_learn({ action: "optimize", goal: "Scrape website" })');
console.log('  genesis_learn({ action: "predict", goal: "Build API" })');
console.log('  genesis_learn({ action: "knowledge", domain: "web_scraping" })');
console.log('  genesis_learn({ action: "stats" })');

console.log('\nSelf-Evolution Capabilities:');
console.log('  📈 Learns from every execution');
console.log('  🔄 Continuously improves planning');
console.log('  🎯 Gets better with experience');
console.log('  📖 Accumulates institutional knowledge');

console.log('\n' + '='.repeat(70));
console.log('\n🚀 Genesis is now a self-learning, self-optimizing Agent System!\n');
