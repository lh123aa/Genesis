/**
 * Genesis Context Monitor - 上下文监控与管理系统
 * 
 * 借鉴 Oh My OpenCode 的上下文管理设计
 * 提供 token 估算、上下文压缩、工具输出截断等功能
 */

// ANSI 颜色
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
  bright: '\x1b[1m',
};

/**
 * 上下文使用统计
 */
export interface ContextStats {
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  estimatedTotalTokens: number;
  messageCount: number;
  toolCallCount: number;
  totalCharacters: number;
  sessionDuration: number;  // 毫秒
}

/**
 * 上下文配置
 */
export interface ContextConfig {
  maxTokens: number;           // 最大 token 数 (默认 100000)
  warningThreshold: number;    // 警告阈值 (默认 0.75)
  criticalThreshold: number;   // 严重阈值 (默认 0.90)
  truncateThreshold: number;   // 截断阈值 (默认 0.85)
  maxMessages: number;         // 最大消息数
  maxToolOutputs: number;      // 最大工具输出保留数
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: ContextConfig = {
  maxTokens: 100000,           // Claude 3.5 Sonnet 上下文
  warningThreshold: 0.75,      // 75% 时警告
  criticalThreshold: 0.90,     // 90% 时严重
  truncateThreshold: 0.85,     // 85% 时截断
  maxMessages: 100,
  maxToolOutputs: 10,
};

/**
 * 消息类型
 */
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  toolCalls?: any[];
  toolResults?: any[];
  timestamp: number;
  tokenEstimate?: number;
}

/**
 * 工具调用记录
 */
interface ToolCall {
  name: string;
  args: string;
  resultLength: number;
  timestamp: number;
}

/**
 * Context Monitor 类
 */
export class ContextMonitor {
  private config: ContextConfig;
  private messages: Message[] = [];
  private toolCalls: ToolCall[] = [];
  private startTime: number;
  private warnings: string[] = [];
  private truncations: string[] = [];
  
  // Token 估算系数 (根据经验值)
  private readonly TOKEN_RATIO = 0.25;  // 字符到 token 的大致比例
  
  constructor(config: Partial<ContextConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startTime = Date.now();
  }
  
  /**
   * 添加用户消息
   */
  addUserMessage(content: string): void {
    this.messages.push({
      role: 'user',
      content,
      timestamp: Date.now(),
      tokenEstimate: this.estimateTokens(content),
    });
    this.checkThresholds();
  }
  
  /**
   * 添加助手消息
   */
  addAssistantMessage(content: string, toolCalls?: any[]): void {
    this.messages.push({
      role: 'assistant',
      content,
      toolCalls,
      timestamp: Date.now(),
      tokenEstimate: this.estimateTokens(content),
    });
    this.checkThresholds();
  }
  
  /**
   * 添加系统消息
   */
  addSystemMessage(content: string): void {
    this.messages.push({
      role: 'system',
      content,
      timestamp: Date.now(),
      tokenEstimate: this.estimateTokens(content),
    });
  }
  
  /**
   * 记录工具调用
   */
  recordToolCall(name: string, args: string, result: string): void {
    this.toolCalls.push({
      name,
      args,
      resultLength: result.length,
      timestamp: Date.now(),
    });
    
    // 保持工具调用记录在限制内
    if (this.toolCalls.length > this.config.maxToolOutputs * 2) {
      this.toolCalls = this.toolCalls.slice(-this.config.maxToolOutputs);
    }
  }
  
  /**
   * 估算 token 数量
   */
  private estimateTokens(text: string): number {
    // 简单估算: 约 4 字符 = 1 token
    return Math.ceil(text.length / 4);
  }
  
  /**
   * 获取当前上下文统计
   */
  getStats(): ContextStats {
    const totalChars = this.messages.reduce((sum, m) => sum + m.content.length, 0);
    const toolResultChars = this.toolCalls.reduce((sum, t) => sum + t.resultLength, 0);
    
    // 输入 token 估算 (消息内容 + 工具参数)
    const inputTokens = this.messages.reduce((sum, m) => sum + (m.tokenEstimate || this.estimateTokens(m.content)), 0);
    const toolArgTokens = this.toolCalls.reduce((sum, t) => sum + this.estimateTokens(t.args), 0);
    const estimatedInputTokens = inputTokens + toolArgTokens;
    
    // 输出 token 估算 (工具结果)
    const estimatedOutputTokens = Math.ceil(toolResultChars / 4);
    
    return {
      estimatedInputTokens,
      estimatedOutputTokens,
      estimatedTotalTokens: estimatedInputTokens + estimatedOutputTokens,
      messageCount: this.messages.length,
      toolCallCount: this.toolCalls.length,
      totalCharacters: totalChars + toolResultChars,
      sessionDuration: Date.now() - this.startTime,
    };
  }
  
