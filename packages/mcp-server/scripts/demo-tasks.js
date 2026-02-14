#!/usr/bin/env node

/**
 * Genesis MCP Server - 交互式测试脚本
 * 模拟用户布置任务并执行
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function separator() {
  log('========================================', 'bright');
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runDemo() {
  separator();
  log('🚀 Genesis MCP Server - 任务测试演示', 'bright');
  separator();
  
  const serverPath = join(__dirname, '../dist/index.js');
  
  try {
    // 连接到 MCP Server
    log('\n📡 正在连接 Genesis MCP Server...', 'cyan');
    const client = new Client(
      { name: 'demo-client', version: '1.0.0' },
      { capabilities: {} }
    );
    
    const transport = new StdioClientTransport({
      command: 'node',
      args: [serverPath]
    });

    await client.connect(transport);
    log('✅ 连接成功！\n', 'green');

    // ========================================
    // 任务 1: 创建工作流
    // ========================================
    separator();
    log('📝 任务 1: 创建一个代码审查工作流', 'magenta');
    separator();
    
    log('\n👤 用户指令: "创建一个代码审查工作流，包含Scout分析、Reviewer检查、Tester测试"\n', 'yellow');
    
    const createResult = await client.callTool({
      name: 'workflow_create',
      arguments: {
        name: 'my-code-review',
        description: '我的代码审查工作流 - 多维度检查代码质量',
        tasks: [
          {
            id: 'step-1',
            agentType: 'scout',
            description: '分析代码结构和变更范围',
            template: '分析 {{file}} 的代码结构和变更'
          },
          {
            id: 'step-2',
            agentType: 'reviewer',
            description: '检查代码质量和最佳实践',
            template: '审查代码质量、安全性和性能'
          },
          {
            id: 'step-3',
            agentType: 'tester',
            description: '验证测试覆盖率和质量',
            template: '检查测试覆盖率和测试质量'
          },
          {
            id: 'step-4',
            agentType: 'docs',
            description: '更新相关文档',
            template: '更新代码文档和注释'
          }
        ],
        variables: [
          { name: 'file', description: '要审查的文件路径', required: true },
          { name: 'priority', description: '优先级', required: false }
        ]
      }
    });

    const workflowData = JSON.parse(createResult.content[0].text);
    log(`✅ 工作流创建成功！`, 'green');
    log(`   ID: ${workflowData.workflowId}`, 'cyan');
    log(`   名称: ${workflowData.workflow.name}`, 'cyan');
    log(`   任务数: ${workflowData.workflow.tasks.length}`, 'cyan');
    
    await sleep(1000);

    // ========================================
    // 任务 2: 查看所有工作流
    // ========================================
    separator();
    log('📊 任务 2: 查看工作流列表', 'magenta');
    separator();
    
    log('\n👤 用户指令: "显示所有工作流"\n', 'yellow');
    
    const monitorResult = await client.callTool({
      name: 'agent_monitor',
      arguments: {}
    });

    const monitorData = JSON.parse(monitorResult.content[0].text);
    log(`📋 系统中共有 ${monitorData.workflowCount} 个工作流：\n`, 'blue');
    
    monitorData.workflows.forEach((wf, index) => {
      log(`   ${index + 1}. ${wf.name}`, 'cyan');
      log(`      描述: ${wf.description}`, 'reset');
      log(`      任务: ${wf.tasks.length} 个`, 'reset');
      log(`      创建: ${wf.created_at}`, 'reset');
      log('');
    });

    await sleep(1000);

    // ========================================
    // 任务 3: 执行工作流
    // ========================================
    separator();
    log('▶️  任务 3: 执行代码审查工作流', 'magenta');
    separator();
    
    log('\n👤 用户指令: "执行 my-code-review 工作流，审查 src/auth.js"\n', 'yellow');
    
    const executeResult = await client.callTool({
      name: 'agent_orchestrate',
      arguments: {
        workflowId: workflowData.workflowId,
        parallel: false,
        timeout: 300000
      }
    });

    const executeData = JSON.parse(executeResult.content[0].text);
    log(`✅ 执行计划已创建！`, 'green');
    log(`   执行ID: ${executeData.executionId}`, 'cyan');
    log(`   状态: ${executeData.status}`, 'cyan');
    log(`   任务数: ${executeData.tasks.length}`, 'cyan');
    log(`   并行模式: ${executeData.parallel ? '是' : '否'}`, 'cyan');
    
    log('\n📋 执行任务列表：', 'blue');
    executeData.tasks.forEach((task, index) => {
      const icon = task.agentType === 'scout' ? '🔍' :
                   task.agentType === 'coder' ? '💻' :
                   task.agentType === 'tester' ? '🧪' :
                   task.agentType === 'reviewer' ? '👁️' : '📝';
      log(`   ${index + 1}. ${icon} [${task.agentType}] ${task.description}`, 'reset');
      log(`      状态: ${task.status}`, 'reset');
      log('');
    });

    await sleep(1000);

    // ========================================
    // 任务 4: 自定义编排
    // ========================================
    separator();
    log('🎨 任务 4: 自定义任务编排（无需预定义工作流）', 'magenta');
    separator();
    
    log('\n👤 用户指令: "直接执行：Scout调研API + Coder实现 + Tester测试"\n', 'yellow');
    
    const customResult = await client.callTool({
      name: 'agent_orchestrate',
      arguments: {
        tasks: [
          {
            id: 'research',
            agentType: 'scout',
            description: '调研 Stripe API 文档'
          },
          {
            id: 'implement',
            agentType: 'coder',
            description: '实现支付集成代码'
          },
          {
            id: 'test',
            agentType: 'tester',
            description: '编写支付流程测试'
          }
        ],
        parallel: true,
        timeout: 600000
      }
    });

    const customData = JSON.parse(customResult.content[0].text);
    log(`✅ 自定义任务已创建！`, 'green');
    log(`   执行ID: ${customData.executionId}`, 'cyan');
    log(`   并行执行: ${customData.parallel ? '是 ⚡' : '否'}`, 'cyan');
    log(`   任务数: ${customData.tasks.length}`, 'cyan');

    await sleep(1000);

    // ========================================
    // 最终统计
    // ========================================
    separator();
    log('📈 最终统计', 'magenta');
    separator();
    
    const finalResult = await client.callTool({
      name: 'agent_monitor',
      arguments: {}
    });

    const finalData = JSON.parse(finalResult.content[0].text);
    
    log('\n📊 系统状态：', 'blue');
    log(`   总工作流数: ${finalData.workflowCount}`, 'cyan');
    log(`   总执行记录: ${finalData.totalExecutions}`, 'cyan');
    log(`   最近执行: ${finalData.recentExecutions.length} 条`, 'cyan');
    
    separator();
    log('✅ 所有任务演示完成！', 'green');
    log('\n💡 您可以在 OpenCode/Claude 中使用以下命令：', 'yellow');
    log('   @genesis Execute workflow "my-code-review" for "your file"', 'cyan');
    log('   @genesis Show workflow status', 'cyan');
    log('   @genesis Create workflow "..."', 'cyan');
    separator();

    await client.close();
    
  } catch (err) {
    log(`\n❌ 错误: ${err.message}`, 'red');
    console.error(err);
    process.exit(1);
  }
}

runDemo();
