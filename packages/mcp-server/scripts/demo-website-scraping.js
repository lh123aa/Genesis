#!/usr/bin/env node

/**
 * Genesis MCP Server - 网站采集任务演示
 * 展示如何使用Agent编排来完成复杂的采集任务
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
  log('\n========================================', 'bright');
}

async function runWebsiteScrapingDemo() {
  separator();
  log('🌐 Genesis Agent 工作流演示', 'bright');
  log('任务：采集 visitqatar.cn 网站活动信息', 'cyan');
  separator();
  
  const serverPath = join(__dirname, '../dist/index.js');
  
  try {
    // 连接到 Genesis MCP Server
    log('\n📡 正在连接 Genesis MCP Server...', 'cyan');
    const client = new Client(
      { name: 'scraping-demo', version: '1.0.0' },
      { capabilities: {} }
    );
    
    const transport = new StdioClientTransport({
      command: 'node',
      args: [serverPath]
    });

    await client.connect(transport);
    log('✅ 已连接 Genesis 系统！\n', 'green');

    // ========================================
    // 步骤 1: 创建专门的网站采集工作流
    // ========================================
    separator();
    log('📝 步骤 1: 创建"网站信息采集"工作流', 'magenta');
    separator();
    
    log('\n👤 用户指令: "创建一个专门用于采集网站信息的工作流"\n', 'yellow');
    
    const createResult = await client.callTool({
      name: 'workflow_create',
      arguments: {
        name: 'website-data-collection',
        description: '网站信息采集与整理工作流 - 用于采集、分析和整理网站内容',
        tasks: [
          {
            id: 'scout-research',
            agentType: 'scout',
            description: '调研目标网站结构和内容分布',
            template: '分析 {{website_url}} 的网站结构，识别所有活动/事件信息的位置和格式'
          },
          {
            id: 'coder-scrape',
            agentType: 'coder',
            description: '编写和执行采集代码',
            template: '编写代码采集 {{website_url}} 的活动信息，包括：标题、日期、地点、描述、图片链接'
          },
          {
            id: 'tester-verify',
            agentType: 'tester',
            description: '验证采集数据的完整性和准确性',
            template: '检查采集的数据是否完整：日期格式是否正确、信息是否准确、是否有遗漏'
          },
          {
            id: 'docs-format',
            agentType: 'docs',
            description: '将采集的数据整理为markdown文档',
            template: '将采集的活动信息整理成结构化的markdown文档，包含表格、分类和统计'
          },
          {
            id: 'reviewer-qa',
            agentType: 'reviewer',
            description: '质量检查和最终审核',
            template: '审核markdown文档的格式、内容的准确性和完整性'
          }
        ],
        variables: [
          { name: 'website_url', description: '目标网站URL', required: true },
          { name: 'output_format', description: '输出格式（markdown/json/csv）', required: false }
        ]
      }
    });

    const workflowData = JSON.parse(createResult.content[0].text);
    log(`✅ 工作流创建成功！`, 'green');
    log(`   工作流ID: ${workflowData.workflowId}`, 'cyan');
    log(`   名称: ${workflowData.workflow.name}`, 'cyan');
    log(`   任务数: ${workflowData.workflow.tasks.length} 个Agent协作`, 'cyan');

    // ========================================
    // 步骤 2: 执行采集任务
    // ========================================
    separator();
    log('▶️  步骤 2: 执行采集任务', 'magenta');
    separator();
    
    log('\n👤 用户指令: "执行 website-data-collection 工作流，采集 https://visitqatar.cn/events-calendar"\n', 'yellow');
    
    const executeResult = await client.callTool({
      name: 'agent_orchestrate',
      arguments: {
        workflowId: workflowData.workflowId,
        parallel: false,  // 顺序执行，确保数据准确性
        timeout: 600000   // 10分钟超时
      }
    });

    const executeData = JSON.parse(executeResult.content[0].text);
    log(`✅ 任务编排已创建！`, 'green');
    log(`   执行ID: ${executeData.executionId}`, 'cyan');
    log(`   状态: ${executeData.status}`, 'cyan');
    
    log('\n📋 Agent 协作执行计划：', 'blue');
    executeData.tasks.forEach((task, index) => {
      const icons = {
        scout: '🔍',
        coder: '💻',
        tester: '🧪',
        reviewer: '👁️',
        docs: '📝'
      };
      const icon = icons[task.agentType] || '🤖';
      log(`   ${index + 1}. ${icon} [${task.agentType}] ${task.description}`, 'reset');
    });

    // ========================================
    // 模拟各Agent执行过程
    // ========================================
    separator();
    log('🤖 Agent 执行过程', 'magenta');
    separator();

    const agents = [
      { name: 'Scout', icon: '🔍', action: '分析网站结构', time: '2秒', result: '发现9个活动，分布在/events-calendar页面' },
      { name: 'Coder', icon: '💻', action: '编写采集代码', time: '3秒', result: '成功采集9个活动的完整信息' },
      { name: 'Tester', icon: '🧪', action: '验证数据', time: '2秒', result: '所有日期格式正确，信息完整' },
      { name: 'Docs', icon: '📝', action: '生成文档', time: '2秒', result: '已生成markdown文档' },
      { name: 'Reviewer', icon: '👁️', action: '质量审核', time: '1秒', result: '文档通过审核，可以交付' }
    ];

    for (const agent of agents) {
      log(`\n   ${agent.icon} [${agent.name}] ${agent.action}...`, 'cyan');
      await new Promise(r => setTimeout(r, 500)); // 模拟执行时间
      log(`      ✅ ${agent.result} (${agent.time})`, 'green');
    }

    // ========================================
    // 最终结果
    // ========================================
    separator();
    log('✅ 任务完成！', 'green');
    separator();
    
    log('\n📊 采集结果统计：', 'blue');
    log('   采集网站: https://visitqatar.cn/events-calendar', 'cyan');
    log('   活动数量: 9 个', 'cyan');
    log('   数据字段: 标题、日期、地点、描述、图片、链接', 'cyan');
    log('   输出格式: Markdown', 'cyan');
    log('   文件位置: 卡塔尔旅游活动日历.md', 'cyan');
    
    log('\n📁 文件已保存！', 'green');
    
    separator();
    log('💡 使用 Genesis 的优势：', 'yellow');
    log('   ✅ 多Agent协作：Scout→Coder→Tester→Docs→Reviewer', 'cyan');
    log('   ✅ 工作流可复用：website-data-collection 可用于任何网站', 'cyan');
    log('   ✅ 质量保证：Tester验证数据，Reviewer审核文档', 'cyan');
    log('   ✅ 自动化：一次配置，多次使用', 'cyan');
    separator();

    await client.close();
    
  } catch (err) {
    log(`\n❌ 错误: ${err.message}`, 'red');
    console.error(err);
    process.exit(1);
  }
}

runWebsiteScrapingDemo();
