/**
 * Genesis Visualizer - Beautiful UI for task execution
 * 
 * Provides rich visual representation of:
 * - Task decomposition process
 * - Agent assignment and thinking
 * - Execution progress
 * - Final summary reports
 */

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underline: '\x1b[4m',
  
  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  // Background colors
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
  
  // Custom gradients
  gradient: {
    primary: '\x1b[38;2;0;212;255m',    // Cyan #00d4ff
    secondary: '\x1b[38;2;16;185;129m',  // Green #10b981
    accent: '\x1b[38;2;245;158;11m',    // Yellow #f59e0b
    error: '\x1b[38;2;239;68;68m',      // Red #ef4444
    purple: '\x1b[38;2;139;92;246m',    // Purple #8b5cf6
  }
};

// Agent type emojis and colors - 每个 Agent 有专属颜色
const agentConfig = {
  scout: { emoji: '🔍', color: colors.cyan, name: 'Scout', role: '研究探索', borderColor: '\x1b[38;2;0;212;255m' },
  coder: { emoji: '💻', color: colors.green, name: 'Coder', role: '代码实现', borderColor: '\x1b[38;2;16;185;129m' },
  tester: { emoji: '🧪', color: colors.blue, name: 'Tester', role: '测试验证', borderColor: '\x1b[38;2;59;130;246m' },
  reviewer: { emoji: '👀', color: colors.yellow, name: 'Reviewer', role: '代码评审', borderColor: '\x1b[38;2;245;158;11m' },
  docs: { emoji: '📝', color: colors.magenta, name: 'Docs', role: '文档编写', borderColor: '\x1b[38;2;139;92;246m' },
};

// Status icons
const statusIcons = {
  pending: { emoji: '⏳', text: '等待中', color: colors.yellow },
  thinking: { emoji: '🤔', text: '思考中', color: colors.cyan },
  working: { emoji: '⚡', text: '工作中', color: colors.blue },
  completed: { emoji: '✅', text: '已完成', color: colors.green },
  failed: { emoji: '❌', text: '失败', color: colors.red },
  waiting: { emoji: '🔄', text: '等待中', color: colors.dim },
};

/**
 * Print a beautiful header
 */
export function printHeader(title: string, subtitle?: string): void {
  const width = 70;
  const gradient = colors.gradient.primary;
  
  console.log('');
  console.log(gradient + '═'.repeat(width) + colors.reset);
  console.log(gradient + '█' + ' '.repeat(width - 2) + '█' + colors.reset);
  
  const titlePadding = Math.floor((width - 4 - title.length) / 2);
  console.log(gradient + '█' + ' '.repeat(titlePadding) + colors.bright + colors.white + title + colors.reset + gradient + ' '.repeat(width - 4 - title.length - titlePadding) + '█' + colors.reset);
  
  if (subtitle) {
    const subPadding = Math.floor((width - 4 - subtitle.length) / 2);
    console.log(gradient + '█' + ' '.repeat(subPadding) + colors.dim + subtitle + colors.reset + gradient + ' '.repeat(width - 4 - subtitle.length - subPadding) + '█' + colors.reset);
  }
  
  console.log(gradient + '█' + ' '.repeat(width - 2) + '█' + colors.reset);
  console.log(gradient + '═'.repeat(width) + colors.reset);
  console.log('');
}

/**
 * Print goal received
 */
export function printGoal(goal: string): void {
  console.log(`${colors.gradient.primary}🎯${colors.reset} ${colors.bright}Goal:${colors.reset} ${colors.white}${goal}${colors.reset}`);
  console.log('');
}

/**
 * Print analysis phase
 */
export function printAnalysis(analysis: {
  domain: string;
  complexity: string;
  estimatedSteps: number;
  suggestedApproach?: string;
}): void {
  console.log(`${colors.gradient.primary}┌─────────────────────────────────────────────────────┐${colors.reset}`);
  console.log(`${colors.gradient.primary}│${colors.reset} ${colors.bright + colors.cyan}🧠 Analysis${colors.reset}                                      ${colors.gradient.primary}│${colors.reset}`);
  console.log(`${colors.gradient.primary}├─────────────────────────────────────────────────────┤${colors.reset}`);
  
  // Domain
  const domainIcon = analysis.domain === 'web_development' ? '🌐' :
                    analysis.domain === 'api' ? '🔌' :
                    analysis.domain === 'research' ? '🔬' :
                    analysis.domain === 'debugging' ? '🐛' :
                    analysis.domain === 'documentation' ? '📚' :
                    analysis.domain === 'market_research' ? '📊' :
                    analysis.domain === 'development' ? '💻' : '📦';
  
  console.log(`${colors.gradient.primary}│${colors.reset}   ${domainIcon} ${colors.dim}Domain:${colors.reset}    ${colors.white}${analysis.domain}${colors.reset}${colors.gradient.primary}${' '.repeat(35 - analysis.domain.length)}│${colors.reset}`);
  
  // Complexity with color
  const complexityColor = analysis.complexity === 'simple' ? colors.green :
                         analysis.complexity === 'moderate' ? colors.yellow :
                         analysis.complexity === 'complex' ? colors.red : colors.white;
  
  console.log(`${colors.gradient.primary}│${colors.reset}   📊 ${colors.dim}Complexity:${colors.reset} ${complexityColor}${analysis.complexity}${colors.reset}${colors.gradient.primary}${' '.repeat(31 - analysis.complexity.length)}│${colors.reset}`);
  
  console.log(`${colors.gradient.primary}│${colors.reset}   📈 ${colors.dim}Est. Steps:${colors.reset} ${colors.white}${analysis.estimatedSteps}${colors.reset}${colors.gradient.primary}${' '.repeat(33 - String(analysis.estimatedSteps).length)}│${colors.reset}`);
  
  if (analysis.suggestedApproach) {
    console.log(`${colors.gradient.primary}│${colors.reset}   💡 ${colors.dim}Approach:${colors.reset} ${colors.white}${analysis.suggestedApproach.substring(0, 30)}${analysis.suggestedApproach.length > 30 ? '...' : ''}${colors.reset}${colors.gradient.primary}${' '.repeat(34 - Math.min(analysis.suggestedApproach.length, 30))}│${colors.reset}`);
  }
  
  console.log(`${colors.gradient.primary}└─────────────────────────────────────────────────────┘${colors.reset}`);
  console.log('');
}

