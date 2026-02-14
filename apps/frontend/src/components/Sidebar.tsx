'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Activity, GitBranch, Terminal, Settings } from 'lucide-react';

const navItems = [
  { href: '/', label: '仪表盘', icon: LayoutDashboard },
  { href: '/agents', label: '智能体', icon: Activity },
  { href: '/traces', label: '链路追踪', icon: GitBranch },
  { href: '/logs', label: '日志', icon: Terminal },
  { href: '/settings', label: '设置', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside className="sidebar">
      <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 600 }}>Genesis</h1>
      </div>
      <nav style={{ padding: '8px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}