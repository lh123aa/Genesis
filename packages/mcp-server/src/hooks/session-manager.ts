/**
 * Genesis Session Manager - 会话管理与恢复系统
 * 
 * 借鉴 Oh My OpenCode 的会话恢复设计
 * 提供会话状态持久化、自动恢复、断点续传等功能
 */

import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';

import { getLocale } from '../i18n/index.js';

/**
 * 会话状态
 */
export interface SessionState {
  sessionId: string;
  goal: string;
  phase: string;
  status: 'running' | 'paused' | 'completed' | 'failed' | 'interrupted';
  startTime: number;
  lastUpdateTime: number;
  progress: {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
  };
  currentTask?: {
    id: string;
    name: string;
    agentType: string;
  };
  completedTasks: CompletedTask[];
  context: {
    estimatedTokens: number;
    messagesCount: number;
    toolCallsCount: number;
  };
  error?: {
    message: string;
    stack?: string;
    timestamp: number;
  };
  checkpoints: SessionCheckpoint[];
}

/**
 * 已完成任务
 */
export interface CompletedTask {
  id: string;
  name: string;
  agentType: string;
  result: string;
  completedAt: number;
  duration: number;
}

/**
 * 会话检查点
 */
export interface SessionCheckpoint {
  id: string;
  timestamp: number;
  phase: string;
  description: string;
  data?: any;
}

/**
 * 会话配置
 */
export interface SessionConfig {
  storageDir: string;
  maxCheckpoints: number;
  autoCheckpointInterval: number;  // 毫秒
  enableAutoSave: boolean;
  enableRecovery: boolean;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: SessionConfig = {
  storageDir: join(homedir(), '.project-genesis', 'sessions'),
  maxCheckpoints: 10,
  autoCheckpointInterval: 30000,  // 30秒
  enableAutoSave: true,
  enableRecovery: true,
};

/**
 * ANSI 颜色
 */
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
 * Session Manager 类
 */
export class SessionManager {
  private config: SessionConfig;
  private currentSession: SessionState | null = null;
  private checkpointTimer: NodeJS.Timeout | null = null;
  
  constructor(config: Partial<SessionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.ensureStorageDir();
  }
  
  /**
   * 确保存储目录存在
   */
  private ensureStorageDir(): void {
    mkdirSync(this.config.storageDir, { recursive: true });
  }
  
  /**
   * 创建新会话
   */
  createSession(goal: string, initialPhase: string = 'initialization'): SessionState {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    this.currentSession = {
      sessionId,
      goal,
      phase: initialPhase,
      status: 'running',
      startTime: Date.now(),
      lastUpdateTime: Date.now(),
      progress: {
        totalTasks: 0,
        completedTasks: 0,
        failedTasks: 0,
      },
      completedTasks: [],
      context: {
        estimatedTokens: 0,
        messagesCount: 0,
        toolCallsCount: 0,
      },
      checkpoints: [],
    };
    
    // 开始自动保存
    if (this.config.enableAutoSave) {
      this.startAutoCheckpoint();
    }
    
    console.log(`${colors.cyan}🆕 会话创建: ${sessionId}${colors.reset}`);
    
    return this.currentSession;
  }
  
  /**
   * 更新会话状态
   */
  updateSession(updates: Partial<SessionState>): void {
    if (!this.currentSession) {
      console.log(`${colors.yellow}⚠️ 没有活动的会话${colors.reset}`);
      return;
    }
    
    Object.assign(this.currentSession, updates);
    this.currentSession.lastUpdateTime = Date.now();
    
    // 自动保存
    if (this.config.enableAutoSave) {
      this.saveSession();
    }
  }
  
  /**
   * 更新进度
   */
  updateProgress(totalTasks: number, completedTasks: number, failedTasks: number = 0): void {
    if (!this.currentSession) return;
    
    this.currentSession.progress = {
      totalTasks,
      completedTasks,
      failedTasks,
    };
    this.currentSession.lastUpdateTime = Date.now();
  }
  
  /**
   * 更新当前任务
   */
  setCurrentTask(task: { id: string; name: string; agentType: string }): void {
    if (!this.currentSession) return;
    
    this.currentSession.currentTask = task;
    this.createCheckpoint('task_start', `开始任务: ${task.name}`);
  }
  