/**
 * Print task decomposition with beautiful visualization
 */
export function printTaskDecomposition(tasks: Array<{
  id: string;
  name: string;
  agentType: string;
  description?: string;
  dependencies?: string[];
  priority?: string;
}>): void {
  console.log(`${colors.gradient.primary}┌─────────────────────────────────────────────────────┐${colors.reset}`);
  console.log(`${colors.gradient.primary}│${colors.reset} ${colors.bright + colors.cyan}🔨 Task Decomposition${colors.reset}                             ${colors.gradient.primary}│${colors.reset}`);
  console.log(`${colors.gradient.primary}├─────────────────────────────────────────────────────┤${colors.reset}`);
  
  tasks.forEach((task, index) => {
    const agent = agentConfig[task.agentType as keyof typeof agentConfig] || agentConfig.coder;
    const taskNum = String(index + 1).padStart(2, '0');
    
    // Task header
    console.log(`${colors.gradient.primary}│${colors.reset}   ${agent.color}${agent.emoji}${colors.reset} ${colors.bright}Task ${taskNum}${colors.reset} ${colors.white}${task.name}${colors.reset}`);
    
    // Agent assignment
    console.log(`${colors.gradient.primary}│${colors.reset}      ${colors.dim}Assigned to:${colors.reset} ${agent.color}${agent.name}${colors.reset} (${colors.dim}${agent.role}${colors.reset})`);
    
    // Dependencies
    if (task.dependencies && task.dependencies.length > 0) {
      console.log(`${colors.gradient.primary}│${colors.reset}      ${colors.dim}Depends on:${colors.reset} ${colors.yellow}${task.dependencies.join(', ')}${colors.reset}`);
    }
    
    // Description
    if (task.description) {
      const desc = task.description.substring(0, 45);
      console.log(`${colors.gradient.primary}│${colors.reset}      ${colors.dim}Description:${colors.reset} ${colors.white}${desc}${task.description.length > 45 ? '...' : ''}${colors.reset}`);
    }
    
    // Separator (except for last task)
    if (index < tasks.length - 1) {
      console.log(`${colors.gradient.primary}│${colors.reset}      ${colors.dim}│${colors.reset}`);
    }
  });
  
  console.log(`${colors.gradient.primary}└─────────────────────────────────────────────────────┘${colors.reset}`);
  console.log('');
}

/**
 * Print agent assignment visualization
 */
export function printAgentAssignment(tasks: Array<{
  id: string;
  name: string;
  agentType: string;
}>): void {
  console.log(`${colors.gradient.primary}┌─────────────────────────────────────────────────────┐${colors.reset}`);
  console.log(`${colors.gradient.primary}│${colors.reset} ${colors.bright + colors.green}🎬 Agent Assignment${colors.reset}                              ${colors.gradient.primary}│${colors.reset}`);
  console.log(`${colors.gradient.primary}├─────────────────────────────────────────────────────┤${colors.reset}`);
  
  // Group by agent type
  const agentGroups: Record<string, typeof tasks> = {};
  tasks.forEach(task => {
    if (!agentGroups[task.agentType]) {
      agentGroups[task.agentType] = [];
    }
    agentGroups[task.agentType].push(task);
  });
  
  Object.entries(agentGroups).forEach(([agentType, agentTasks]) => {
    const agent = agentConfig[agentType as keyof typeof agentConfig] || agentConfig.coder;
    console.log(`${colors.gradient.primary}│${colors.reset}   ${agent.color}${agent.emoji} ${colors.bright}${agent.name}${colors.reset} ${colors.dim}(${agent.role})${colors.reset}`);
    
    agentTasks.forEach(task => {
      console.log(`${colors.gradient.primary}│${colors.reset}      ${colors.gradient.secondary}├─${colors.reset} ${colors.white}${task.name}${colors.reset}`);
    });
  });
  
  console.log(`${colors.gradient.primary}└─────────────────────────────────────────────────────┘${colors.reset}`);
  console.log('');
}

/**
 * Print agent thinking process
 */
export function printAgentThinking(agentType: string, taskName: string, thoughts: string[]): void {
  const agent = agentConfig[agentType as keyof typeof agentConfig] || agentConfig.coder;
  
  console.log(`${colors.gradient.primary}┌─────────────────────────────────────────────────────┐${colors.reset}`);
  console.log(`${colors.gradient.primary}│${colors.reset} ${agent.color}${agent.emoji} ${colors.bright}${agent.name}${colors.reset} 正在思考中...                           ${colors.gradient.primary}│${colors.reset}`);
  console.log(`${colors.gradient.primary}├─────────────────────────────────────────────────────┤${colors.reset}`);
  console.log(`${colors.gradient.primary}│${colors.reset}   ${colors.dim}任务:${colors.reset} ${colors.white}${taskName}${colors.reset}`);
  console.log(`${colors.gradient.primary}│${colors.reset}   ${colors.dim}思考过程:${colors.reset}`);
  
  thoughts.forEach((thought, index) => {
    const thoughtIcon = index === 0 ? '💭' : index === thoughts.length - 1 ? '✨' : '→';
    console.log(`${colors.gradient.primary}│${colors.reset}      ${thoughtIcon} ${colors.white}${thought}${colors.reset}`);
  });
  
  console.log(`${colors.gradient.primary}└─────────────────────────────────────────────────────┘${colors.reset}`);
  console.log('');
}

/**
 * Print agent working status
 */
export function printAgentWorking(agentType: string, taskName: string, progress?: string): void {
  const agent = agentConfig[agentType as keyof typeof agentConfig] || agentConfig.coder;
  const status = statusIcons.working;
  
  console.log(`${status.color}${status.emoji}${colors.reset} ${agent.color}${agent.name}${colors.reset} ${colors.dim}执行中:${colors.reset} ${colors.white}${taskName}${colors.reset}${progress ? ' ' + colors.dim + progress + colors.reset : ''}`);
}

/**
 * Print task status update
 */