  /**
   * 获取使用百分比
   */
  getUsagePercent(): number {
    const stats = this.getStats();
    return stats.estimatedTotalTokens / this.config.maxTokens;
  }
  
  /**
   * 检查阈值并触发警告
   */
  private checkThresholds(): void {
    const percent = this.getUsagePercent();
    
    if (percent >= this.config.criticalThreshold) {
      const warning = `⚠️ 上下文使用已达 ${(percent * 100).toFixed(1)}% (严重) - 需要立即压缩`;
      if (!this.warnings.includes(warning)) {
        this.warnings.push(warning);
        console.log(`${colors.red}${warning}${colors.reset}`);
      }
    } else if (percent >= this.config.truncateThreshold) {
      const warning = `⚠️ 上下文使用已达 ${(percent * 100).toFixed(1)}% - 建议压缩`;
      if (!this.warnings.includes(warning)) {
        this.warnings.push(warning);
        console.log(`${colors.yellow}${warning}${colors.reset}`);
      }
    } else if (percent >= this.config.warningThreshold) {
      const warning = `ℹ️ 上下文使用: ${(percent * 100).toFixed(1)}%`;
      if (!this.warnings.includes(warning)) {
        this.warnings.push(warning);
        console.log(`${colors.cyan}${warning}${colors.reset}`);
      }
    }
  }
  
  /**
   * 是否需要压缩
   */
  needsCompaction(): boolean {
    return this.getUsagePercent() >= this.config.truncateThreshold;
  }
  
  /**
   * 是否严重
   */
  isCritical(): boolean {
    return this.getUsagePercent() >= this.config.criticalThreshold;
  }
  
  /**
   * 获取压缩建议
   */
  getCompactionSuggestions(): string[] {
    const suggestions: string[] = [];
    const stats = this.getStats();
    
    if (stats.messageCount > this.config.maxMessages) {
      suggestions.push(`删除最早的 ${stats.messageCount - this.config.maxMessages} 条消息`);
    }
    
    if (this.toolCalls.length > this.config.maxToolOutputs) {
      suggestions.push(`截断 ${this.toolCalls.length - this.config.maxToolOutputs} 个工具输出`);
    }
    
    // 检查大消息
    const largeMessages = this.messages.filter(m => m.content.length > 5000);
    if (largeMessages.length > 0) {
      suggestions.push(`压缩 ${largeMessages.length} 个大型消息 (${largeMessages.reduce((s, m) => s + m.content.length, 0)} 字符)`);
    }
    
    return suggestions;
  }
  
  /**
   * 执行上下文压缩
   */
  compact(): { compactedMessages: number; freedTokens: number } {
    const beforeStats = this.getStats();
    let freedTokens = 0;
    
    // 1. 删除最老的非系统消息 (保留最近的对话上下文)
    const systemMessages = this.messages.filter(m => m.role === 'system');
    const otherMessages = this.messages.filter(m => m.role !== 'system');
    
    // 保留最后 maxMessages 条非系统消息
    const keptMessages = otherMessages.slice(-this.config.maxMessages);
    this.messages = [...systemMessages, ...keptMessages];
    
    freedTokens += this.estimateTokens(
      otherMessages.slice(0, -this.config.maxMessages).map(m => m.content).join('')
    );
    
    // 2. 截断旧工具调用结果
    const keptToolCalls = this.toolCalls.slice(-this.config.maxToolOutputs);
    freedTokens += this.estimateTokens(
      this.toolCalls.slice(0, -this.config.maxToolOutputs).map(t => t.args + t.resultLength.toString()).join('')
    );
    this.toolCalls = keptToolCalls;
    
    const afterStats = this.getStats();
    const compactedMessages = beforeStats.messageCount - afterStats.messageCount;
    
    const truncation = `📦 上下文压缩: 删除了 ${compactedMessages} 条消息, 释放了 ~${freedTokens} tokens`;
    this.truncations.push(truncation);
    console.log(`${colors.green}${truncation}${colors.reset}`);
    
    return { compactedMessages, freedTokens };
  }
  
