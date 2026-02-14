'use client';

import { useEffect, useRef, useState } from 'react';
import { Database, Filter, X } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  traceId?: string;
}

interface LogStreamProps {
  logs: LogEntry[];
  maxHeight?: string;
}

export function LogStream({ logs, maxHeight = '400px' }: LogStreamProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<'all' | 'error' | 'warn' | 'info'>('all');
  const [highlightedTrace, setHighlightedTrace] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    return log.level.toLowerCase() === filter;
  });

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filteredLogs, autoScroll]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'text-[var(--status-error)]';
      case 'WARN': return 'text-[var(--status-warning)]';
      case 'INFO': return 'text-[var(--text-accent)]';
      default: return 'text-[var(--text-muted)]';
    }
  };

  const getLevelBg = (level: string) => {
    switch (level) {
      case 'ERROR': return 'bg-[var(--status-error)]/10';
      case 'WARN': return 'bg-[var(--status-warning)]/10';
      case 'INFO': return 'bg-[var(--text-accent)]/5';
      default: return '';
    }
  };

  return (
    <div className="glass-card flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Database size={16} className="text-[var(--text-accent)]" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">实时链路日志</h3>
          <span className="text-xs text-[var(--text-muted)] ml-2">
            {filteredLogs.length} 条记录
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Filter Buttons */}
          <div className="flex items-center gap-1 bg-[var(--bg-secondary)] rounded-lg p-1">
            {(['all', 'error', 'warn', 'info'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                  filter === f 
                    ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1.5 rounded-lg transition-colors ${
              autoScroll ? 'text-[var(--text-accent)]' : 'text-[var(--text-muted)]'
            }`}
            title="自动滚动"
          >
            <div className={`w-2 h-2 rounded-full ${autoScroll ? 'bg-[var(--text-accent)]' : 'bg-[var(--text-muted)]'}`} />
          </button>
        </div>
      </div>

      {/* Log List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1"
        style={{ maxHeight }}
      >
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-[var(--text-muted)]">
            <Database size={24} className="mb-2 opacity-50" />
            <span className="text-sm">暂无日志</span>
          </div>
        ) : (
          filteredLogs.map((log, index) => (
            <div
              key={index}
              onClick={() => log.traceId && setHighlightedTrace(log.traceId === highlightedTrace ? null : log.traceId)}
              className={`group flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                getLevelBg(log.level)
              } ${
                highlightedTrace && log.traceId === highlightedTrace 
                  ? 'ring-1 ring-[var(--text-accent)]' 
                  : 'hover:bg-[var(--bg-hover)]'
              }`}
            >
              {/* Timestamp */}
              <span className="text-xs text-[var(--text-muted)] font-mono shrink-0 w-16">
                {new Date(log.timestamp).toLocaleTimeString('en-US', { 
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </span>
              
              {/* Level */}
              <span className={`text-xs font-bold shrink-0 w-12 ${getLevelColor(log.level)}`}>
                {log.level}
              </span>
              
              {/* Trace ID */}
              {log.traceId && (
                <span className="text-xs font-mono text-[var(--text-muted)] shrink-0 w-20 truncate">
                  {log.traceId.slice(0, 8)}...
                </span>
              )}
              
              {/* Message */}
              <span className="text-sm text-[var(--text-primary)] break-all flex-1">
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Footer with highlighted trace info */}
      {highlightedTrace && (
        <div className="px-4 py-2 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex items-center justify-between">
          <span className="text-xs text-[var(--text-muted)]">
            Highlighting Trace: <span className="font-mono text-[var(--text-accent)]">{highlightedTrace}</span>
          </span>
          <button 
            onClick={() => setHighlightedTrace(null)}
            className="p-1 hover:bg-[var(--bg-hover)] rounded transition-colors"
          >
            <X size={14} className="text-[var(--text-muted)]" />
          </button>
        </div>
      )}
    </div>
  );
}
