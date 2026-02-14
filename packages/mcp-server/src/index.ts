#!/usr/bin/env node

/**
 * Project Genesis MCP Server
 * 
 * A lightweight MCP server for personal agent orchestration.
 * Enables users to coordinate multiple AI agents for complex tasks
 * through stdio transport (compatible with OpenCode, Claude Desktop, etc.)
 */

import { startServer } from './server.js';

async function main() {
  console.error('Starting Project Genesis MCP Server...');
  
  try {
    await startServer();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();
