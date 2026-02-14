#!/usr/bin/env tsx
/**
 * Demo: Natural Language Agent Mode
 * 
 * Demonstrates how easy it is to use Genesis:
 * Just type naturally and Genesis understands!
 * 
 * Usage: npx tsx scripts/demo-agent-mode.ts
 */

console.log('\n🎯 Genesis Natural Language Agent Demo\n');
console.log('='.repeat(70));

console.log(`
Imagine you're in a conversation with Genesis:

User: "open agent"
System: 🤖 Starting Genesis Agent Mode...

User: "I need to scrape Qatar tourism events and create a report"
System: 🧠 Analyzing... 
        Domain: web_scraping
        Complexity: moderate
        
        🔨 Breaking into tasks...
        Created 6 tasks:
        1. [SCOUT] Explore Target
        2. [SCOUT] Design Extraction Strategy
        3. [CODER] Implement Scraper
        4. [TESTER] Test Extraction
        5. [CODER] Run Full Extraction
        6. [DOCS] Generate Report
        
        🔍 Checking tools...
        Required: 3 tools
        Missing: 2 tools (web-browser, filesystem)
        
        📊 Success Prediction: 85%
        
        💡 Recommendations:
        • Add 1-2 second delays between requests
        • Use browser automation for JavaScript content
        
        Ready to execute!

User: "Actually, can you just fix the login bug instead?"
System: 🧠 Understanding... "Fix login bug"
        
        🔨 Breaking into tasks...
        1. [SCOUT] Reproduce Issue
        2. [SCOUT] Analyze Root Cause
        3. [CODER] Implement Fix
        4. [TESTER] Test Fix
        5. [TESTER] Regression Testing
        
        📊 Success Prediction: 92%
        
        Ready!

User: "What can you do?"
System: 🤖 I can help you with:
        • Planning and executing complex tasks
        • Coordinating multiple AI agents
        • Managing tools automatically
        • Learning from experience
        
        Just tell me what you want!

User: "/status"
System: 🤖 System Status:
        • Executions: 12
        • Success Rate: 85%
        • Knowledge: 15 entries
        • Agents: 5 available
        
User: "/exit"
System: 👋 Goodbye!
`);

console.log('='.repeat(70));
console.log('\n✨ How Easy Is That!\n');

console.log('📋 Different Ways to Use Genesis:\n');

console.log('1. 🎯 Direct Task Execution:');
console.log('   npx tsx src/cli.ts "Scrape Qatar events"');
console.log('   → Immediate task planning and execution\n');

console.log('2. 🤖 Interactive Agent Mode:');
console.log('   npx tsx src/cli.ts');
console.log('   → REPL-style conversation\n');

console.log('3. 🔗 Natural Language Trigger:');
console.log('   npx tsx src/cli.ts "open agent"');
console.log('   → Starts Agent mode from command\n');

console.log('4. 🔌 MCP Server Mode:');
console.log('   Add to .opencode/mcp-servers.json:');
console.log('   {');
console.log('     "mcpServers": {');
console.log('       "genesis": {');
console.log('         "command": "npx",');
console.log('         "args": ["tsx", "packages/mcp-server/src/cli.ts"]');
console.log('       }');
console.log('     }');
console.log('   }');
console.log('   → Use in OpenCode: "@genesis Scrape website"\n');

console.log('5. 💬 In Conversation:');
console.log('   User: "open agent" or "Agent"');
console.log('   → Automatically enters Agent mode\n');

console.log('='.repeat(70));
console.log('\n🎮 Try It Now!\n');

console.log('Quick test - Execute a task:');
console.log('$ npx tsx packages/mcp-server/src/cli.ts "Scrape visitqatar.com events"\n');

console.log('Or start interactive mode:');
console.log('$ npx tsx packages/mcp-server/src/cli.ts\n');

console.log('='.repeat(70));
console.log('\n✨ Demo Complete!\n');
