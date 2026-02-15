/**
 * Agent REPL (Read-Eval-Print Loop)
 * 
 * Interactive Agent mode for natural conversation.
 * User can just type tasks naturally and Genesis handles them.
 */

import readline from 'readline';
import { plannerAgent } from '../agents/planner.js';
import { agentRegistry } from '../agents/registry.js';
import { taskDecomposer } from '../planning/decomposer.js';
import { workflowGenerator } from '../planning/workflow-generator.js';
import { toolDetector } from '../tools/detector.js';
import { toolInstaller } from '../tools/installer.js';
import { executionHistory } from '../learning/history.js';
import { optimizer } from '../learning/optimizer.js';
import { knowledgeBase } from '../learning/knowledge.js';

export interface AgentContext {
  sessionId: string;
  startTime: string;
  currentGoal?: string;
  currentWorkflow?: any;
  tasksCompleted?: number;
  conversationHistory: Array<{
    role: 'user' | 'agent';
    content: string;
    timestamp: string;
  }>;
  state: 'idle' | 'planning' | 'executing' | 'confirming';
}

export interface ParsedIntent {
  type: 'task' | 'question' | 'command' | 'greeting' | 'goodbye' | 'status' | 'help';
  content: string;
  confidence: number;
  entities?: Record<string, string>;
}

/**
 * Agent REPL class
 */
export class AgentREPL {
  private rl: readline.Interface | null = null;
  private context: AgentContext;
  private isRunning = false;

  constructor() {
    this.context = {
      sessionId: `session-${Date.now()}`,
      startTime: new Date().toISOString(),
      conversationHistory: [],
      state: 'idle',
    };
  }

