'use client';

import useSWR, { mutate } from 'swr';
import { fetcher } from '../../lib/api';
import { SystemStatus } from '../../types/agent';
import { ArrowLeft, Clock, Play, Square, RotateCw } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Sidebar } from '../../components/Sidebar';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export default function AgentsPage() {
  const { data } = useSWR<SystemStatus>('/api/status', fetcher, { refreshInterval: 2000 });
  const agents = data?.agents || [];
  const [controlling, setControlling] = useState<string | null>(null);

  const controlAgent = async (agentId: string, action: 'start' | 'stop' | 'restart') => {
    setControlling(agentId);
    try {
      const response = await fetch(`${API_BASE}/api/agents/${agentId}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        // Refresh agent status
        mutate('/api/status');
        alert(`Agent ${agentId} ${action === 'start' ? '启动' : action === 'stop' ? '停止' : '重启'}成功`);
      } else {
        alert('操作失败');
      }
    } catch (error) {
      alert('网络错误');
    } finally {
      setControlling(null);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running': return <span className="badge badge-success">运行中</span>;
      case 'error': return <span className="badge badge-error">错误</span>;
      case 'idle': return <span className="badge badge-neutral">空闲</span>;
      default: return <span className="badge badge-neutral">{status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{ 
          height: '60px', 
          background: 'var(--bg-secondary)', 
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          gap: '16px'
        }}>
          <Link href="/" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={20} />
          </Link>
          <h2 style={{ fontSize: '18px', fontWeight: 500 }}>智能体详情</h2>
        </header>

        {/* Content */}
        <div style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {agents.map(agent => (
              <div key={agent.id} className="card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>{agent.name}</h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>ID: {agent.id}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {getStatusBadge(agent.status)}
                    {/* Control Buttons */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {agent.status === 'running' ? (
                        <>
                          <button
                            onClick={() => controlAgent(agent.id, 'restart')}
                            disabled={controlling === agent.id}
                            style={{
                              padding: '6px',
                              background: 'var(--bg-tertiary)',
                              border: '1px solid var(--border)',
                              borderRadius: '4px',
                              cursor: controlling === agent.id ? 'not-allowed' : 'pointer',
                              opacity: controlling === agent.id ? 0.5 : 1
                            }}
                            title="重启"
                          >
                            <RotateCw size={14} style={{ color: 'var(--accent)' }} />
                          </button>
                          <button
                            onClick={() => controlAgent(agent.id, 'stop')}
                            disabled={controlling === agent.id}
                            style={{
                              padding: '6px',
                              background: 'var(--bg-tertiary)',
                              border: '1px solid var(--border)',
                              borderRadius: '4px',
                              cursor: controlling === agent.id ? 'not-allowed' : 'pointer',
                              opacity: controlling === agent.id ? 0.5 : 1
                            }}
                            title="停止"
                          >
                            <Square size={14} style={{ color: 'var(--error)' }} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => controlAgent(agent.id, 'start')}
                          disabled={controlling === agent.id}
                          style={{
                            padding: '6px',
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            cursor: controlling === agent.id ? 'not-allowed' : 'pointer',
                            opacity: controlling === agent.id ? 0.5 : 1
                          }}
                          title="启动"
                        >
                          <Play size={14} style={{ color: 'var(--success)' }} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '24px',
                  marginBottom: '16px'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>当前任务</div>
                    <div style={{ fontSize: '14px' }}>{agent.currentTask || '无任务'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>进度</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="progress-bar" style={{ flex: 1 }}>
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${agent.progress}%`,
                            background: agent.status === 'error' ? 'var(--error)' : 'var(--accent)'
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '14px', minWidth: '40px' }}>{agent.progress}%</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>运行时间</div>
                    <div style={{ fontSize: '14px' }}>{formatTime(agent.runningTime)}</div>
                  </div>
                </div>

                {/* Steps */}
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>执行步骤</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {agent.details.steps.map((step, idx) => (
                      <span 
                        key={idx}
                        style={{ 
                          padding: '4px 12px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          background: idx === agent.details.currentStep ? 'var(--accent)' : 'var(--bg-tertiary)',
                          color: idx === agent.details.currentStep ? 'white' : 'var(--text-secondary)'
                        }}
                      >
                        {idx + 1}. {step}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recent Logs */}
                {agent.details.logs.length > 0 && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>最近日志</div>
                    <div style={{ 
                      background: 'var(--bg-primary)', 
                      padding: '12px', 
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      fontSize: '12px'
                    }}>
                      {agent.details.logs.slice(-3).map((log, idx) => (
                        <div key={idx} style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