  /**
   * 生成上下文报告
   */
  getReport(): string {
    const stats = this.getStats();
    const percent = (this.getUsagePercent() * 100).toFixed(1);
    const suggestions = this.getCompactionSuggestions();
    
    let report = `
${'='.repeat(60)}
📊 上下文使用报告
${'='.repeat(60)}

🔢 Token 统计:
   输入 Token (估算): ${stats.estimatedInputTokens.toLocaleString()}
   输出 Token (估算): ${stats.estimatedOutputTokens.toLocaleString()}
   总计: ${stats.estimatedTotalTokens.toLocaleString()} / ${this.config.maxTokens.toLocaleString()} (${percent}%)

💬 消息统计:
   总消息数: ${stats.messageCount}
   工具调用: ${stats.toolCallCount}
   总字符数: ${stats.totalCharacters.toLocaleString()}

⏱️ 会话信息:
   持续时间: ${(stats.sessionDuration / 1000 / 60).toFixed(1)} 分钟

📈 状态: ${this.getUsagePercent() >= this.config.criticalThreshold ? '🔴 严重' : this.getUsagePercent() >= this.config.warningThreshold ? '🟡 警告' : '🟢 正常'}
`;
    
    if (suggestions.length > 0) {
      report += `
💡 压缩建议:
`;
      suggestions.forEach((s, i) => {
        report += `   ${i + 1}. ${s}\n`;
      });
    }
    
    if (this.truncations.length > 0) {
      report += `
📝 历史截断:
`;
      this.truncations.slice(-3).forEach(t => {
        report += `   • ${t}\n`;
      });
    }
    
    report += `${'='.repeat(60)}\n`;
    
    return report;
  }
  
  /**
   * 打印上下文状态
   */
  printStatus(): void {
    const stats = this.getStats();
    const percent = this.getUsagePercent();
    
    const barWidth = 30;
    const filled = Math.round(barWidth * percent);
    const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);
    
    let statusColor = colors.green;
    if (percent >= this.config.criticalThreshold) {
      statusColor = colors.red;
    } else if (percent >= this.config.warningThreshold) {
      statusColor = colors.yellow;
    }
    
    console.log(`
${colors.cyan}┌────────────────────────────────────────────────────────┐${colors.reset}`);
    console.log(`${colors.cyan}│${colors.reset} ${colors.bright}上下文使用${colors.reset}${colors.cyan}${' '.repeat(35)}│${colors.reset}`);
    console.log(`${colors.cyan}├────────────────────────────────────────────────────────┤${colors.reset}`);
    console.log(`${colors.cyan}│${colors.reset} ${bar} ${(percent * 100).toFixed(1)}% ${colors.cyan}${' '.repeat(12)}│${colors.reset}`);
    console.log(`${colors.cyan}│${colors.reset} Token: ${stats.estimatedTotalTokens.toLocaleString()} / ${this.config.maxTokens.toLocaleString()} ${colors.cyan}${' '.repeat(10)}│${colors.reset}`);
    console.log(`${colors.cyan}│${colors.reset} 消息: ${stats.messageCount} | 工具: ${stats.toolCallCount} ${colors.cyan}${' '.repeat(17)}│${colors.reset}`);
    console.log(`${colors.cyan}│${colors.reset} ${statusColor}状态: ${this.getUsagePercent() >= this.config.criticalThreshold ? '🔴 需要压缩' : this.getUsagePercent() >= this.config.warningThreshold ? '🟡 注意' : '🟢 正常'}${colors.cyan}${' '.repeat(23)}│${colors.reset}`);
    console.log(`${colors.cyan}└────────────────────────────────────────────────────────┘${colors.reset}
`);
  }
  
  /**
   * 获取历史警告
   */
  getWarnings(): string[] {
    return [...this.warnings];
  }
  
  /**
   * 重置监控器
   */
  reset(): void {
    this.messages = [];
    this.toolCalls = [];
    this.startTime = Date.now();
    this.warnings = [];
    this.truncations = [];
  }
}

/**
 * 创建上下文监控器
 */
export function createContextMonitor(config?: Partial<ContextConfig>): ContextMonitor {
  return new ContextMonitor(config);
}

// 默认监控器实例
export const contextMonitor = createContextMonitor();

// 便捷函数
export function getContextStats(): ContextStats {
  return contextMonitor.getStats();
}

export function getContextUsage(): number {
  return contextMonitor.getUsagePercent();
}

export function printContextStatus(): void {
  contextMonitor.printStatus();
}

export function shouldCompact(): boolean {
  return contextMonitor.needsCompaction();
}

export function compactContext(): { compactedMessages: number; freedTokens: number } {
  return contextMonitor.compact();
}

export function getContextReport(): string {
  return contextMonitor.getReport();
}