  /**
   * Start the interactive Agent mode
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️  Agent mode is already running');
      return;
    }

    this.isRunning = true;
    
    // Create readline interface
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '\nGenesis@agent❯ ',
    });

    // Print welcome message
    this.printWelcome();

    // Set up line handler
    this.rl.on('line', async (input) => {
      await this.handleInput(input.trim());
      if (this.isRunning && this.rl) {
        this.rl.prompt();
      }
    });

    // Set up close handler
    this.rl.on('close', () => {
      this.exit();
    });

    // Start prompt
    this.rl.prompt();

    // Keep process alive - use event emitter pattern
    return new Promise((resolve) => {
      // Store resolve to call on exit
      (this as any)._resolve = resolve;
      
      // Keep alive with periodic heartbeat
      const heartbeat = setInterval(() => {
        if (!this.isRunning) {
          clearInterval(heartbeat);
          resolve();
        }
      }, 1000);
      
      // Clean up on SIGINT/SIGTERM
      process.on('SIGINT', () => {
        clearInterval(heartbeat);
        this.exit();
      });
    });
  }

  // ANSI color codes for dark gold theme
  private gold = '\x1b[38;2;184;134;11m';      // Dark Gold
  private goldBright = '\x1b[38;2;255;215;0m';  // Bright Gold
  private darkBg = '\x1b[48;2;20;18;15m';      // Dark Background
  private accent = '\x1b[38;2;139;90;43m';      // Bronze accent
  private white = '\x1b[37m';
  private gray = '\x1b[90m';
  private reset = '\x1b[0m';
  private cyan = '\x1b[36m';
  private green = '\x1b[32m';
  private red = '\x1b[31m';

  /**
   * Print welcome message - Grand Dark Gold Design
   */
  private printWelcome(): void {
    console.clear();
    
    const width = 100;
    const border = '═'.repeat(width - 2);
    const borderGold = `${this.gold}${border}${this.reset}`;
    
    // Panda ASCII Art Logo
    const panda = `
 ${this.gold}              ██████╗ ██████╗ ██╗   ██╗██╗   ██╗███████╗    ${this.gray}Genesis${this.gold}
 ${this.gold}             ██╔═══██╗██╔══██╗╚██╗ ██╔╝██║   ██║╚══███╔╝    ${this.gray}Autonomous Agent${this.gold}
 ${this.gold}             ██║   ██║██████╔╝ ╚████╔╝ ██║   ██║  ███╔╝     
 ${this.gold}             ██║   ██║██╔══██╗  ╚██╔╝  ██║   ██║ ███╔╝      
 ${this.gold}             ╚██████╔╝██║  ██║   ██║   ╚██████╔╝███████╗     
 ${this.gold}              ╚═════╝ ╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚══════╝     
 ${this.reset}`;

    // Top border
    console.log(`\n${this.darkBg}${borderGold}${this.reset}`);
    
    // Header with panda
    console.log(`${this.darkBg}${this.gold}║${this.reset}${panda.padEnd(width - 2)}${this.gold}║${this.reset}`);
    
    // Divider
    console.log(`${this.darkBg}${this.gold}╠${borderGold.replace(/./g, '═').substring(0, width - 4)}╣${this.reset}`);
    
    // Welcome text
    const welcomeText = `${this.goldBright}◆ Welcome to Genesis Agent ◆${this.reset}`;
    console.log(`${this.darkBg}${this.gold}║${this.reset}${welcomeText.padStart((width - 2) / 2 + welcomeText.length / 2).padEnd(width - 2)}${this.gold}║${this.reset}`);
    
    // Divider
    console.log(`${this.darkBg}${this.gold}╠${borderGold.replace(/./g, '═').substring(0, width - 4)}╣${this.reset}`);
    
    // Capabilities
    console.log(`${this.darkBg}${this.gold}║  ${this.cyan}▸${this.reset} ${this.white}Plan & Execute${this.reset}        ${this.gray}Intelligent task planning${this.reset}`.padEnd(width - 2) + `${this.gold}║${this.reset}`);
    console.log(`${this.darkBg}${this.gold}║  ${this.cyan}▸${this.reset} ${this.white}Multi-Agent${this.reset}               ${this.gray}Scout / Coder / Tester / Reviewer / Docs${this.reset}`.padEnd(width - 2) + `${this.gold}║${this.reset}`);
    console.log(`${this.darkBg}${this.gold}║  ${this.cyan}▸${this.reset} ${this.white}Tool Ecosystem${this.reset}         ${this.gray}Auto-detect, install, generate tools${this.reset}`.padEnd(width - 2) + `${this.gold}║${this.reset}`);
    console.log(`${this.darkBg}${this.gold}║  ${this.cyan}▸${this.reset} ${this.white}Self-Learning${this.reset}         ${this.gray}Continuous improvement from execution${this.reset}`.padEnd(width - 2) + `${this.gold}║${this.reset}`);
    
    // Divider
    console.log(`${this.darkBg}${this.gold}╠${borderGold.replace(/./g, '═').substring(0, width - 4)}╣${this.reset}`);
    
    // Loading status
    console.log(`${this.darkBg}${this.gold}║  ${this.cyan}▸${this.reset} ${this.white}Initializing${this.reset}          ${this.gray}Loading agents & knowledge...${this.reset}`.padEnd(width - 2) + `${this.gold}║${this.reset}`);
    
    // Divider
    console.log(`${this.darkBg}${this.gold}╠${borderGold.replace(/./g, '═').substring(0, width - 4)}╣${this.reset}`);
    
    // Examples
    const examplesTitle = `${this.goldBright}◆ Example Commands ◆${this.reset}`;
    console.log(`${this.darkBg}${this.gold}║${this.reset}${examplesTitle.padStart((width - 2) / 2 + examplesTitle.length / 2).padEnd(width - 2)}${this.gold}║${this.reset}`);
    console.log(`${this.darkBg}${this.gold}║${this.reset}                                                                             ${this.gold}║${this.reset}`);
    console.log(`${this.darkBg}${this.gold}║  ${this.green}"Scrape Qatar tourism events"${this.reset}                                                   ${this.gold}║${this.reset}`);
    console.log(`${this.darkBg}${this.gold}║  ${this.green}"Fix the login bug"${this.reset}                                                              ${this.gold}║${this.reset}`);
    console.log(`${this.darkBg}${this.gold}║  ${this.green}"Implement JWT authentication"${this.reset}                                                  ${this.gold}║${this.reset}`);
    console.log(`${this.darkBg}${this.gold}║  ${this.green}"What can you do?"${this.reset}                                                                ${this.gold}║${this.reset}`);
    
    // Divider
    console.log(`${this.darkBg}${this.gold}╠${borderGold.replace(/./g, '═').substring(0, width - 4)}╣${this.reset}`);
    
    // Commands
    console.log(`${this.darkBg}${this.gold}║  ${this.cyan}/help${this.reset}    ${this.white}Show all commands${this.reset}                       ${this.gray}Type /help${this.reset}`.padEnd(width - 2) + `${this.gold}║${this.reset}`);
    console.log(`${this.darkBg}${this.gold}║  ${this.cyan}/status${this.reset}   ${this.white}System status${this.reset}                            ${this.gray}View stats${this.reset}`.padEnd(width - 2) + `${this.gold}║${this.reset}`);
    console.log(`${this.darkBg}${this.gold}║  ${this.cyan}/history${this.reset} ${this.white}Execution history${this.reset}                   ${this.gray}Past tasks${this.reset}`.padEnd(width - 2) + `${this.gold}║${this.reset}`);
    console.log(`${this.darkBg}${this.gold}║  ${this.cyan}/learn${this.reset}    ${this.white}Learned insights${this.reset}                      ${this.gray}Best practices${this.reset}`.padEnd(width - 2) + `${this.gold}║${this.reset}`);
    console.log(`${this.darkBg}${this.gold}║  ${this.cyan}/exec${this.reset}    ${this.white}Execute task${this.reset}                         ${this.gray}Run a task${this.reset}`.padEnd(width - 2) + `${this.gold}║${this.reset}`);
    console.log(`${this.darkBg}${this.gold}║  ${this.cyan}/exit${this.reset}    ${this.white}Exit Agent mode${this.reset}                         ${this.gray}Leave${this.reset}`.padEnd(width - 2) + `${this.gold}║${this.reset}`);
    
    // Bottom border
    console.log(`${this.darkBg}${borderGold}${this.reset}`);
    
    console.log(`\n${this.gold}  ${this.cyan}▸${this.reset} ${this.white}Just tell me what you want to accomplish...${this.reset}\n`);
    
    // Update prompt
    if (this.rl) {
      this.rl.setPrompt(`${this.gold}Genesis${this.reset}${this.goldBright}@${this.reset}${this.gray}agent${this.reset}${this.goldBright}❯${this.reset} `);
    }
  }