export function printTaskStatus(taskId: string, status: keyof typeof statusIcons, message?: string): void {
  const statusInfo = statusIcons[status];
  
  const prefix = status === 'thinking' ? '🤔' :
                 status === 'working' ? '⚡' :
                 status === 'completed' ? '✅' :
                 status === 'failed' ? '❌' : '⏳';
  
  console.log(`   ${statusInfo.color}${prefix}${colors.reset} ${colors.dim}任务 ${taskId}:${colors.reset} ${statusInfo.color}${statusInfo.text}${colors.reset}${message ? ' ' + colors.dim + message + colors.reset : ''}`);
}

/**
 * Print execution progress
 */
export function printExecutionProgress(completed: number, total: number, duration?: number): void {
  const percentage = Math.round((completed / total) * 100);
  const filled = Math.round(percentage / 5);
  const empty = 20 - filled;
  
  const progressBar = colors.gradient.secondary + '█'.repeat(filled) + colors.dim + '░'.repeat(empty) + colors.reset;
  
  console.log(`${colors.gradient.primary}┌─────────────────────────────────────────────────────┐${colors.reset}`);
  console.log(`${colors.gradient.primary}│${colors.reset} ${colors.bright}⚡ 执行进度${colors.reset}`);
  console.log(`${colors.gradient.primary}│${colors.reset}   ${progressBar} ${colors.white}${percentage}%${colors.reset}`);
  console.log(`${colors.gradient.primary}│${colors.reset}   ${colors.dim}已完成:${colors.reset} ${colors.white}${completed}/${total}${colors.reset}${duration ? ' ' + colors.dim + `(${duration}毫秒)` + colors.reset : ''}`);
  console.log(`${colors.gradient.primary}└─────────────────────────────────────────────────────┘${colors.reset}`);
  console.log('');
}

/**
 * Print tool detection
 */
export function printToolDetection(required: number, missing: number, missingTools?: string[]): void {
  if (required === 0) return;
  
  console.log(`${colors.gradient.primary}┌─────────────────────────────────────────────────────┐${colors.reset}`);
  console.log(`${colors.gradient.primary}│${colors.reset} ${colors.bright + colors.cyan}🔧 Tool Detection${colors.reset}                                   ${colors.gradient.primary}│${colors.reset}`);
  console.log(`${colors.gradient.primary}├─────────────────────────────────────────────────────┤${colors.reset}`);
  console.log(`${colors.gradient.primary}│${colors.reset}   ${colors.green}✓${colors.reset} ${colors.white}Required:${colors.reset} ${required} ${colors.dim}tools${colors.reset}`);
  console.log(`${colors.gradient.primary}│${colors.reset}   ${missing > 0 ? colors.red + '✗' : colors.green + '✓'}${colors.reset} ${colors.white}Missing:${colors.reset} ${missing > 0 ? colors.red : colors.green}${missing} ${colors.dim}tools${colors.reset}`);
  
  if (missingTools && missingTools.length > 0) {
    console.log(`${colors.gradient.primary}│${colors.reset}   ${colors.dim}Missing tools:${colors.reset}`);
    missingTools.forEach(tool => {
      console.log(`${colors.gradient.primary}│${colors.reset}      ${colors.yellow}•${colors.reset} ${colors.white}${tool}${colors.reset}`);
    });
  }
  
  console.log(`${colors.gradient.primary}└─────────────────────────────────────────────────────┘${colors.reset}`);
  console.log('');
}

/**
 * Print success prediction
 */
export function printSuccessPrediction(probability: number, factors: string[]): void {
  const probabilityColor = probability >= 70 ? colors.green :
                          probability >= 40 ? colors.yellow : colors.red;
  
  console.log(`${colors.gradient.primary}┌─────────────────────────────────────────────────────┐${colors.reset}`);
  console.log(`${colors.gradient.primary}│${colors.reset} ${colors.bright + colors.cyan}📊 Success Prediction${colors.reset}                             ${colors.gradient.primary}│${colors.reset}`);
  console.log(`${colors.gradient.primary}├─────────────────────────────────────────────────────┤${colors.reset}`);
  console.log(`${colors.gradient.primary}│${colors.reset}   ${colors.white}Probability:${colors.reset} ${probabilityColor}${colors.bright}${probability}%${colors.reset}`);
  
  if (factors.length > 0) {
    console.log(`${colors.gradient.primary}│${colors.reset}   ${colors.dim}Factors:${colors.reset}`);
    factors.slice(0, 3).forEach(factor => {
      console.log(`${colors.gradient.primary}│${colors.reset}      ${colors.gradient.primary}•${colors.reset} ${colors.white}${factor}${colors.reset}`);
    });
  }
  
  console.log(`${colors.gradient.primary}└─────────────────────────────────────────────────────┘${colors.reset}`);
  console.log('');
}

/**
 * Print final summary report
 */
