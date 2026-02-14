'use client';

import useSWR from 'swr';
import { Sidebar } from '../../components/Sidebar';
import { SystemStatusBar } from '../../components/SystemStatusBar';
import { LogStream } from '../../components/LogStream';
import { SparklineChart, CircularGauge } from '../../components/Charts';
import { ShieldCheck, AlertTriangle, Activity, Database, DollarSign, Search, Filter } from 'lucide-react';
import { useState, useMemo } from 'react';
import { SystemStatus } from '../../types/agent';
import { fetcher } from '../../lib/api';

const BACKEND_URL = 'http://localhost:3002';

export default function PanopticonDashboard() {
  const { data: logs } = useSWR(`${BACKEND_URL}/api/panopticon/logs`, fetcher, { refreshInterval: 2000 });
  const { data: sopHealth } = useSWR(`${BACKEND_URL}/api/panopticon/sop-health`, fetcher, { refreshInterval: 5000 });
  const { data: costs } = useSWR(`${BACKEND_URL}/api/panopticon/costs`, fetcher, { refreshInterval: 5000 });
  const { data: status } = useSWR<SystemStatus>(`${BACKEND_URL}/api/status`, fetcher, { refreshInterval: 5000 });

  const [traceFilter, setTraceFilter] = useState('');
  const [sopFilter, setSopFilter] = useState<'all' | 'healthy' | 'stale'>('all');

  // Calculate SOP stats
  const sopStats = useMemo(() => {
    const entries = Object.entries(sopHealth || {});
    const total = entries.length;
    const healthy = entries.filter(([_, stats]: [string, unknown]) => {
      const s = stats as { failures: number; executions: number };
      const failRate = s.failures / s.executions;
      return !(failRate > 0.2 && s.executions >= 5);
    }).length;
    return { total, healthy, percentage: total > 0 ? (healthy / total) * 100 : 100 };
  }, [sopHealth]);

  // Filtered SOPs
  const filteredSOPs = useMemo(() => {
    const entries = Object.entries(sopHealth || {});
    return entries.filter(([_, stats]: [string, unknown]) => {
      const s = stats as { failures: number; executions: number };
      const failRate = s.failures / s.executions;
      const isStale = failRate > 0.2 && s.executions >= 5;
      
      if (sopFilter === 'healthy') return !isStale;
      if (sopFilter === 'stale') return isStale;
      return true;
    });
  }, [sopHealth, sopFilter]);

  // Calculate total cost
  const totalCost = useMemo(() => {
    return Object.values(costs || {}).reduce((sum: number, cost: unknown) => {
      const c = cost as { tokens?: number };
      return sum + (c.tokens || 0);
    }, 0) as number;
  }, [costs]);

  // Mock cost trend
  const costTrendData = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      value: Math.floor(Math.random() * 300) + 100,
      label: `${i}:00`
    }));
  }, []);

  const activeAgents = status?.agents.filter(a => a.status === 'running').length || 0;
  const errorAgents = status?.agents.filter(a => a.status === 'error').length || 0;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64">
        <SystemStatusBar 
          status={status?.system || { status: 'healthy', uptime: 0, timestamp: '' }}
          agentCount={{ active: activeAgents, total: status?.agents.length || 0 }}
          alerts={errorAgents}
          totalCost={totalCost}
        />

        <div className="p-6 bg-grid">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Panopticon 监控中心</h1>
            <p className="text-sm text-[var(--text-muted)]">
              实时可观测性、成本追踪与系统健康监控
            </p>
          </div>

          <div className="grid grid-cols-12 gap-6">
            
            {/* Left Column - System Health & Costs (3 cols) */}
            <div className="col-span-12 lg:col-span-3 space-y-4">
              {/* System Health */}
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-4 h-4 text-[var(--text-accent)]" />
                  <h2 className="text-sm font-semibold text-[var(--text-primary)]">系统状态</h2>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
                    <span className="text-sm text-[var(--text-muted)]">状态</span>
                    <span className={`px-2 py-1 text-xs font-mono uppercase rounded ${
                      status?.system?.status === 'healthy'
                        ? 'bg-[var(--status-healthy)]/10 text-[var(--status-healthy)]'
                        : 'bg-[var(--status-error)]/10 text-[var(--status-error)]'
                    }`}>
                      {status?.system?.status === 'healthy' ? '健康' : status?.system?.status || '未知'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
                    <span className="text-sm text-[var(--text-muted)]">运行时长</span>
                    <span className="text-sm font-mono text-[var(--text-primary)]">
                      {Math.floor(status?.system?.uptime || 0)}秒
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[var(--bg-secondary)] rounded-lg">
                    <span className="text-sm text-[var(--text-muted)]">活跃智能体</span>
                    <span className="text-sm font-mono text-[var(--text-primary)]">
                      {activeAgents}/{status?.agents.length || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cost Analysis */}
              <SparklineChart
                data={costTrendData}
                title="24小时 Token 消耗"
                value={totalCost.toLocaleString()}
                change={-5.2}
                color="var(--chart-tertiary)"
              />

              {/* Cost Breakdown */}
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-4 h-4 text-[var(--chart-tertiary)]" />
                  <h2 className="text-sm font-semibold text-[var(--text-primary)]">智能体成本</h2>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {costs && Object.entries(costs).length > 0 ? (
                    Object.entries(costs).map(([traceId, cost]: [string, unknown]) => {
                      const c = cost as { tokens: number; limit: number };
                      const percent = (c.tokens / c.limit) * 100;
                      const isOver = percent > 100;

                      return (
                        <div key={traceId} className="p-2 bg-[var(--bg-secondary)] rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-mono text-[var(--text-muted)] truncate max-w-[100px]">
                              {traceId.slice(0, 8)}...
                            </span>
                            <span className={`text-xs font-mono ${isOver ? 'text-[var(--status-error)]' : 'text-[var(--text-primary)]'}`}>
                              {Math.round(percent)}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${isOver ? 'bg-[var(--status-error)]' : 'bg-[var(--chart-tertiary)]'}`}
                              style={{ width: `${Math.min(percent, 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between mt-1 text-[10px] text-[var(--text-muted)]">
                            <span>{c.tokens.toLocaleString()} tokens</span>
                            <span>限额: {c.limit.toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-sm text-[var(--text-muted)]">
                      暂无活跃任务
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Middle Column - SOP Health (5 cols) */}
            <div className="col-span-12 lg:col-span-5 space-y-4">
              {/* SOP Health Gauge */}
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">SOP 健康度</h2>

                {/* Filter */}
                <div className="flex items-center gap-1 bg-[var(--bg-secondary)] rounded-lg p-1">
                  {(['all', 'healthy', 'stale'] as const).map((f) => {
                    const labels: Record<string, string> = { all: '全部', healthy: '正常', stale: '陈旧' };
                    return (
                      <button
                        key={f}
                        onClick={() => setSopFilter(f)}
                        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                          sopFilter === f
                            ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)]'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                        }`}
                      >
                        {labels[f]}
                      </button>
                    );
                  })}
                </div>
              </div>

              <CircularGauge
                value={sopStats.healthy}
                max={sopStats.total || 1}
                title="SOP 健康率"
                subtitle={`${sopStats.healthy}/${sopStats.total} 正常`}
                size={180}
              />

              {/* SOP List */}
              <div className="glass-card">
                <div className="p-4 border-b border-[var(--border-subtle)]">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    SOP 注册表 ({filteredSOPs.length})
                  </h3>
                </div>

                <div className="max-h-80 overflow-y-auto custom-scrollbar p-2 space-y-2">
                  {filteredSOPs.length > 0 ? (
                    filteredSOPs.map(([sopId, stats]: [string, unknown]) => {
                      const s = stats as { failures: number; executions: number };
                      const failRate = s.failures / s.executions;
                      const isStale = failRate > 0.2 && s.executions >= 5;

                      return (
                        <div
                          key={sopId}
                          className={`p-3 rounded-lg border transition-all ${
                            isStale
                              ? 'bg-[var(--status-error)]/5 border-[var(--status-error)]/20'
                              : 'bg-[var(--bg-secondary)] border-[var(--border-subtle)]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-sm font-medium text-[var(--text-primary)]">
                              {sopId}
                            </span>
                            <span className={`px-2 py-0.5 text-[10px] font-mono uppercase rounded ${
                              isStale
                                ? 'bg-[var(--status-error)]/10 text-[var(--status-error)]'
                                : 'bg-[var(--status-healthy)]/10 text-[var(--status-healthy)]'
                            }`}>
                              {isStale ? '陈旧' : '健康'}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <span className="text-[var(--text-muted)]">执行次数</span>
                              <p className="font-mono text-[var(--text-primary)]">{s.executions}</p>
                            </div>
                            <div>
                              <span className="text-[var(--text-muted)]">失败次数</span>
                              <p className={`font-mono ${s.failures > 0 ? 'text-[var(--status-error)]' : 'text-[var(--text-primary)]'}`}>
                                {s.failures}
                              </p>
                            </div>
                            <div>
                              <span className="text-[var(--text-muted)]">失败率</span>
                              <p className={`font-mono ${failRate > 0.2 ? 'text-[var(--status-error)]' : 'text-[var(--text-primary)]'}`}>
                                {(failRate * 100).toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-[var(--text-muted)]">
                      <ShieldCheck size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">未注册 SOP</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Logs (4 cols) */}
            <div className="col-span-12 lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">链路日志</h2>

                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    placeholder="按链路 ID 筛选..."
                    value={traceFilter}
                    onChange={(e) => setTraceFilter(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--text-accent)] w-40"
                  />
                </div>
              </div>

              <LogStream 
                logs={(logs || []).filter((log: any) => 
                  !traceFilter || (log.traceId && log.traceId.includes(traceFilter))
                )} 
                maxHeight="700px" 
              />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