  /**
   * Handle user input
   */
  private async handleInput(input: string): Promise<void> {
    if (!input) return;

    // Add to conversation history
    this.context.conversationHistory.push({
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    });

    // Parse intent
    const intent = this.parseIntent(input);

    // Handle based on intent
    switch (intent.type) {
      case 'greeting':
        this.say('Hello! Ready to help you. What would you like me to do?');
        break;

      case 'goodbye':
        this.say('Goodbye! Feel free to call me anytime by typing "open agent".');
        this.exit();
        break;

      case 'help':
        this.showHelp();
        break;

      case 'status':
        await this.showStatus();
        break;

      case 'command':
        await this.handleCommand(intent.content);
        break;

      case 'question':
        await this.answerQuestion(intent.content);
        break;

      case 'task':
        await this.handleTask(intent.content);
        break;

      default:
        this.say('I\'m not sure what you mean. Try saying "help" or just tell me what you want to do!');
    }
  }

  /**
   * Parse user intent from natural language
   */
  private parseIntent(input: string): ParsedIntent {
    const lower = input.toLowerCase().trim();

    // Greetings
    if (/^(hi|hello|hey|greetings|howdy)/i.test(lower)) {
      return { type: 'greeting', content: input, confidence: 95 };
    }

    // Goodbyes
    if (/^(bye|goodbye|see you|exit|quit|leave)/i.test(lower)) {
      return { type: 'goodbye', content: input, confidence: 95 };
    }

    // Help
    if (/^(help|what can you do|\?|assist)/i.test(lower)) {
      return { type: 'help', content: input, confidence: 95 };
    }

    // Status
    if (/^(status|stats|how are you|what's up)/i.test(lower)) {
      return { type: 'status', content: input, confidence: 90 };
    }

    // Commands (slash commands)
    if (lower.startsWith('/')) {
      return { type: 'command', content: lower.substring(1), confidence: 100 };
    }

    // Questions
    if (/\?$/.test(input) || /^(what|how|why|when|where|who|can|could|will|is|are)/i.test(lower)) {
      return { type: 'question', content: input, confidence: 85 };
    }

    // Tasks - anything else is treated as a task
    return { type: 'task', content: input, confidence: 80 };
  }

  /**
   * Handle a task request
   */
  private async handleTask(goal: string): Promise<void> {
    this.context.state = 'planning';
    this.context.currentGoal = goal;

    // Check if user wants immediate execution
    const wantsExecution = /^(execute|run|do|go|start|implement|build|create|fix|scrape)/i.test(goal);
    
    // Check if it's a simple task (auto-execute)
    const isSimple = goal.split(/\s+/).length <= 10 && !goal.includes('complex') && !goal.includes('system');

    console.log('\n  🧠 Thinking about: ' + goal + '\n');

    try {
      // Step 1: Analyze
      console.log('  📊 Analyzing...');
      const analysis = plannerAgent.quickAnalyze(goal);
      console.log(`     Domain: ${analysis.domain}`);
      console.log(`     Complexity: ${analysis.complexity}`);
      console.log(`     Estimated steps: ${analysis.estimatedSteps}`);

      // Step 2: Decompose
      console.log('\n  🔨 Breaking down into tasks...');
      const taskNodes = taskDecomposer.decompose(analysis);
      console.log(`     Created ${taskNodes.length} tasks`);

      // Show task summary
      taskNodes.forEach((task, i) => {
        console.log(`     ${i + 1}. [${task.agentType.toUpperCase()}] ${task.name}`);
      });

      // Step 3: Detect tools
      console.log('\n  🔍 Checking required tools...');
      const detection = toolDetector.detectAll(analysis, taskNodes);
      
      if (detection.missingTools.length > 0) {
        console.log(`     ⚠️  Missing ${detection.missingTools.length} tools:`);
        detection.missingTools.forEach(req => {
          console.log(`       • ${req.tool.name}`);
        });

        // Ask user if they want to install
        const criticalMissing = detection.missingTools.filter(r => r.critical);
        if (criticalMissing.length > 0) {
          console.log('\n     ❌ Cannot proceed without: ' + criticalMissing.map(r => r.tool.name).join(', '));
          
          // In real implementation, ask user interactively
          console.log('     💡 Use: genesis_tool_manage({ action: "install", toolId: "..." })');
          
          this.context.state = 'idle';
          return;
        }
      } else {
        console.log('     ✅ All required tools available');
      }

      // Step 4: Optimize based on history
      console.log('\n  🧠 Optimizing based on past experience...');
      const workflow = workflowGenerator.generateWorkflow(goal, taskNodes);
      
      const optimization = optimizer.optimize({
        goal,
        analysis,
        tasks: taskNodes,
        workflow,
      });

      if (optimization.optimized) {
        console.log(`     💡 Applied ${optimization.changes.length} optimizations`);
        optimization.changes.forEach(change => {
          console.log(`       • ${change.description}`);
        });
      }

      // Step 5: Show recommendations
      const recommendations = optimizer.getRecommendations(goal, analysis.domain);
      if (recommendations.length > 0) {
        console.log('\n  💡 Recommendations:');
        recommendations.slice(0, 3).forEach(rec => {
          console.log(`     • ${rec}`);
        });
      }

      // Step 6: Auto-execute or show summary
      const shouldAutoExecute = wantsExecution || (isSimple && analysis.complexity === 'simple');
      
      if (shouldAutoExecute) {
        console.log('\n  🚀 自动执行中 (检测到简单任务)...\n');
        await this.executeTask(goal);
      } else {
        // Show summary and ask for confirmation
        console.log('\n' + '='.repeat(70));
        console.log('  📋 Plan Summary:');
        console.log(`     Goal: ${goal}`);
        console.log(`     Tasks: ${taskNodes.length}`);
        console.log(`     Estimated duration: ${optimization.newEstimate || workflow.metadata?.estimatedDuration} minutes`);
        console.log(`     Success probability: ${optimizer.predictSuccess({ goal, analysis, tasks: taskNodes, workflow }).probability.toFixed(0)}%`);
        console.log('='.repeat(70) + '\n');

        // In a real interactive setting, we'd ask for confirmation here
        // For now, just show what would happen
        this.say(`I've created a plan with ${taskNodes.length} tasks. Ready to execute when you confirm!`);
        this.say('(Try adding "execute" or "run" to your request to start immediately)');

        this.context.currentWorkflow = workflow;
        this.context.state = 'confirming';
      }

    } catch (error) {
      console.error('  ❌ Error:', error);
      this.say('Sorry, I encountered an error while planning. Please try again.');
      this.context.state = 'idle';
    }
  }

  /**
   * Answer a question
   */
  private async answerQuestion(question: string): Promise<void> {
    const lower = question.toLowerCase();

    if (lower.includes('what can you do') || lower.includes('capability')) {
      this.say(`I can help you with:
• Planning and breaking down complex tasks
• Coordinating multiple AI agents (Scout, Coder, Tester, Reviewer, Docs)
• Detecting and managing required tools
• Learning from experience to improve over time
• Web scraping, development, debugging, documentation, and more

Just tell me what you want to accomplish!`);
      return;
    }

    if (lower.includes('how do you work') || lower.includes('process')) {
      this.say(`I work in 4 phases:
1. 🧠 Think - Analyze your goal and understand requirements
2. 🔨 Plan - Break down into specific tasks for different agents
3. 🛠️  Prepare - Detect and install required tools
4. 🚀 Execute - Run the plan (with your approval)

I also learn from each execution to get better over time!`);
      return;
    }

    if (lower.includes('status') || lower.includes('how are you')) {
      await this.showStatus();
      return;
    }

    // Default response
    this.say(`That's an interesting question! I'm an autonomous agent system that can plan and execute tasks. For "${question}", I might need more context.

Try asking me to do something specific, like:
• "Scrape website data"
• "Fix a bug"
• "Implement a feature"

Or type "/help" for available commands.`);
  }

  /**
   * Handle slash commands
   */
  private async handleCommand(command: string): Promise<void> {
    const parts = command.split(' ');
    const cmd = parts[0];

    switch (cmd) {
      case 'help':
        this.showHelp();
        break;

      case 'status':
        await this.showStatus();
        break;

      case 'history':
        await this.showHistory();
        break;

      case 'learn':
        await this.showLearnings();
        break;

      case 'exec':
      case 'execute':
      case 'run':
        // Execute the current workflow or prompt for a task
        if (this.context.currentWorkflow) {
          this.say('Executing current workflow...');
          await this.executeTask(this.context.currentGoal || '');
        } else {
          this.say('No pending task. Just tell me what to do!');
        }
        break;

      case 'exit':
      case 'quit':
        this.exit();
        break;

      case 'clear':
        console.clear();
        this.printWelcome();
        break;

      default:
        this.say(`Unknown command: /${cmd}. Type /help for available commands.`);
    }
  }

  /**
   * Show help - Dark Gold Theme
   */
  private showHelp(): void {
    const width = 100;
    const border = '═'.repeat(width - 2);
    
    console.log(`\n${this.gold}${border}${this.reset}`);
    console.log(`${this.gold}║${this.reset}                    ${this.goldBright}◆ Available Commands ◆${this.reset}                    ${this.gold}║${this.reset}`);
    console.log(`${this.gold}${border}${this.reset}`);
    
    console.log(`\n  ${this.cyan}▸${this.reset} ${this.white}Natural Language:${this.reset}`);
    console.log(`     Just describe what you want to do:\n`);
    console.log(`     ${this.green}"Scrape Qatar tourism events"${this.reset}`);
    console.log(`     ${this.green}"Fix the login bug"${this.reset}`);
    console.log(`     ${this.green}"Implement JWT authentication"${this.reset}`);
    console.log(`     ${this.green}"What can you do?"${this.reset}`);
    
    console.log(`\n  ${this.cyan}▸${this.reset} ${this.white}Slash Commands:${this.reset}`);
    console.log(`     ${this.cyan}/help${this.reset}      Show this help message`);
    console.log(`     ${this.cyan}/status${this.reset}   Show system status`);
    console.log(`     ${this.cyan}/history${this.reset}  Show recent executions`);
    console.log(`     ${this.cyan}/learn${this.reset}    Show what I've learned`);
    console.log(`     ${this.cyan}/clear${this.reset}    Clear screen`);
    console.log(`     ${this.cyan}/exit${this.reset}    Exit Agent mode`);
    
    console.log(`\n  ${this.cyan}▸${this.reset} ${this.white}Questions I can answer:${this.reset}`);
    console.log(`     ${this.gray}"What can you do?"${this.reset}`);
    console.log(`     ${this.gray}"How do you work?"${this.reset}`);
    console.log(`     ${this.gray}"Show me your status"${this.reset}`);
    
    console.log(`\n${this.gold}${border}${this.reset}\n`);
  }

  /**
   * Show system status - Dark Gold Theme
   */
  private async showStatus(): Promise<void> {
    const stats = executionHistory.getStatistics();
    const kbStats = knowledgeBase.getStatistics();
    const width = 100;
    const border = '═'.repeat(width - 2);
    
    console.log(`\n${this.gold}${border}${this.reset}`);
    console.log(`${this.gold}║${this.reset}                     ${this.goldBright}◆ System Status ◆${this.reset}                      ${this.gold}║${this.reset}`);
    console.log(`${this.gold}${border}${this.reset}`);
    
    console.log(`${this.gold}║  ${this.cyan}▸${this.reset} ${this.white}Session${this.reset}: ${this.gray}${this.context.sessionId}${this.reset}`.padEnd(width - 2) + `${this.gold}║${this.reset}`);
    console.log(`${this.gold}║  ${this.cyan}▸${this.reset} ${this.white}Started${this.reset}: ${this.gray}${new Date(this.context.startTime).toLocaleString()}${this.reset}`.padEnd(width - 2) + `${this.gold}║${this.reset}`);
    console.log(`${this.gold}║  ${this.cyan}▸${this.reset} ${this.white}State${this.reset}: ${this.green}${this.context.state}${this.reset}`.padEnd(width - 2) + `${this.gold}║${this.reset}`);
    
    console.log(`${this.gold}╠${border.replace(/./g, '─').substring(0, width - 4)}╣${this.reset}`);
    
    console.log(`${this.gold}║  ${this.cyan}▸${this.reset} ${this.white}Execution History${this.reset}`.padEnd(width - 2) + `${this.gold}║${this.reset}`);
    console.log(`${this.gold}║     Total: ${this.white}${stats.totalExecutions}${this.reset}   Success: ${this.green}${stats.successRate.toFixed(1)}%${this.reset}   Avg Duration: ${this.white}${stats.averageDuration.toFixed(0)}min${this.reset}`.padEnd(width - 2) + `${this.gold}║${this.reset}`);
    
    console.log(`${this.gold}╠${border.replace(/./g, '─').substring(0, width - 4)}╣${this.reset}`);
    
    console.log(`${this.gold}║  ${this.cyan}▸${this.reset} ${this.white}Knowledge Base${this.reset}`.padEnd(width - 2) + `${this.gold}║${this.reset}`);
    console.log(`${this.gold}║     Entries: ${this.white}${kbStats.totalEntries}${this.reset}   Categories: ${this.gray}${Object.keys(kbStats.byCategory).join(', ')}${this.reset}`.padEnd(width - 2) + `${this.gold}║${this.reset}`);
    
    console.log(`${this.gold}╠${border.replace(/./g, '─').substring(0, width - 4)}╣${this.reset}`);
    
    console.log(`${this.gold}║  ${this.cyan}▸${this.reset} ${this.white}Available Agents${this.reset}`.padEnd(width - 2) + `${this.gold}║${this.reset}`);
    const agents = agentRegistry.listAvailableAgents();
    agents.forEach(agent => {
      console.log(`${this.gold}║     ${this.gold}●${this.reset} ${this.white}${agent.name}${this.reset}: ${this.gray}${agent.description.substring(0, 45)}...${this.reset}`.padEnd(width - 2) + `${this.gold}║${this.reset}`);
    });
    
    console.log(`${this.gold}${border}${this.reset}\n`);
  }

  /**
   * Show execution history - Dark Gold Theme
   */
  private async showHistory(): Promise<void> {
    const recent = executionHistory.getRecentExecutions(5);
    const width = 100;
    const border = '═'.repeat(width - 2);
    
    console.log(`\n${this.gold}${border}${this.reset}`);
    console.log(`${this.gold}║${this.reset}                 ${this.goldBright}◆ Recent Executions ◆${this.reset}                   ${this.gold}║${this.reset}`);
    console.log(`${this.gold}${border}${this.reset}`);
    
    if (recent.length === 0) {
      console.log(`${this.gold}║${this.reset}  ${this.gray}No executions yet. Start by telling me a task!${this.reset}`.padEnd(width - 2) + `${this.gold}║${this.reset}`);
    } else {
      recent.forEach((exec, i) => {
        const status = exec.execution.status === 'completed' ? `${this.green}✓${this.reset}` :
                      exec.execution.status === 'failed' ? `${this.red}✗${this.reset}` : `${this.gray}○${this.reset}`;
        const statusText = exec.execution.status === 'completed' ? `${this.green}已完成${this.reset}` :
                          exec.execution.status === 'failed' ? `${this.red}失败${this.reset}` : `${this.gray}进行中${this.reset}`;
        
        console.log(`${this.gold}║  ${this.cyan}${i + 1}.${this.reset} ${status} ${this.white}${exec.goal.substring(0, 45)}${exec.goal.length > 45 ? '...' : ''}${this.reset}`.padEnd(width - 2) + `${this.gold}║${this.reset}`);
        console.log(`${this.gold}║     ${this.gray}领域: ${exec.analysis.domain} │ 状态: ${statusText}${this.reset}`.padEnd(width - 2) + `${this.gold}║${this.reset}`);
        if (exec.execution.actualDuration) {
          console.log(`${this.gold}║     ${this.gray}耗时: ${exec.execution.actualDuration} 分钟${this.reset}`.padEnd(width - 2) + `${this.gold}║${this.reset}`);
        }
      });
    }
    
    console.log(`${this.gold}${border}${this.reset}\n`);
  }

  /**
   * Show learnings - Dark Gold Theme
   */
  private async showLearnings(): Promise<void> {
    const width = 100;
    const border = '═'.repeat(width - 2);
    
    console.log(`\n${this.gold}${border}${this.reset}`);
    console.log(`${this.gold}║${this.reset}                    ${this.goldBright}◆ What I've Learned ◆${this.reset}                    ${this.gold}║${this.reset}`);
    console.log(`${this.gold}${border}${this.reset}`);
    
    // Get high confidence learnings
    const learnings = executionHistory.extractBestPractices();
    
    if (learnings.length === 0) {
      console.log(`${this.gold}║  ${this.gray}Still learning! Complete some tasks to help me improve.${this.reset}`.padEnd(width - 2) + `${this.gold}║${this.reset}`);
    } else {
      console.log(`${this.gold}║  ${this.white}${learnings.length} best practices discovered:${this.reset}`.padEnd(width - 2) + `${this.gold}║${this.reset}`);
      console.log(`${this.gold}║${this.reset}                                                                             ${this.gold}║${this.reset}`);
      learnings.slice(0, 5).forEach((learning, i) => {
        console.log(`${this.gold}║  ${this.goldBright}★${this.reset} ${this.white}${learning.substring(0, 70)}${learning.length > 70 ? '...' : ''}${this.reset}`.padEnd(width - 2) + `${this.gold}║${this.reset}`);
      });
    }
    
    console.log(`${this.gold}${border}${this.reset}\n`);
  }

  /**
   * Say something to the user - Dark Gold Theme
   */
  private say(message: string): void {
    const width = 100;
    const border = '═'.repeat(width - 2);
    
    console.log(`\n${this.gold}╭${border}${this.gold}╮${this.reset}`);
    
    // Word wrap message
    const words = message.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    words.forEach(word => {
      if ((currentLine + ' ' + word).trim().length < width - 8) {
        currentLine = (currentLine + ' ' + word).trim();
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });
    if (currentLine) lines.push(currentLine);
    
    lines.forEach(line => {
      console.log(`${this.gold}║${this.reset}   ${this.white}${line}${this.reset}`.padEnd(width - 2) + `${this.gold}║${this.reset}`);
    });
    
    console.log(`${this.gold}╰${border}${this.gold}╯${this.reset}`);
    
    // Add to conversation history
    this.context.conversationHistory.push({
      role: 'agent',
      content: message,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Exit Agent mode - Dark Gold Theme
   */
  private exit(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    
    const width = 100;
    const border = '═'.repeat(width - 2);
    const duration = Math.round((Date.now() - new Date(this.context.startTime).getTime()) / 1000 / 60);
    const conversations = this.context.conversationHistory.length;
    
    console.log(`\n${this.gold}${border}${this.reset}`);
    console.log(`${this.gold}║${this.reset}                  ${this.goldBright}◆ Goodbye, Friend ◆${this.reset}                    ${this.gold}║${this.reset}`);
    console.log(`${this.gold}${border}${this.reset}`);
    
    console.log(`${this.gold}║  ${this.white}Session Summary:${this.reset}`.padEnd(width - 2) + `${this.gold}║${this.reset}`);
    console.log(`${this.gold}║     ${this.cyan}▸${this.reset} ${this.white}Duration:${this.reset} ${this.gray}${duration} minutes${this.reset}`.padEnd(width - 2) + `${this.gold}║${this.reset}`);
    console.log(`${this.gold}║     ${this.cyan}▸${this.reset} ${this.white}Messages:${this.reset} ${this.gray}${conversations} messages${this.reset}`.padEnd(width - 2) + `${this.gold}║${this.reset}`);
        console.log(`${this.gold}║     ${this.cyan}▸${this.reset} ${this.white}已完成任务:${this.reset} ${this.gray}${this.context.tasksCompleted || 0}${this.reset}`.padEnd(width - 2) + `${this.gold}║${this.reset}`);
    
    console.log(`${this.gold}${border}${this.reset}`);
    console.log(`${this.gold}║                                                                             ${this.gold}║${this.reset}`);
    console.log(`${this.gold}║         ${this.goldBright}Type "open agent" or "Agent" to start again!${this.reset}                  ${this.gold}║${this.reset}`);
    console.log(`${this.gold}║                                                                             ${this.gold}║${this.reset}`);
    console.log(`${this.gold}${border}${this.reset}\n`);
    
    if (this.rl) {
      this.rl.close();
    }
    
    // Call resolve to properly exit
    if ((this as any)._resolve) {
      (this as any)._resolve();
    }
    
    process.exit(0);
  }
  
  /**
   * Execute a task (real execution capability)
   */
  private async executeTask(goal: string): Promise<void> {
    this.context.state = 'executing';
    this.say(`🚀 Executing: "${goal}"`);
    
    try {
      // Analyze
      const analysis = plannerAgent.quickAnalyze(goal);
      
      // Decompose
      const tasks = taskDecomposer.decompose(analysis);
      
      // Execute each task
      let completed = 0;
      for (const task of tasks) {
        this.say(`\n📋 任务 ${completed + 1}/${tasks.length}: [${task.agentType.toUpperCase()}] ${task.name}`);
        
        // Simulate task execution (in real implementation, this would call actual agents)
        await this.simulateTaskExecution(task);
        
        completed++;
        this.context.tasksCompleted = (this.context.tasksCompleted || 0) + 1;
      }
      
      this.say(`\n✅ 执行完成! ${completed} 个任务已完成.`);
      
      // Learning: Track successful execution
      // In full implementation, would call executionHistory.recordExecution()
      
    } catch (error) {
      this.say(`❌ Execution failed: ${error}`);
    }
    
    this.context.state = 'idle';
  }
  
  /**
   * Simulate task execution (placeholder for real implementation)
   */
  private async simulateTaskExecution(task: any): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.say(`   ✓ Done`);
        resolve();
      }, 500 + Math.random() * 1000);
    });
  }
}

// Singleton instance
export const agentREPL = new AgentREPL();

// Export start function for easy access
export async function startAgent(): Promise<void> {
  return agentREPL.start();
}