export function printSummaryReport(results: {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  duration: number;
  agentsUsed: Record<string, number>;
  success: boolean;
}): void {
  const successColor = results.success ? colors.green : colors.red;
  const successIcon = results.success ? '🎉' : '💥';
  
  console.log('');
  console.log(colors.gradient.primary + '═'.repeat(70) + colors.reset);
  console.log(colors.gradient.primary + '█' + ' '.repeat(68) + '█' + colors.reset);
  
  // Title
  const title = `${successIcon} 执行总结`;
  const titlePadding = Math.floor((70 - 4 - title.length) / 2);
  console.log(colors.gradient.primary + '█' + ' '.repeat(titlePadding) + colors.bright + successColor + title + colors.reset + colors.gradient.primary + ' '.repeat(70 - 4 - title.length - titlePadding) + '█' + colors.reset);
  
  console.log(colors.gradient.primary + '█' + ' '.repeat(68) + '█' + colors.reset);
  console.log(colors.gradient.primary + '═'.repeat(70) + colors.reset);
  console.log('');
  
  // Stats
  console.log(`${colors.gradient.primary}┌─────────────────────────────────────────────────────┐${colors.reset}`);
  console.log(`${colors.gradient.primary}│${colors.reset} ${colors.bright}📈 Statistics${colors.reset}`);
  console.log(`${colors.gradient.primary}├─────────────────────────────────────────────────────┤${colors.reset}`);
  
  // Tasks
  console.log(`${colors.gradient.primary}│${colors.reset}   ${colors.white}总任务数:${colors.reset}    ${colors.white}${results.totalTasks}${colors.reset}`);
  console.log(`${colors.gradient.primary}│${colors.reset}   ${colors.green}已完成:${colors.reset}     ${colors.green}${results.completedTasks}${colors.reset}`);
  if (results.failedTasks > 0) {
    console.log(`${colors.gradient.primary}│${colors.reset}   ${colors.red}失败:${colors.reset}        ${colors.red}${results.failedTasks}${colors.reset}`);
  }
  
  // Duration
  const durationSec = (results.duration / 1000).toFixed(2);
  console.log(`${colors.gradient.primary}│${colors.reset}   ${colors.cyan}Duration:${colors.reset}      ${colors.white}${durationSec}s${colors.reset}`);
  
  // Agents used
  console.log(`${colors.gradient.primary}├─────────────────────────────────────────────────────┤${colors.reset}`);
  console.log(`${colors.gradient.primary}│${colors.reset} ${colors.bright}🤖 Agents Used${colors.reset}`);
  console.log(`${colors.gradient.primary}├─────────────────────────────────────────────────────┤${colors.reset}`);
  
  Object.entries(results.agentsUsed).forEach(([agentType, count]) => {
    const agent = agentConfig[agentType as keyof typeof agentConfig] || agentConfig.coder;
    console.log(`${colors.gradient.primary}│${colors.reset}   ${agent.color}${agent.emoji}${colors.reset} ${agent.name}: ${colors.white}${count} task(s)${colors.reset}`);
  });
  
  console.log(`${colors.gradient.primary}└─────────────────────────────────────────────────────┘${colors.reset}`);
  
  // Success message
  if (results.success) {
    console.log('');
    console.log(`   ${colors.green}✓ 所有任务已完成!${colors.reset}`);
  } else {
    console.log('');
    console.log(`   ${colors.red}✗ 部分任务失败，请查看日志了解详情。${colors.reset}`);
  }
  
  console.log('');
}

/**
 * Print danger warning
 */
export function printDangerWarning(warnings: string[], severity: string): void {
  const severityColor = severity === 'high' ? colors.red :
                       severity === 'medium' ? colors.yellow : colors.blue;
  
  console.log(`${colors.red}┌─────────────────────────────────────────────────────┐${colors.reset}`);
  console.log(`${colors.red}│${colors.reset} ${colors.bright + colors.red}🚨 Danger Warning${colors.reset}                                 ${colors.red}│${colors.reset}`);
  console.log(`${colors.red}├─────────────────────────────────────────────────────┤${colors.reset}`);
  console.log(`${colors.red}│${colors.reset}   ${colors.dim}Severity:${colors.reset} ${severityColor}${severity.toUpperCase()}${colors.reset}`);
  
  warnings.forEach(warning => {
    console.log(`${colors.red}│${colors.reset}   ${colors.yellow}⚠${colors.reset} ${colors.white}${warning}${colors.reset}`);
  });
  
  console.log(`${colors.red}└─────────────────────────────────────────────────────┘${colors.reset}`);
  console.log('');
}

/**
 * Print loading animation - single line dynamic display
 */
export function printLoading(message: string, duration: number = 2000): Promise<void> {
  return new Promise(resolve => {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let i = 0;
    const startTime = Date.now();
    
    // Clear previous line and show first frame
    process.stdout.write(`\r${colors.cyan}${frames[0]}${colors.reset} ${message}`);
    
    const interval = setInterval(() => {
      i = (i + 1) % frames.length;
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100).toFixed(0);
      process.stdout.write(`\r${colors.cyan}${frames[i]}${colors.reset} ${message} ${colors.dim}${progress}%`);
    }, 80);
    
    setTimeout(() => {
      clearInterval(interval);
      // Clear the loading line and replace with done
      process.stdout.write(`\r${colors.green}✓${colors.reset} ${message} done\n`);
      resolve();
    }, duration);
  });
}

/**
 * Print separator line
 */
export function printSeparator(): void {
  console.log(colors.dim + '─'.repeat(70) + colors.reset);
}

/**
 * Print empty line
 */
export function printEmpty(): void {
  console.log('');
}

/**
 * Print a beautiful box with content
 */
export function printBox(title: string, content: string[], color: string = colors.gradient.primary): void {
  console.log(`${color}┌─────────────────────────────────────────────────────┐${colors.reset}`);
  console.log(`${color}│${colors.reset} ${colors.bright}${title}${colors.reset}`);
  console.log(`${color}├─────────────────────────────────────────────────────┤${colors.reset}`);
  
  content.forEach(line => {
    console.log(`${color}│${colors.reset} ${line}`);
  });
  
  console.log(`${color}└─────────────────────────────────────────────────────┘${colors.reset}`);
}

/**
 * Print recommendations
 */
export function printRecommendations(recommendations: string[]): void {
  if (recommendations.length === 0) return;
  
  console.log(`${colors.gradient.primary}┌─────────────────────────────────────────────────────┐${colors.reset}`);
  console.log(`${colors.gradient.primary}│${colors.reset} ${colors.bright + colors.yellow}💡 Recommendations${colors.reset}                              ${colors.gradient.primary}│${colors.reset}`);
  console.log(`${colors.gradient.primary}├─────────────────────────────────────────────────────┤${colors.reset}`);
  
  recommendations.slice(0, 5).forEach((rec, index) => {
    console.log(`${colors.gradient.primary}│${colors.reset}   ${colors.yellow}${index + 1}.${colors.reset} ${colors.white}${rec}${colors.reset}`);
  });
  
  console.log(`${colors.gradient.primary}└─────────────────────────────────────────────────────┘${colors.reset}`);
  console.log('');
}

/**
 * Print knowledge base entries
 */
export function printKnowledge(entries: Array<{ title: string; content: string }>): void {
  if (entries.length === 0) return;
  
  console.log(`${colors.gradient.primary}┌─────────────────────────────────────────────────────┐${colors.reset}`);
  console.log(`${colors.gradient.primary}│${colors.reset} ${colors.bright + colors.cyan}📚 Related Knowledge${colors.reset}                            ${colors.gradient.primary}│${colors.reset}`);
  console.log(`${colors.gradient.primary}├─────────────────────────────────────────────────────┤${colors.reset}`);
  
  entries.slice(0, 3).forEach(entry => {
    console.log(`${colors.gradient.primary}│${colors.reset}   ${colors.gradient.primary}•${colors.reset} ${colors.bright}${entry.title}${colors.reset}`);
    const contentPreview = entry.content.substring(0, 40);
    console.log(`${colors.gradient.primary}│${colors.reset}     ${colors.dim}${contentPreview}${entry.content.length > 40 ? '...' : ''}${colors.reset}`);
  });
  
  console.log(`${colors.gradient.primary}└─────────────────────────────────────────────────────┘${colors.reset}`);
  console.log('');
}

