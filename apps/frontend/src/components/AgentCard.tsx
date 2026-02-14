import React, { useState } from 'react';
import { Agent } from '../types/agent';
import { Activity, Clock, PlayCircle, AlertCircle, ChevronDown, ChevronUp, Terminal } from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  const [showLogs, setShowLogs] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

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
          icon: <PlayCircle size={14} />,
          color: 'text-[var(--accent-primary)]',
          bgColor: 'bg-[var(--accent-primary)]/10',
          borderColor: 'border-[var(--accent-primary)]/30',
          glow: 'shadow-[0_0_10px_rgba(0,212,255,0.2)]',
          label: '运行中'
        };
      case 'idle':
        return {
          icon: <Clock size={14} />,
          color: 'text-[var(--text-muted)]',
          bgColor: 'bg-[var(--bg-secondary)]',
          borderColor: 'border-[var(--border-subtle)]',
          glow: '',
          label: '待机'
        };
      case 'error':
        return {
          icon: <AlertCircle size={14} />,
          color: 'text-[var(--status-offline)]',
          bgColor: 'bg-[var(--status-offline)]/10',
          borderColor: 'border-[var(--status-offline)]/30',
          glow: 'shadow-[0_0_10px_rgba(239,68,68,0.2)]',
          label: '错误'
        };
      default:
        return {
          icon: <Activity size={14} />,
          color: 'text-[var(--text-muted)]',
          bgColor: 'bg-[var(--bg-secondary)]',
          borderColor: 'border-[var(--border-subtle)]',
          glow: '',
          label: status
        };
    }
  };

  const statusConfig = getStatusConfig(agent.status);

  return (
    <div className={`
      glass-card overflow-hidden transition-all duration-300
      ${statusConfig.glow}
      ${agent.status === 'running' ? 'border-[var(--accent-primary)]/30' : ''}
    `}>
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Status Indicator */}
            <div className={`
              w-2 h-2 rounded-full
              ${agent.status === 'running' ? 'bg-[var(--accent-primary)] animate-pulse' : 
                agent.status === 'error' ? 'bg-[var(--status-offline)]' :
                'bg-[var(--text-muted)]'}
            `} />
            
            {/* Agent Name */}
            <h3 className="font-mono text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">
              {agent.name}
            </h3>
          </div>

          {/* Status Badge */}
          <div className={`
            flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono
            ${statusConfig.bgColor} ${statusConfig.color} border ${statusConfig.borderColor}
          `}>
            {statusConfig.icon}
            <span>{statusConfig.label}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[10px] font-mono text-[var(--text-muted)] mb-1">
            <span>进度</span>
            <span className={agent.status === 'running' ? 'text-[var(--accent-primary)]' : ''}>
              {agent.progress}%
            </span>
          </div>
          <div className="h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
            <div 
              className={`
                h-full rounded-full transition-all duration-500
                ${agent.status === 'error' ? 'bg-[var(--status-offline)]' :
                  agent.status === 'running' ? 'bg-[var(--accent-primary)]' :
                  'bg-[var(--text-muted)]'}
              `}
              style={{ width: `${agent.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Task Info */}
      <div className="p-4">
        <div className="flex items-start gap-2">
          <Terminal size={14} className="text-[var(--accent-primary)] mt-0.5 shrink-0" />
          <p className="font-mono text-sm text-[var(--text-secondary)] line-clamp-2">
            {agent.currentTask || "等待指令..."}
          </p>
        </div>

        {/* Running Time */}
        {agent.runningTime > 0 && (
          <div className="mt-2 flex items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
            <Clock size={12} />
            <span>运行时间: {formatTime(agent.runningTime)}</span>
          </div>
        )}
      </div>

      {/* Expandable Actions */}
      <div className="px-4 pb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setShowLogs(!showLogs)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 
                       bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]
                       border border-[var(--border-subtle)] hover:border-[var(--border-primary)]
                       rounded text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                       transition-all"
          >
            <Terminal size={12} />
            <span>日志</span>
            {showLogs ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 
                       bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)]
                       border border-[var(--border-subtle)] hover:border-[var(--border-primary)]
                       rounded text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                       transition-all"
          >
            <Activity size={12} />
            <span>详情</span>
            {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>

        {/* Logs Panel */}
        {showLogs && agent.details.logs.length > 0 && (
          <div className="mt-3 p-3 bg-[var(--bg-secondary)] rounded border border-[var(--border-subtle)]">
            <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar">
              {agent.details.logs.slice(-3).map((log, idx) => (
                <div key={idx} className="text-[10px] font-mono text-[var(--text-muted)] truncate">
                  <span className="text-[var(--accent-primary)] mr-1">$</span>
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Details Panel */}
        {showDetails && (
          <div className="mt-3 p-3 bg-[var(--bg-secondary)] rounded border border-[var(--border-subtle)]">
            <div className="text-xs font-mono text-[var(--text-muted)]">
              <div className="flex justify-between mb-1">
                <span>当前步骤:</span>
                <span className="text-[var(--text-primary)]">
                  {agent.details.steps[agent.details.currentStep]}
                </span>
              </div>
              <div className="flex justify-between">
                <span>步骤进度:</span>
                <span className="text-[var(--text-primary)]">
                  {agent.details.currentStep + 1} / {agent.details.steps.length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};