  /**
   * 完成任务
   */
  completeTask(task: CompletedTask): void {
    if (!this.currentSession) return;
    
    this.currentSession.completedTasks.push(task);
    this.currentSession.progress.completedTasks++;
    this.createCheckpoint('task_complete', `完成任务: ${task.name}`);
  }
  
  /**
   * 记录错误
   */
  recordError(message: string, stack?: string): void {
    if (!this.currentSession) return;
    
    this.currentSession.error = {
      message,
      stack,
      timestamp: Date.now(),
    };
    this.currentSession.status = 'failed';
    
    console.log(`${colors.red}🚨 会话错误: ${message}${colors.reset}`);
  }
  
  /**
   * 创建检查点
   */
  createCheckpoint(phase: string, description: string, data?: any): void {
    if (!this.currentSession) return;
    
    const checkpoint: SessionCheckpoint = {
      id: `cp_${Date.now()}`,
      timestamp: Date.now(),
      phase,
      description,
      data,
    };
    
    this.currentSession.checkpoints.push(checkpoint);
    
    // 保持检查点在限制内
    if (this.currentSession.checkpoints.length > this.config.maxCheckpoints) {
      this.currentSession.checkpoints.shift();
    }
  }
  
  /**
   * 保存会话到文件
   */
  saveSession(): void {
    if (!this.currentSession) return;
    
    const filePath = join(this.config.storageDir, `${this.currentSession.sessionId}.json`);
    
    try {
      writeFileSync(filePath, JSON.stringify(this.currentSession, null, 2));
    } catch (error) {
      console.log(`${colors.red}❌ 保存会话失败: ${error}${colors.reset}`);
    }
  }
  
  /**
   * 加载会话
   */
  loadSession(sessionId: string): SessionState | null {
    const filePath = join(this.config.storageDir, `${sessionId}.json`);
    
    if (!existsSync(filePath)) {
      return null;
    }
    
    try {
      const data = readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.log(`${colors.red}❌ 加载会话失败: ${error}${colors.reset}`);
      return null;
    }
  }
  
  /**
   * 恢复会话
   */
  recoverSession(sessionId: string): SessionState | null {
    const session = this.loadSession(sessionId);
    
    if (!session) {
      console.log(`${colors.yellow}⚠️ 找不到会话: ${sessionId}${colors.reset}`);
      return null;
    }
    
    if (session.status === 'completed') {
      console.log(`${colors.green}✅ 会话已完成: ${sessionId}${colors.reset}`);
      return null;
    }
    
    this.currentSession = session;
    this.currentSession.status = 'running';
    
    console.log(`${colors.green}✅ 会话已恢复: ${sessionId}${colors.reset}`);
    console.log(`${colors.cyan}   目标: ${session.goal}${colors.reset}`);
    console.log(`${colors.cyan}   进度: ${session.progress.completedTasks}/${session.progress.totalTasks} 任务${colors.reset}`);
    
    return session;
  }
  
  /**
   * 列出所有会话
   */
  listSessions(): { id: string; goal: string; status: string; lastUpdate: number }[] {
    const files = readdirSync(this.config.storageDir).filter(f => f.endsWith('.json'));
    
    return files.map(file => {
      const session = this.loadSession(file.replace('.json', ''));
      if (!session) return null;
      
      return {
        id: session.sessionId,
        goal: session.goal,
        status: session.status,
        lastUpdate: session.lastUpdateTime,
      };
    }).filter(Boolean) as any[];
  }
  
  /**
   * 获取最近的会话
   */
  getRecentSessions(limit: number = 5): { id: string; goal: string; status: string; lastUpdate: number }[] {
    const sessions = this.listSessions();
    return sessions
      .sort((a, b) => b.lastUpdate - a.lastUpdate)
      .slice(0, limit);
  }
  
  /**
   * 获取当前会话
   */
  getCurrentSession(): SessionState | null {
    return this.currentSession;
  }
  
  /**
   * 获取会话进度百分比
   */
  getProgressPercent(): number {
    if (!this.currentSession || this.currentSession.progress.totalTasks === 0) {
      return 0;
    }
    return (this.currentSession.progress.completedTasks / this.currentSession.progress.totalTasks) * 100;
  }
  