/**
 * Print task execution start - 使用 Agent 专属颜色
 */
export function printTaskExecutionStart(taskId: string, taskName: string, agentType: string): void {
  const agent = agentConfig[agentType as keyof typeof agentConfig] || agentConfig.coder;
  const borderColor = agent.borderColor || agent.color;
  
  console.log('');
  console.log(`${borderColor}╭─────────────────────────────────────────────────────╮${colors.reset}`);
  console.log(`${borderColor}│${colors.reset} ${agent.color}${agent.emoji} 【${agent.name}】开始执行任务${' '.repeat(20)}${borderColor}│${colors.reset}`);
  console.log(`${borderColor}├─────────────────────────────────────────────────────┤${colors.reset}`);
  console.log(`${borderColor}│${colors.reset}   ${colors.white}任务 ID: ${taskId}${' '.repeat(37)}${borderColor}│${colors.reset}`);
  console.log(`${borderColor}│${colors.reset}   ${colors.white}任务: ${taskName}${' '.repeat(40)}${borderColor}│${colors.reset}`);
  console.log(`${borderColor}│${colors.reset}   ${colors.blue}⚡ 正在执行...${' '.repeat(36)}${borderColor}│${colors.reset}`);
  console.log(`${borderColor}╰─────────────────────────────────────────────────────╯${colors.reset}`);
  console.log('');
}

/**
 * Print task execution thinking - 使用 Agent 专属颜色
 */
export function printTaskExecutionThinking(agentType: string, thoughts: string[]): void {
  const agent = agentConfig[agentType as keyof typeof agentConfig] || agentConfig.coder;
  
  thoughts.forEach((thought, index) => {
    const icon = index === 0 ? '🤔' : index === thoughts.length - 1 ? '💡' : '→';
    // 使用 Agent 专属颜色显示名字，思考内容使用淡色
    console.log(`   ${agent.color}╭─【${agent.name}】思考${'─'.repeat(40)}${colors.reset}`);
    console.log(`   ${agent.color}│${colors.reset} ${agent.color}${icon}${colors.reset} ${colors.white}${thought}${colors.reset}`);
    console.log(`   ${agent.color}╰${'─'.repeat(56)}${colors.reset}`);
  });
}

/**
 * Print task execution result - 使用 Agent 专属颜色
 */
export function printTaskExecutionResult(taskId: string, taskName: string, agentType: string, result: string): void {
  const agent = agentConfig[agentType as keyof typeof agentConfig] || agentConfig.coder;
  const borderColor = agent.borderColor || agent.color;
  
  console.log('');
  console.log(`${borderColor}╭─────────────────────────────────────────────────────╮${colors.reset}`);
  console.log(`${borderColor}│${colors.reset} ${agent.color}${agent.emoji} 【${agent.name}】已完成任务${' '.repeat(21)}${borderColor}│${colors.reset}`);
  console.log(`${borderColor}├─────────────────────────────────────────────────────┤${colors.reset}`);
  console.log(`${borderColor}│${colors.reset}   ${colors.white}任务 ID: ${taskId}${' '.repeat(37)}${borderColor}│${colors.reset}`);
  console.log(`${borderColor}│${colors.reset}   ${colors.white}任务: ${taskName}${' '.repeat(40)}${borderColor}│${colors.reset}`);
  console.log(`${borderColor}├─────────────────────────────────────────────────────┤${colors.reset}`);
  console.log(`${borderColor}│${colors.reset}   ${agent.color}✓ 结果:${colors.reset}`);
  
  // Word wrap result
  const maxWidth = 60;
  const words = result.split(' ');
  let line = '';
  words.forEach(word => {
    if (line.length + word.length + 1 > maxWidth) {
      console.log(`${borderColor}│${colors.reset}     ${colors.white}${line}${' '.repeat(maxWidth - line.length)}${borderColor}│${colors.reset}`);
      line = word;
    } else {
      line += (line ? ' ' : '') + word;
    }
  });
  if (line) {
    console.log(`${borderColor}│${colors.reset}     ${colors.white}${line}${' '.repeat(maxWidth - line.length)}${borderColor}│${colors.reset}`);
  }
  
  console.log(`${borderColor}╰─────────────────────────────────────────────────────╯${colors.reset}`);
  console.log('');
}

/**
 * Print execution header - NEW FUNCTION
 */
export function printExecutionHeader(): void {
  console.log('');
  console.log(colors.gradient.primary + '═'.repeat(70) + colors.reset);
  console.log(colors.gradient.primary + '█' + colors.bright + colors.white + ' '.repeat(25) + '🚀 EXECUTING TASKS' + ' '.repeat(24) + colors.gradient.primary + '█' + colors.reset);
  console.log(colors.gradient.primary + '═'.repeat(70) + colors.reset);
  console.log('');
}

// ============================================================================
// NEW: Multi-Agent Parallel Execution Visualization
// ============================================================================

/**
 * Agent status for parallel execution view
 */
export type AgentStatusType = 'idle' | 'thinking' | 'working' | 'waiting' | 'completed' | 'failed';

export interface AgentState {
  id: string;
  name: string;
  emoji: string;
  color: string;
  status: AgentStatusType;
  currentTask?: string;
  message?: string;
  progress?: number;
}

/**
 * Print parallel agent execution dashboard - shows all agents working simultaneously
 */
