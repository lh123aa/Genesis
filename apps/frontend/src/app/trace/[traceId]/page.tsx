'use client';

import useSWR from 'swr';
import { fetcher } from '../../../lib/api';
import { ArrowLeft, CheckCircle, XCircle, Loader } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Sidebar } from '../../../components/Sidebar';

interface TraceStep {
  id: string;
  agent: string;
  action: string;
  status: 'completed' | 'failed' | 'running';
  duration: number;
  timestamp: string;
}

interface TraceDetail {
  traceId: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'success' | 'failed';
  steps: TraceStep[];
  logs: Array<{
    timestamp: string;
    level: string;
    message: string;
  }>;
}

export default function TraceDetailPage() {
  const params = useParams();
  const traceId = params.traceId as string;
  
  const { data: trace } = useSWR<TraceDetail>(`/api/trace/${traceId}`, fetcher);

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} style={{ color: 'var(--success)' }} />;
      case 'failed': return <XCircle size={16} style={{ color: 'var(--error)' }} />;
      case 'running': return <Loader size={16} style={{ color: 'var(--warning)' }} className="animate-spin" />;
      default: return null;
    }
  };

  if (!trace) {
    return (
      <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-primary)', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)' }}>加载中...</div>
      </div>
    );
  }

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
          <Link href="/traces" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 500 }}>链路详情</h2>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              {trace.traceId}
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            {trace.status === 'success' ? (
              <span className="badge badge-success">执行成功</span>
            ) : (
              <span className="badge badge-error">执行失败</span>
            )}
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
          {/* Summary */}
          <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>执行概览</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>总耗时</div>
                <div style={{ fontSize: '24px', fontWeight: 600 }}>{formatDuration(trace.duration)}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>执行步骤</div>
                <div style={{ fontSize: '24px', fontWeight: 600 }}>{trace.steps.length}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>开始时间</div>
                <div style={{ fontSize: '14px' }}>{new Date(trace.startTime).toLocaleString('zh-CN')}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>结束时间</div>
                <div style={{ fontSize: '14px' }}>{new Date(trace.endTime).toLocaleString('zh-CN')}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Steps Timeline */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>执行步骤</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {trace.steps.map((step, index) => (
                  <div key={step.id} style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        background: step.status === 'completed' ? 'var(--success)' : step.status === 'failed' ? 'var(--error)' : 'var(--warning)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}>
                        {index + 1}
                      </div>
                      {index < trace.steps.length - 1 && (
                        <div style={{ width: '2px', flex: 1, background: 'var(--border)', margin: '8px 0' }} />
                      )}
                    </div>
                    <div style={{ flex: 1, paddingBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 500 }}>{step.agent}</span>
                        {getStatusIcon(step.status)}
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        {step.action}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        耗时: {formatDuration(step.duration)} · {new Date(step.timestamp).toLocaleTimeString('zh-CN')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Logs */}
            <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>相关日志</h3>
              <div style={{ 
                flex: 1, 
                overflow: 'auto', 
                background: 'var(--bg-primary)', 
                padding: '16px', 
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '12px'
              }}>
                {trace.logs?.map((log, idx) => (
                  <div key={idx} style={{ marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{new Date(log.timestamp).toLocaleTimeString('zh-CN')}</span>
                    {' '}
                    <span style={{ 
                      color: log.level === 'ERROR' ? 'var(--error)' : 
                             log.level === 'WARN' ? 'var(--warning)' : 'var(--accent)'
                    }}>
                      [{log.level}]
                    </span>
                    {' '}
                    <span style={{ color: 'var(--text-secondary)' }}>{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