  /**
   * 开始自动检查点
   */
  private startAutoCheckpoint(): void {
    if (this.checkpointTimer) {
      clearInterval(this.checkpointTimer);
    }
    
    this.checkpointTimer = setInterval(() => {
      if (this.currentSession && this.currentSession.status === 'running') {
        const locale = getLocale();
        const autoSaveLabel = locale === 'zh' ? '自动保存' : 'Auto-save';
        this.createCheckpoint('auto', autoSaveLabel);
        this.saveSession();
      }
    }, this.config.autoCheckpointInterval);
  }
  
  /**
   * 停止自动检查点
   */
  stopAutoCheckpoint(): void {
    if (this.checkpointTimer) {
      clearInterval(this.checkpointTimer);
      this.checkpointTimer = null;
    }
  }
  
  /**
   * 标记会话完成
   */
  completeSession(): void {
    if (!this.currentSession) return;
    
    const locale = getLocale();
    const isZh = locale === 'zh';
    const sessionCompleteLabel = isZh ? '会话完成' : 'Session Complete';
    const completedTasksLabel = isZh ? '完成任务' : 'Completed tasks';
    
    this.currentSession.status = 'completed';
    this.currentSession.lastUpdateTime = Date.now();
    this.stopAutoCheckpoint();
    this.saveSession();
    
    console.log(`${colors.green}✅ ${sessionCompleteLabel}: ${this.currentSession.sessionId}${colors.reset}`);
    console.log(`${colors.cyan}   ${completedTasksLabel}: ${this.currentSession.progress.completedTasks}/${this.currentSession.progress.totalTasks}${colors.reset}`);
  }
  
  /**
   * 中断会话
   */
  interruptSession(reason?: string): void {
    if (!this.currentSession) return;
    
    const locale = getLocale();
    const isZh = locale === 'zh';
    const sessionInterruptedLabel = isZh ? '会话中断' : 'Session Interrupted';
    const unknownReason = isZh ? '未知原因' : 'Unknown reason';
    const sessionSavedLabel = isZh ? '会话已保存，可使用 sessionId 恢复' : 'Session saved, can be recovered with sessionId';
    
    this.currentSession.status = 'interrupted';
    this.currentSession.lastUpdateTime = Date.now();
    this.stopAutoCheckpoint();
    this.saveSession();
    
    console.log(`${colors.yellow}⚠️ ${sessionInterruptedLabel}: ${reason || unknownReason}${colors.reset}`);
    console.log(`${colors.cyan}   ${sessionSavedLabel}${colors.reset}`);
  }
  
  /**
   * 删除会话
   */
  deleteSession(sessionId: string): boolean {
    const filePath = join(this.config.storageDir, `${sessionId}.json`);
    
    if (!existsSync(filePath)) {
      return false;
    }
    
    try {
      unlinkSync(filePath);
      console.log(`${colors.green}✅ 会话已删除: ${sessionId}${colors.reset}`);
      return true;
    } catch (error) {
      console.log(`${colors.red}❌ 删除会话失败: ${error}${colors.reset}`);
      return false;
    }
  }
  
