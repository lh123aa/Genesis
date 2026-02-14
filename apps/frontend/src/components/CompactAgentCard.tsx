'use client';

import { useState } from 'react';
import { Agent } from '../types/agent';
import { 
  Play, 
  Pause, 
  AlertCircle, 
  Clock, 
  Terminal, 
  ChevronDown,
  Activity,
  Hash,
  DollarSign,
  Cpu
} from 'lucide-react';

interface CompactAgentCardProps {
  agent: Agent;
  isMain?: boolean;
  traceId?: string;
  costUsage?: { current: number; limit: number };
}

export function CompactAgentCard({ 
  agent, 
  isMain = false,
  traceId,
  costUsage
}: CompactAgentCardProps) {
  const [expanded, setExpanded] = useState(false);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'running':
        return {
          icon: Play,
          color: 'var(--status-online)',
          label: '运行中'
        };
      case 'idle':
        return {
          icon: Pause,
          color: 'var(--status-idle)',
          label: '空闲'
        };
      case 'error':
        return {
          icon: AlertCircle,
          color: 'var(--status-offline)',
          label: '错误'
        };
      default:
        return {
          icon: Activity,
          color: 'var(--text-muted)',
          label: '未知'
        };
    }
  };

  const statusConfig = getStatusConfig(agent.status);
  const StatusIcon = statusConfig.icon;
  const costPercent = costUsage ? (costUsage.current / costUsage.limit) * 100 : 0;
  const isOverBudget = costPercent > 100;

  return (
    <div className="panel corner-accent">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span 
            className="status-dot"
            style={{ 
              backgroundColor: `var(${statusConfig.color})`,
              boxShadow: agent.status === 'running' || agent.status === 'error' 
                ? `0 0 6px var(${statusConfig.color})` 
                : 'none'
            }}
          />
          <span className="font-medium text-sm">{agent.name}</span>
          {isMain && (
            <span 
              className="text-[10px] px-2 py-0.5 rounded-sm border"
              style={{ 
                color: 'var(--accent-primary)',
                borderColor: 'var(--border-primary)',
                backgroundColor: 'var(--accent-dim)'
              }}
            >
              <Cpu size={10} className="inline mr-1" />
              主控
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <span 
            className="text-xs flex items-center gap-1.5"
            style={{ color: `var(${statusConfig.color})` }}
          >
            <StatusIcon size={12} />
            {statusConfig.label}
          </span>
          
          {agent.status === 'running' && (
            <span className="text-xs mono text-[var(--text-muted)] flex items-center gap-1">
              <Clock size={11} />
              {formatTime(agent.runningTime)}
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-2">
          <span>进度</span>
          <span className="mono">{agent.progress}%</span>
        </div>
        <div className="progress-track">
          <div 
            className="progress-fill"
            style={{ 
              width: `${agent.progress}%`,
              backgroundColor: agent.status === 'error' 
                ? 'var(--status-offline)' 
                : 'var(--accent-primary)'
            }}
          />
        </div>
      </div>

      {/* Current Task */}
      <div 
        className="p-3 rounded-md mb-4"
        style={{ backgroundColor: 'var(--bg-tertiary)' }}
      >
        <div className="flex items-start gap-2 text-xs">
          <Terminal size={12} className="text-[var(--accent-primary)] mt-0.5 shrink-0" />
          <span className="text-[var(--text-secondary)] mono line-clamp-2">
            {agent.currentTask || '等待指令...'}
          </span>
        </div>
      </div>

      {/* Meta Info */}
      {(traceId || costUsage) && (
        <div className="flex items-center gap-4 pt-3 border-t border-[var(--border-subtle)]">
          {traceId && (
            <div className="flex items-center gap-1.5 text-xs">
              <Hash size={10} className="text-[var(--text-muted)]" />
              <span className="mono text-[var(--accent-primary)]">
                {traceId.slice(0, 8)}
              </span>
            </div>
          )}
          
          {costUsage && (
            <div className="flex items-center gap-2 text-xs flex-1">
              <DollarSign 
                size={10} 
                style={{ color: isOverBudget ? 'var(--status-offline)' : 'var(--text-muted)' }} 
              />
              <div className="flex-1 flex items-center gap-2">
                <div className="progress-track flex-1">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${Math.min(costPercent, 100)}%`,
                      backgroundColor: isOverBudget ? 'var(--status-offline)' : 'var(--status-online)'
                    }}
                  />
                </div>
                <span 
                  className="mono"
                  style={{ color: isOverBudget ? 'var(--status-offline)' : 'var(--text-muted)' }}
                >
                  {Math.round(costPercent)}%
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Logs */}
      {agent.details.logs.length > 0 && (
        <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            <span className="flex items-center gap-2">
              <span 
                className="w-1 h-1 rounded-full"
                style={{ backgroundColor: 'var(--accent-primary)' }}
              />
              日志
              <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-[var(--bg-tertiary)]">
                {agent.details.logs.length}
              </span>
            </span>
            <ChevronDown 
              size={14} 
              className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
          
          <div className={`overflow-hidden transition-all ${expanded ? 'max-h-32 mt-3' : 'max-h-0'}`}>
            <div className="space-y-1">
              {agent.details.logs.slice(-5).map((log, index) => (
                <div 
                  key={index} 
                  className="text-[11px] text-[var(--text-muted)] mono flex items-center gap-2"
                >
                  <span className="text-[var(--accent-primary)]">$</span>
                  <span className="truncate">{log}</span>
                </div>
              ))}
            </div>
          </div>
          
          {!expanded && (
            <div className="mt-2 text-[11px] text-[var(--text-muted)] mono flex items-center gap-2">
              <span className="text-[var(--accent-primary)]">$</span>
              <span className="truncate">{agent.details.logs[agent.details.logs.length - 1]}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
