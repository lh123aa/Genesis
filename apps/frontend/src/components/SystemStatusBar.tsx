'use client';

import { Clock, Bot, AlertTriangle, DollarSign } from 'lucide-react';
import { SystemStatus } from '../types/agent';

interface SystemStatusBarProps {
  status: SystemStatus['system'];
  agentCount: { active: number; total: number };
  alerts?: number;
  totalCost?: number;
}

export function SystemStatusBar({ status, agentCount, alerts = 0, totalCost = 0 }: SystemStatusBarProps) {
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'var(--status-online)';
      case 'degraded': return 'var(--status-busy)';
      case 'critical': return 'var(--status-offline)';
      default: return 'var(--text-muted)';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy': return '运行正常';
      case 'degraded': return '性能下降';
      case 'critical': return '严重故障';
      default: return '未知状态';
    }
  };

  return (
    <div className="h-14 px-8 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
      {/* Left: Status */}
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <span 
            className="w-2 h-2 rounded-full"
            style={{ 
              backgroundColor: getStatusColor(status.status),
              boxShadow: `0 0 6px ${getStatusColor(status.status)}`
            }}
          />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">系统状态</div>
            <div 
              className="text-sm font-medium"
              style={{ color: getStatusColor(status.status) }}
            >
              {getStatusText(status.status)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock size={14} className="text-[var(--text-muted)]" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">运行时长</div>
            <div className="text-sm mono text-[var(--text-primary)]">
              {formatUptime(status.uptime)}
            </div>
          </div>
        </div>
      </div>

      {/* Right: Metrics */}
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <Bot size={14} className="text-[var(--accent-primary)]" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">活跃智能体</div>
            <div className="text-sm text-[var(--text-primary)]">
              <span style={{ color: 'var(--status-online)' }}>{agentCount.active}</span>
              <span className="text-[var(--text-muted)]"> / {agentCount.total}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AlertTriangle 
            size={14} 
            style={{ color: alerts > 0 ? 'var(--status-busy)' : 'var(--text-muted)' }} 
          />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">告警</div>
            <div 
              className="text-sm"
              style={{ color: alerts > 0 ? 'var(--status-busy)' : 'var(--text-primary)' }}
            >
              {alerts}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DollarSign size={14} className="text-[var(--text-muted)]" />
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Token</div>
            <div className="text-sm mono text-[var(--text-primary)]">
              {totalCost.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
