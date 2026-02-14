'use client';

import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Sidebar } from '../../components/Sidebar';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    autoRefresh: true,
    refreshInterval: 2000,
    darkMode: true,
    notifications: true,
    maxLogs: 1000,
    tokenLimit: 10000
  });

  const handleSave = () => {
    // Save settings logic here
    alert('设置已保存');
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
          <h2 style={{ fontSize: '18px', fontWeight: 500 }}>系统设置</h2>
          <button 
            onClick={handleSave}
            style={{
              marginLeft: 'auto',
              padding: '8px 16px',
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Save size={16} />
            保存设置
          </button>
        </header>

        {/* Content */}
        <div style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
          <div style={{ maxWidth: '800px' }}>
            {/* General Settings */}
            <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>常规设置</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '14px', marginBottom: '4px' }}>自动刷新</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>自动更新仪表盘数据</div>
                  </div>
                  <button
                    onClick={() => setSettings(s => ({ ...s, autoRefresh: !s.autoRefresh }))}
                    style={{
                      width: '48px',
                      height: '24px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      background: settings.autoRefresh ? 'var(--accent)' : 'var(--bg-tertiary)',
                      position: 'relative',
                      transition: 'background 0.2s'
                    }}
                  >
                    <span style={{
                      position: 'absolute',
                      top: '2px',
                      left: settings.autoRefresh ? '26px' : '2px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'white',
                      transition: 'left 0.2s'
                    }} />
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '14px', marginBottom: '4px' }}>刷新间隔</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>数据更新频率（毫秒）</div>
                  </div>
                  <input
                    type="number"
                    value={settings.refreshInterval}
                    onChange={(e) => setSettings(s => ({ ...s, refreshInterval: parseInt(e.target.value) }))}
                    style={{
                      width: '120px',
                      padding: '8px 12px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      color: 'var(--text-primary)',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '14px', marginBottom: '4px' }}>通知</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>启用系统通知</div>
                  </div>
                  <button
                    onClick={() => setSettings(s => ({ ...s, notifications: !s.notifications }))}
                    style={{
                      width: '48px',
                      height: '24px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      background: settings.notifications ? 'var(--accent)' : 'var(--bg-tertiary)',
                      position: 'relative'
                    }}
                  >
                    <span style={{
                      position: 'absolute',
                      top: '2px',
                      left: settings.notifications ? '26px' : '2px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'white'
                    }} />
                  </button>
                </div>
              </div>
            </div>

            {/* Limits */}
            <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>限制设置</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '14px', marginBottom: '4px' }}>最大日志数</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>保留的日志记录数量</div>
                  </div>
                  <input
                    type="number"
                    value={settings.maxLogs}
                    onChange={(e) => setSettings(s => ({ ...s, maxLogs: parseInt(e.target.value) }))}
                    style={{
                      width: '120px',
                      padding: '8px 12px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      color: 'var(--text-primary)',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '14px', marginBottom: '4px' }}>Token 限制</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>每个任务的 Token 上限</div>
                  </div>
                  <input
                    type="number"
                    value={settings.tokenLimit}
                    onChange={(e) => setSettings(s => ({ ...s, tokenLimit: parseInt(e.target.value) }))}
                    style={{
                      width: '120px',
                      padding: '8px 12px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      color: 'var(--text-primary)',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* About */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>关于</h3>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                <p style={{ marginBottom: '8px' }}><strong>Project Genesis</strong> v5.0</p>
                <p style={{ marginBottom: '8px' }}>多智能体自动化系统</p>
                <p>© 2026 Genesis Team</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
