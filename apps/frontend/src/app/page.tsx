'use client';

import useSWR from 'swr';
import { fetcher } from '../lib/api';
import { SystemStatus } from '../types/agent';
import { Sidebar } from '../components/Sidebar';

export default function Dashboard() {
  const { data } = useSWR<SystemStatus>('/api/status', fetcher, { refreshInterval: 2000 });
  const { data: logs } = useSWR('/api/panopticon/logs', fetcher, { refreshInterval: 2000 });

  const agents = data?.agents || [];
  const activeCount = agents.filter(a => a.status === 'running').length;
  const errorCount = agents.filter(a => a.status === 'error').length;

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running': return <span className="badge badge-success">运行中</span>;
      case 'error': return <span className="badge badge-error">错误</span>;
      case 'idle': return <span className="badge badge-neutral">空闲</span>;
      default: return <span className="badge badge-neutral">{status}</span>;
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'running': return <span className="status-indicator status-online" />;
      case 'error': return <span className="status-indicator status-offline" />;
      default: return <span className="status-indicator status-idle" />;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Status Bar */}
        <header className="status-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="status-indicator status-online" />
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              系统正常 · 运行 {formatTime(data?.system?.uptime || 0)}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginLeft: 'auto' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 600 }}>{activeCount}/{agents.length}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>活跃</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 600, color: errorCount > 0 ? 'var(--error)' : 'inherit' }}>
                {errorCount}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>异常</div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
          <div style={{ display: 'flex', gap: '24px', height: '100%' }}>
            {/* Agents Grid */}
            <div style={{ flex: 2 }}>
              <h2 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '16px', color: 'var(--text-secondary)' }}>
                智能体状态
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {agents.map(agent => (
                  <div key={agent.id} className="card" style={{ padding: '16px' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {getStatusDot(agent.status)}
                        <span style={{ fontSize: '16px', fontWeight: 500 }}>{agent.name}</span>
                      </div>
                      {getStatusBadge(agent.status)}
                    </div>

                    {/* Task */}
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px', minHeight: '20px' }}>
                      {agent.currentTask}
                    </p>

                    {/* Progress */}
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        <span>进度</span>
                        <span>{agent.progress}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${agent.progress}%`,
                            background: agent.status === 'error' ? 'var(--error)' : 'var(--accent)'
                          }}
                        />
                      </div>
                    </div>

                    {/* Footer */}
                    {agent.runningTime > 0 && (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' }}>
                        运行时间: {formatTime(agent.runningTime)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Logs Panel */}
            <div style={{ width: '360px', display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 500, marginBottom: '16px', color: 'var(--text-secondary)' }}>
                实时日志
              </h2>
              <div className="card" style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: 'monospace', fontSize: '12px' }}>
                  {(logs || []).slice(-100).map((log: any, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(log.timestamp).toLocaleTimeString('zh-CN', { hour12: false })}
                      </span>
                      <span style={{ 
                        color: log.level === 'ERROR' ? 'var(--error)' : 
                               log.level === 'WARN' ? 'var(--warning)' : 'var(--accent)',
                        whiteSpace: 'nowrap'
                      }}>
                        [{log.level}]
                      </span>
                      <span style={{ color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