export function printParallelAgentsDashboard(agents: AgentState[]): void {
  console.log('');
  console.log(colors.gradient.primary + '┌' + '─'.repeat(68) + '┐' + colors.reset);
  
  // Header
  const header = '🎭 多 Agent 并行执行仪表盘';
  const headerPad = Math.floor((68 - header.length) / 2);
  console.log(colors.gradient.primary + '│' + ' '.repeat(headerPad) + colors.bright + colors.white + header + colors.reset + colors.gradient.primary + ' '.repeat(68 - header.length - headerPad) + '│' + colors.reset);
  console.log(colors.gradient.primary + '├' + '─'.repeat(68) + '┤' + colors.reset);
  
  // Agent status rows
  agents.forEach(agent => {
    const statusIcon = getStatusIcon(agent.status);
    const statusColor = getStatusColor(agent.status);
    
    // Status bar
    let statusBar = '';
    if (agent.status === 'working' && agent.progress !== undefined) {
      const filled = Math.round(agent.progress / 10);
      statusBar = ' ' + colors.gradient.secondary + '█'.repeat(filled) + colors.dim + '░'.repeat(10 - filled) + colors.reset;
    }
    
    const taskInfo = agent.currentTask ? ` → ${agent.currentTask.substring(0, 25)}${agent.currentTask.length > 25 ? '...' : ''}` : '';
    const msgInfo = agent.message ? ` | ${agent.message.substring(0, 20)}` : '';
    
    console.log(colors.gradient.primary + '│' + colors.reset + 
      ` ${agent.color}${agent.emoji} 【${agent.name}】${colors.reset}` +
      statusColor + ` ${statusIcon} ${agent.status.toUpperCase()}${colors.reset}` +
      statusBar +
      colors.dim + taskInfo + msgInfo + ' '.repeat(Math.max(0, 48 - (taskInfo.length + msgInfo.length))) +
      colors.gradient.primary + '│' + colors.reset);
  });
  
  console.log(colors.gradient.primary + '└' + '─'.repeat(68) + '┘' + colors.reset);
  console.log('');
}

function getStatusIcon(status: AgentStatusType): string {
  switch (status) {
    case 'idle': return '⏸';
    case 'thinking': return '🤔';
    case 'working': return '⚡';
    case 'waiting': return '🔄';
    case 'completed': return '✅';
    case 'failed': return '❌';
    default: return '○';
  }
}

function getStatusColor(status: AgentStatusType): string {
  switch (status) {
    case 'idle': return colors.dim;
    case 'thinking': return colors.cyan;
    case 'working': return colors.blue;
    case 'waiting': return colors.yellow;
    case 'completed': return colors.green;
    case 'failed': return colors.red;
    default: return colors.white;
  }
}

/**
 * Print agent-to-agent message/collaboration
 */
export function printAgentMessage(
  fromAgent: string,
  toAgent: string,
  message: string,
  type: 'request' | 'response' | 'info' = 'info'
): void {
  const fromConfig = agentConfig[fromAgent as keyof typeof agentConfig] || agentConfig.coder;
  const toConfig = agentConfig[toAgent as keyof typeof agentConfig] || agentConfig.coder;
  
  const arrow = type === 'request' ? '📤 →' : type === 'response' ? '📥 ←' : '💬 ↔';
  const typeColor = type === 'request' ? colors.yellow : type === 'response' ? colors.green : colors.cyan;
  
  console.log(`${colors.gradient.primary}┌─${arrow} Message${' '.repeat(54)}┐${colors.reset}`);
  console.log(`${colors.gradient.primary}│${colors.reset} ${fromConfig.color}@${fromConfig.name}${colors.reset} → ${toConfig.color}@${toConfig.name}${colors.reset}${' '.repeat(38)}│${colors.reset}`);
  console.log(`${colors.gradient.primary}│${colors.reset} ${typeColor}${message.substring(0, 60)}${message.length > 60 ? '...' : ''}${colors.reset}${' '.repeat(Math.max(0, 60 - message.length))}│${colors.reset}`);
  console.log(`${colors.gradient.primary}└${'─'.repeat(66)}┘${colors.reset}`);
}

/**
 * Print task dependency/collaboration visualization
 */
export function printAgentCollaboration(
  fromAgent: string,
  toAgent: string,
  taskName: string,
  action: 'waiting_for' | 'received_from' | 'notified'
): void {
  const fromConfig = agentConfig[fromAgent as keyof typeof agentConfig] || agentConfig.coder;
  const toConfig = agentConfig[toAgent as keyof typeof agentConfig] || agentConfig.coder;
  
  const actionIcon = action === 'waiting_for' ? '⏳' : action === 'received_from' ? '📦' : '📢';
  const actionText = action === 'waiting_for' ? '等待' : action === 'received_from' ? '收到' : '通知';
  
  console.log(`   ${fromConfig.color}${fromConfig.emoji} @${fromConfig.name}${colors.reset} ${actionIcon} ${actionText} → ${toConfig.color}${toConfig.emoji} @${toConfig.name}${colors.reset} | ${colors.white}${taskName}${colors.reset}`);
}

/**
 * Print a thinking bubble for an agent - 使用 Agent 专属颜色边框
 */
export function printAgentThinkingBubble(agentType: string, thought: string, step: number, total: number): void {
  const agent = agentConfig[agentType as keyof typeof agentConfig] || agentConfig.coder;
  const borderColor = agent.borderColor || agent.color;
  
  // Progress indicator
  const progress = '●'.repeat(step) + '○'.repeat(total - step);
  
  // 使用 Agent 专属颜色的边框
  console.log(`${borderColor}╭─────────────────────────────────────────────────────╮${colors.reset}`);
  console.log(`${borderColor}│${colors.reset} ${agent.color}${agent.emoji} 【${agent.name}】${colors.reset} ${colors.dim}思考中${colors.reset} ${agent.color}${progress}${colors.reset}${borderColor}${' '.repeat(25)}${colors.reset}`);
  console.log(`${borderColor}├─────────────────────────────────────────────────────┤${colors.reset}`);
  
  // Word wrap thought
  const maxWidth = 55;
  const words = thought.split(' ');
  let line = '';
  words.forEach(word => {
    if (line.length + word.length + 1 > maxWidth) {
      console.log(`${borderColor}│${colors.reset}   ${colors.white}${line}${colors.reset}`);
      line = word;
    } else {
      line += (line ? ' ' : '') + word;
    }
  });
  if (line) {
    console.log(`${borderColor}│${colors.reset}   ${colors.white}${line}${colors.reset}`);
  }
  
  console.log(`${borderColor}╰─────────────────────────────────────────────────────╯${colors.reset}`);
}

