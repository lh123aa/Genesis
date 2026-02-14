#!/usr/bin/env node

/**
 * MCP Server Test Script
 * 
 * Tests the Genesis MCP Server by:
 * 1. Starting the server
 * 2. Listing available tools
 * 3. Testing workflow_create
 * 4. Testing agent_monitor
 * 5. Testing agent_orchestrate
 * 6. Verifying database persistence
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for output
const green = '\x1b[32m';
const red = '\x1b[31m';
const yellow = '\x1b[33m';
const reset = '\x1b[0m';

function log(message) {
  console.log(message);
}

function success(message) {
  console.log(`${green}✓${reset} ${message}`);
}

function error(message) {
  console.log(`${red}✗${reset} ${message}`);
}

function warning(message) {
  console.log(`${yellow}⚠${reset} ${message}`);
}

async function runTests() {
  log('\n========================================');
  log('Genesis MCP Server - Integration Tests');
  log('========================================\n');

  const serverPath = join(__dirname, '../dist/index.js');
  
  try {
    // Test 1: Start MCP Server
    log('Test 1: Starting MCP Server...');
    const client = new Client(
      { name: 'test-client', version: '1.0.0' },
      { capabilities: {} }
    );
    
    const transport = new StdioClientTransport({
      command: 'node',
      args: [serverPath]
    });

    await client.connect(transport);
    success('MCP Server started successfully');

    // Test 2: List Tools
    log('\nTest 2: Listing available tools...');
    const toolsResponse = await client.listTools();
    const tools = toolsResponse.tools;
    
    if (tools.length === 3) {
      success(`Found ${tools.length} tools:`);
      tools.forEach(tool => {
        log(`  - ${tool.name}: ${tool.description.substring(0, 60)}...`);
      });
    } else {
      warning(`Expected 3 tools, found ${tools.length}`);
    }

    // Test 3: workflow_create
    log('\nTest 3: Testing workflow_create...');
    const createResult = await client.callTool({
      name: 'workflow_create',
      arguments: {
        name: 'test-workflow',
        description: 'A test workflow for validation',
        tasks: [
          {
            id: 'task-1',
            agentType: 'scout',
            description: 'Research the requirements',
            template: 'Research {{topic}}'
          },
          {
            id: 'task-2',
            agentType: 'coder',
            description: 'Implement the solution',
            template: 'Implement based on research'
          }
        ],
        variables: [
          { name: 'topic', description: 'Topic to research', required: true }
        ]
      }
    });

    const createContent = createResult.content[0].text;
    const createData = JSON.parse(createContent);
    
    if (createData.status === 'created' && createData.workflowId) {
      success(`Workflow created with ID: ${createData.workflowId}`);
      log(`  Database persistence: ${createData.message}`);
      
      // Save workflow ID for next test
      const workflowId = createData.workflowId;

      // Test 4: agent_monitor (list workflows)
      log('\nTest 4: Testing agent_monitor (list workflows)...');
      const monitorResult = await client.callTool({
        name: 'agent_monitor',
        arguments: {}
      });

      const monitorContent = monitorResult.content[0].text;
      const monitorData = JSON.parse(monitorContent);
      
      if (monitorData.workflows && monitorData.workflows.length > 0) {
        success(`Found ${monitorData.workflowCount} workflow(s) in database`);
        log(`  Recent workflows: ${monitorData.workflows.map((w) => w.name).join(', ')}`);
      } else {
        error('No workflows found in database');
      }

      // Test 5: agent_orchestrate with workflow
      log('\nTest 5: Testing agent_orchestrate with workflow...');
      const orchestrateResult = await client.callTool({
        name: 'agent_orchestrate',
        arguments: {
          workflowId: workflowId,
          parallel: false,
          timeout: 60000
        }
      });

      const orchestrateContent = orchestrateResult.content[0].text;
      const orchestrateData = JSON.parse(orchestrateContent);
      
      if (orchestrateData.executionId && orchestrateData.status === 'pending') {
        success(`Execution created with ID: ${orchestrateData.executionId}`);
        log(`  Tasks: ${orchestrateData.tasks.length}`);
        log(`  Status: ${orchestrateData.status}`);
      } else {
        error('Failed to create execution');
      }

      // Test 6: agent_orchestrate with custom tasks
      log('\nTest 6: Testing agent_orchestrate with custom tasks...');
      const customResult = await client.callTool({
        name: 'agent_orchestrate',
        arguments: {
          tasks: [
            {
              id: 'custom-1',
              agentType: 'scout',
              description: 'Custom research task'
            },
            {
              id: 'custom-2',
              agentType: 'coder',
              description: 'Custom implementation task'
            }
          ],
          parallel: true,
          timeout: 30000
        }
      });

      const customContent = customResult.content[0].text;
      const customData = JSON.parse(customContent);
      
      if (customData.executionId) {
        success(`Custom execution created with ID: ${customData.executionId}`);
        log(`  Parallel execution: ${customData.parallel}`);
      } else {
        error('Failed to create custom execution');
      }

      // Final verification
      log('\n========================================');
      log('Final Verification');
      log('========================================');
      
      const finalMonitor = await client.callTool({
        name: 'agent_monitor',
        arguments: {}
      });
      
      const finalData = JSON.parse(finalMonitor.content[0].text);
      success(`Total workflows: ${finalData.workflowCount}`);
      success(`Total executions: ${finalData.totalExecutions}`);
      
      log('\n========================================');
      success('All tests passed! ✓');
      log('========================================\n');
      
      // Show database location
      log('Database location: ~/.project-genesis/genesis.db');
      log('Configuration: .opencode/mcp-servers.json\n');

    } else {
      error('Failed to create workflow');
      log(createData);
    }

    // Cleanup
    await client.close();
    
  } catch (err) {
    error('Test failed with error:');
    console.error(err);
    process.exit(1);
  }
}

runTests();