  /**
   * 生成会话报告
   */
  getSessionReport(): string {
    const locale = getLocale();
    const isZh = locale === 'zh';
    
    if (!this.currentSession) {
      return isZh ? '没有活动的会话' : 'No active session';
    }
    
    const session = this.currentSession;
    const duration = (session.lastUpdateTime - session.startTime) / 1000;
    const progress = this.getProgressPercent();
    
    // Labels
    const sessionReportLabel = isZh ? '会话报告' : 'Session Report';
    const sessionIdLabel = isZh ? '会话 ID' : 'Session ID';
    const goalLabel = isZh ? '目标' : 'Goal';
    const statusLabel = isZh ? '状态' : 'Status';
    const progressLabel = isZh ? '进度' : 'Progress';
    const totalTasksLabel = isZh ? '总任务' : 'Total tasks';
    const completedLabel = isZh ? '已完成' : 'Completed';
    const failedLabel = isZh ? '失败' : 'Failed';
    const percentLabel = isZh ? '百分比' : 'Percent';
    const timeLabel = isZh ? '时间' : 'Time';
    const startLabel = isZh ? '开始' : 'Started';
    const durationLabel = isZh ? '持续' : 'Duration';
    const secondsLabel = isZh ? '秒' : 'seconds';
    const currentTaskLabel = isZh ? '当前任务' : 'Current task';
    const taskNameLabel = isZh ? '名称' : 'Name';
    const agentLabel = isZh ? 'Agent' : 'Agent';
    const checkpointsLabel = isZh ? '检查点' : 'Checkpoints';
    
    let report = `
${'='.repeat(60)}
📋 ${sessionReportLabel}
${'='.repeat(60)}

🆔 ${sessionIdLabel}: ${session.sessionId}
🎯 ${goalLabel}: ${session.goal}
📊 ${statusLabel}: ${this.getStatusIcon(session.status)} ${session.status}

📈 ${progressLabel}:
   ${totalTasksLabel}: ${session.progress.totalTasks}
   ${completedLabel}: ${session.progress.completedTasks}
   ${failedLabel}: ${session.progress.failedTasks}
   ${percentLabel}: ${progress.toFixed(1)}%

⏱️ ${timeLabel}:
   ${startLabel}: ${new Date(session.startTime).toLocaleString()}
   ${durationLabel}: ${duration.toFixed(1)} ${secondsLabel}
`;
    
    if (session.currentTask) {
      report += `
🔄 ${currentTaskLabel}:
   ${taskNameLabel}: ${session.currentTask.name}
   ${agentLabel}: ${session.currentTask.agentType}
`;
    }
    
    if (session.checkpoints.length > 0) {
      report += `
📝 ${checkpointsLabel} (${session.checkpoints.length}):
`;
      session.checkpoints.slice(-3).forEach(cp => {
        report += `   • ${new Date(cp.timestamp).toLocaleTimeString()} - ${cp.description}\n`;
      });
    }
    
    const errorLabel = isZh ? '错误' : 'Error';
    
    if (session.error) {
      report += `
🚨 ${errorLabel}:
   ${session.error.message}
`;
    }
    
    report += `${'='.repeat(60)}\n`;
    
    return report;
  }
  
  /**
   * 获取状态图标
   */
  private getStatusIcon(status: string): string {
    switch (status) {
      case 'running': return '🔄';
      case 'completed': return '✅';
      case 'failed': return '❌';
      case 'interrupted': return '⏸️';
      case 'paused': return '⏳';
      default: return '❓';
    }
  }
  
  /**
   * 打印会话状态
   */
  printStatus(): void {
    if (!this.currentSession) {
      console.log(`${colors.dim}没有活动的会话${colors.reset}`);
      return;
    }
    
    const session = this.currentSession;
    const progress = this.getProgressPercent();
    const barWidth = 20;
    const filled = Math.round(barWidth * (progress / 100));
    const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);
    
    console.log(`
${colors.cyan}┌────────────────────────────────────────────────┐${colors.reset}`);
    console.log(`${colors.cyan}│${colors.reset} ${colors.bright}会话状态${colors.reset}${colors.cyan}${' '.repeat(33)}│${colors.reset}`);
    console.log(`${colors.cyan}├────────────────────────────────────────────────┤${colors.reset}`);
    console.log(`${colors.cyan}│${colors.reset} ${bar} ${progress.toFixed(1)}% ${colors.cyan}${' '.repeat(18)}│${colors.reset}`);
    console.log(`${colors.cyan}│${colors.reset} 任务: ${session.progress.completedTasks}/${session.progress.totalTasks} | 状态: ${session.status} ${colors.cyan}${' '.repeat(9)}│${colors.reset}`);
    console.log(`${colors.cyan}│${colors.reset} ${colors.dim}${session.goal.substring(0, 40)}${colors.cyan}${' '.repeat(Math.max(0, 45 - session.goal.length))}│${colors.reset}`);
    console.log(`${colors.cyan}└────────────────────────────────────────────────┘${colors.reset}
`);
  }
}

/**
 * 创建会话管理器
 */
export function createSessionManager(config?: Partial<SessionConfig>): SessionManager {
  return new SessionManager(config);
}

// 默认会话管理器
export const sessionManager = createSessionManager();

// 便捷函数
export function createSession(goal: string): SessionState {
  return sessionManager.createSession(goal);
}

export function recoverSession(sessionId: string): SessionState | null {
  return sessionManager.recoverSession(sessionId);
}

export function getCurrentSession(): SessionState | null {
  return sessionManager.getCurrentSession();
}

export function updateSessionProgress(total: number, completed: number, failed: number = 0): void {
  sessionManager.updateProgress(total, completed, failed);
}

export function printSessionStatus(): void {
  sessionManager.printStatus();
}

export function getSessionReport(): string {
  return sessionManager.getSessionReport();
}
