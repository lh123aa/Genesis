'use client';

import useSWR from 'swr';
import { fetcher } from '../../lib/api';
import { ArrowLeft, Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Sidebar } from '../../components/Sidebar';

interface Trace {
  traceId: string;
  startTime: string;
  status: 'success' | 'failed' | 'running';
  agentCount: number;
  duration: number;
}

export default function TracesPage() {
  const { data: traces } = useSWR<Trace[]>('/api/traces', fetcher, { refreshInterval: 5000 });
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const allTraces = traces || [];
  
  const filteredTraces = allTraces.filter(trace => {
    const matchesText = !filter || trace.traceId.toLowerCase().includes(filter.toLowerCase());
    const matchesStatus = !statusFilter || trace.status === statusFilter;
    return matchesText && matchesStatus;
  });

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return <span className="badge badge-success">成功</span>;
      case 'failed': return <span className="badge badge-error">失败</span>;
      case 'running': return <span className="badge badge-warning">运行中</span>;
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
          <h2 style={{ fontSize: '18px', fontWeight: 500 }}>链路追踪</h2>
          <span style={{ marginLeft: 'auto', fontSize: '14px', color: 'var(--text-muted)' }}>
            共 {filteredTraces.length} 条链路
          </span>
        </header>

        {/* Filters */}
        <div style={{ 
          padding: '16px 24px', 
          background: 'var(--bg-secondary)', 
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          gap: '16px',
          alignItems: 'center'
        }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="搜索 Trace ID..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            {['success', 'failed', 'running'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(statusFilter === status ? null : status)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  background: statusFilter === status ? 
                    (status === 'success' ? 'var(--success)' : status === 'failed' ? 'var(--error)' : 'var(--warning)') 
                    : 'var(--bg-tertiary)',
                  color: statusFilter === status ? 'white' : 'var(--text-secondary)'
                }}
              >
                {status === 'success' ? '成功' : status === 'failed' ? '失败' : '运行中'}
              </button>
            ))}
          </div>
        </div>

        {/* Traces Table */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          <div className="card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>Trace ID</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>状态</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>参与 Agent</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>耗时</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>开始时间</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredTraces.map((trace) => (
                  <tr key={trace.traceId} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                      {trace.traceId.slice(0, 20)}...
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {getStatusBadge(trace.status)}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {trace.agentCount} 个
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {formatDuration(trace.duration)}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      {new Date(trace.startTime).toLocaleString('zh-CN')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Link 
                        href={`/trace/${trace.traceId}`}
                        style={{
                          padding: '4px 12px',
                          background: 'var(--accent)',
                          color: 'white',
                          borderRadius: '4px',
                          fontSize: '12px',
                          textDecoration: 'none'
                        }}
                      >
                        查看详情
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