/**
 * Print task transfer between agents (output of one becomes input of another)
 */
export function printTaskTransfer(
  fromAgent: string,
  toAgent: string,
  taskName: string,
  dataSummary: string
): void {
  const fromConfig = agentConfig[fromAgent as keyof typeof agentConfig] || agentConfig.coder;
  const toConfig = agentConfig[toAgent as keyof typeof agentConfig] || agentConfig.coder;
  
  console.log('');
  console.log(`${colors.gradient.purple}┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓${colors.reset}`);
  console.log(`${colors.gradient.purple}┃${colors.reset} ${colors.bright}🔄 任务传递${colors.bright}                                 ${colors.gradient.purple}┃${colors.reset}`);
  console.log(`${colors.gradient.purple}┡━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┩${colors.reset}`);
  console.log(`${colors.gradient.purple}│${colors.reset} ${fromConfig.color}${fromConfig.emoji} @${fromConfig.name}${colors.reset} ${colors.dim}→${colors.reset} ${toConfig.color}${toConfig.emoji} @${toConfig.name}${colors.reset}${' '.repeat(35)}│${colors.reset}`);
  console.log(`${colors.gradient.purple}│${colors.reset} ${colors.white}Task:${colors.reset} ${taskName}${' '.repeat(44 - taskName.length)}│${colors.reset}`);
  console.log(`${colors.gradient.purple}│${colors.reset} ${colors.cyan}Data:${colors.reset} ${dataSummary.substring(0, 55)}${' '.repeat(Math.max(0, 55 - dataSummary.length))}│${colors.reset}`);
  console.log(`${colors.gradient.purple}┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛${colors.reset}`);
  console.log('');
}

/**
 * Print real-time agent activity timeline
 */
export function printAgentTimeline(events: Array<{
  timestamp: number;
  agent: string;
  event: string;
  detail?: string;
}>): void {
  if (events.length === 0) return;
  
  console.log(`${colors.gradient.primary}┌─────────────────────────────────────────────────────┐${colors.reset}`);
  console.log(`${colors.gradient.primary}│${colors.reset} ${colors.bright + colors.cyan}📜 Agent 活动时间线${colors.reset}                           ${colors.gradient.primary}│${colors.reset}`);
  console.log(`${colors.gradient.primary}├─────────────────────────────────────────────────────┤${colors.reset}`);
  
  // Show last 5 events
  events.slice(-5).forEach((ev, idx) => {
    const agent = agentConfig[ev.agent as keyof typeof agentConfig] || agentConfig.coder;
    const time = new Date(ev.timestamp).toLocaleTimeString('zh-CN', { hour12: false });
    const detail = ev.detail ? ` - ${ev.detail}` : '';
    
    console.log(`${colors.gradient.primary}│${colors.reset} ${colors.dim}${time}${colors.reset} ${agent.color}${agent.emoji}${colors.reset} ${agent.name}: ${colors.white}${ev.event}${colors.dim}${detail}${' '.repeat(Math.max(0, 30 - ev.event.length - (detail?.length || 0)))}│${colors.reset}`);
  });
  
  console.log(`${colors.gradient.primary}└─────────────────────────────────────────────────────┘${colors.reset}`);
  console.log('');
}

// ============================================================================
// 自我迭代与性能监控
// ============================================================================

/**
 * 实时性能指标数据
 */
export interface PerformanceMetrics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageDuration: number;
  successRate: number;
  agentStats: Record<string, {
    tasks: number;
    success: number;
    avgDuration: number;
  }>;
}

/**
 * 打印实时性能仪表盘 - 展示系统实时性能指标
 */
export function printPerformanceDashboard(metrics: PerformanceMetrics): void {
  const successRate = metrics.totalTasks > 0 
    ? ((metrics.completedTasks / metrics.totalTasks) * 100).toFixed(1)
    : '0.0';
  
  const successColor = parseFloat(successRate) >= 80 ? colors.green :
                      parseFloat(successRate) >= 60 ? colors.yellow : colors.red;
  
  console.log('');
  console.log(`${colors.gradient.primary}┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓${colors.reset}`);
  console.log(`${colors.gradient.primary}┃${colors.reset} ${colors.bright + colors.cyan}📊 实时性能仪表盘${colors.reset}                       ${colors.gradient.primary}┃${colors.reset}`);
  console.log(`${colors.gradient.primary}┡━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┩${colors.reset}`);
  
  // 核心指标
  console.log(`${colors.gradient.primary}│${colors.reset} ${colors.white}任务统计:${colors.reset}`);
  console.log(`${colors.gradient.primary}│${colors.reset}   ${colors.green}✓${colors.reset} 已完成: ${colors.green}${metrics.completedTasks}${colors.reset}`);
  console.log(`${colors.gradient.primary}│${colors.reset}   ${colors.red}✗${colors.reset} 失败: ${colors.red}${metrics.failedTasks}${colors.reset}`);
  console.log(`${colors.gradient.primary}│${colors.reset}   ${colors.cyan}⏱️${colors.reset} 平均耗时: ${colors.white}${(metrics.averageDuration/1000).toFixed(1)}秒${colors.reset}`);
  console.log(`${colors.gradient.primary}│${colors.reset}   ${successColor}📈 成功率: ${successColor}${successRate}%${colors.reset}`);
  
  // Agent 统计
  console.log(`${colors.gradient.primary}├─────────────────────────────────────────────────────┤${colors.reset}`);
  console.log(`${colors.gradient.primary}│${colors.reset} ${colors.white}各 Agent 表现:${colors.reset}`);
  
  Object.entries(metrics.agentStats).forEach(([agentType, stat]) => {
    const agent = agentConfig[agentType as keyof typeof agentConfig] || agentConfig.coder;
    const agentSuccessRate = stat.tasks > 0 ? ((stat.success / stat.tasks) * 100).toFixed(1) : '0.0';
    const agentSuccessColor = parseFloat(agentSuccessRate) >= 80 ? colors.green :
                             parseFloat(agentSuccessRate) >= 60 ? colors.yellow : colors.red;
    
    console.log(`${colors.gradient.primary}│${colors.reset}   ${agent.color}${agent.emoji}${colors.reset} ${agent.name}: ${stat.tasks}任务/${agentSuccessColor}${agentSuccessRate}%成功`);
  });
  
  console.log(`${colors.gradient.primary}┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛${colors.reset}`);
  console.log('');
}

/**
 * 打印自我改进状态
 */
export function printSelfImprovementStatus(
  phase: 'analyzing' | 'learning' | 'optimizing' | 'applying' | 'complete' | 'error',
  message: string,
  progress?: number
): void {
  const phaseConfig = {
    analyzing: { emoji: '🔍', color: colors.cyan, text: '分析中' },
    learning: { emoji: '🧠', color: colors.magenta, text: '学习中' },
    optimizing: { emoji: '⚙️', color: colors.yellow, text: '优化中' },
    applying: { emoji: '🔧', color: colors.blue, text: '应用中' },
    complete: { emoji: '✅', color: colors.green, text: '完成' },
    error: { emoji: '❌', color: colors.red, text: '错误' },
  };
  
  const config = phaseConfig[phase];
  const progressBar = progress !== undefined 
    ? `${colors.gradient.secondary}${'█'.repeat(Math.floor(progress/5))}${'░'.repeat(20-Math.floor(progress/5))}${colors.reset}`
    : '';
  
  console.log(`${config.color}${config.emoji}${colors.reset} ${config.text}: ${colors.white}${message}${colors.reset}${progress !== undefined ? ' ' + progressBar + ' ' + progress + '%' : ''}`);
}

/**
 * 打印系统健康检查
 */
export function printSystemHealthCheck(checks: Array<{
  name: string;
  status: 'ok' | 'warning' | 'error';
  message: string;
  details?: string;
}>): void {
  console.log('');
  console.log(`${colors.gradient.primary}┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓${colors.reset}`);
  console.log(`${colors.gradient.primary}┃${colors.reset} ${colors.bright + colors.green}🏥 系统健康检查${colors.reset}                           ${colors.gradient.primary}┃${colors.reset}`);
  console.log(`${colors.gradient.primary}┡━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┩${colors.reset}`);
  
  checks.forEach(check => {
    const statusIcon = check.status === 'ok' ? '✓' : check.status === 'warning' ? '⚠' : '✗';
    const statusColor = check.status === 'ok' ? colors.green : check.status === 'warning' ? colors.yellow : colors.red;
    
    console.log(`${colors.gradient.primary}│${colors.reset} ${statusColor}${statusIcon}${colors.reset} ${colors.white}${check.name}${colors.reset}: ${check.message}`);
    if (check.details) {
      console.log(`${colors.gradient.primary}│${colors.reset}   ${colors.dim}${check.details}${colors.reset}`);
    }
  });
  
  const okCount = checks.filter(c => c.status === 'ok').length;
  const warnCount = checks.filter(c => c.status === 'warning').length;
  const errorCount = checks.filter(c => c.status === 'error').length;
  
  console.log(`${colors.gradient.primary}├─────────────────────────────────────────────────────┤${colors.reset}`);
  console.log(`${colors.gradient.primary}│${colors.reset} ${colors.green}正常: ${okCount}${colors.reset} ${colors.yellow}警告: ${warnCount}${colors.reset} ${colors.red}错误: ${errorCount}${colors.reset}`);
  console.log(`${colors.gradient.primary}┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛${colors.reset}`);
  console.log('');
}

/**
 * 打印评估趋势图表
 */
export function printEvaluationTrend(
  dimension: string,
  scores: number[],
  currentScore: number
): void {
  if (scores.length === 0) return;
  
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min || 1;
  
  // 生成简单的柱状图
  const chart = scores.map((score, idx) => {
    const height = Math.round(((score - min) / range) * 5) + 1;
    const bar = '▁▂▃▄▅▆▇'[height - 1] || '░';
    const isCurrent = idx === scores.length - 1;
    return isCurrent ? `${colors.gradient.primary}${bar}${colors.reset}` : colors.dim + bar + colors.reset;
  }).join('');
  
  const trend = scores.length > 1 
    ? (currentScore > scores[scores.length - 2] ? '📈' : currentScore < scores[scores.length - 2] ? '📉' : '➡️')
    : '';
  
  console.log(`  ${colors.cyan}${dimension}:${colors.reset} ${chart} ${colors.white}${currentScore}分${trend}`);
}

/**
 * 打印迭代升级报告
 */
export function printIterationReport(report: {
  iteration: number;
  changes: string[];
  improvements: string[];
  newCapabilities: string[];
  nextSteps: string[];
}): void {
  console.log('');
  console.log(colors.gradient.primary + '═'.repeat(65) + colors.reset);
  console.log(colors.gradient.primary + '█' + ' '.repeat(20) + colors.bright + colors.white + '🚀 迭代升级报告' + ' '.repeat(19) + colors.gradient.primary + '█' + colors.reset);
  console.log(colors.gradient.primary + '█' + ' '.repeat(63) + colors.gradient.primary + '█' + colors.reset);
  console.log(colors.gradient.primary + '█' + colors.bright + ` 第 ${report.iteration} 次迭代` + colors.reset + colors.gradient.primary + ' '.repeat(43) + '█' + colors.reset);
  console.log(colors.gradient.primary + '═'.repeat(65) + colors.reset);
  
  // 变更
  if (report.changes.length > 0) {
    console.log(`\n${colors.yellow}📝 本次变更:${colors.reset}`);
    report.changes.forEach(c => console.log(`   • ${c}`));
  }
  
  // 改进
  if (report.improvements.length > 0) {
    console.log(`\n${colors.green}✨ 改进提升:${colors.reset}`);
    report.improvements.forEach(i => console.log(`   • ${i}`));
  }
  
  // 新能力
  if (report.newCapabilities.length > 0) {
    console.log(`\n${colors.cyan}🆕 新增能力:${colors.reset}`);
    report.newCapabilities.forEach(n => console.log(`   • ${n}`));
  }
  
  // 下一步
  if (report.nextSteps.length > 0) {
    console.log(`\n${colors.magenta}🎯 下一步计划:${colors.reset}`);
    report.nextSteps.forEach((n, idx) => console.log(`   ${idx + 1}. ${n}`));
  }
  
  console.log('\n' + colors.gradient.primary + '═'.repeat(65) + colors.reset + '\n');
}
