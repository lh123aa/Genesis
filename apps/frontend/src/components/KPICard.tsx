'use client';

import { useEffect, useState, useRef } from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  change?: number;
  icon: LucideIcon;
  color: 'accent' | 'success' | 'warning' | 'error' | 'secondary';
  suffix?: string;
  delay?: number;
}

const colorMap = {
  accent: {
    bg: 'bg-[var(--text-accent)]/10',
    border: 'border-[var(--text-accent)]/20',
    text: 'text-[var(--text-accent)]',
    glow: 'shadow-[0_0_20px_rgba(34,211,238,0.15)]',
    gradient: 'from-[var(--text-accent)] to-[var(--text-accent-secondary)]'
  },
  success: {
    bg: 'bg-[var(--status-running)]/10',
    border: 'border-[var(--status-running)]/20',
    text: 'text-[var(--status-running)]',
    glow: 'shadow-[0_0_20px_rgba(34,197,94,0.15)]',
    gradient: 'from-[var(--status-running)] to-[#10b981]'
  },
  warning: {
    bg: 'bg-[var(--status-warning)]/10',
    border: 'border-[var(--status-warning)]/20',
    text: 'text-[var(--status-warning)]',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    gradient: 'from-[var(--status-warning)] to-[#fbbf24]'
  },
  error: {
    bg: 'bg-[var(--status-error)]/10',
    border: 'border-[var(--status-error)]/20',
    text: 'text-[var(--status-error)]',
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]',
    gradient: 'from-[var(--status-error)] to-[#dc2626]'
  },
  secondary: {
    bg: 'bg-[var(--text-accent-secondary)]/10',
    border: 'border-[var(--text-accent-secondary)]/20',
    text: 'text-[var(--text-accent-secondary)]',
    glow: 'shadow-[0_0_20px_rgba(129,140,248,0.15)]',
    gradient: 'from-[var(--text-accent-secondary)] to-[#a5b4fc]'
  }
};

function AnimatedNumber({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const startValue = useRef(0);

  useEffect(() => {
    startTime.current = null;
    startValue.current = displayValue;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      
      // Easing function: easeOutExpo
      const easeOutExpo = 1 - Math.pow(2, -10 * progress);
      
      const currentValue = Math.floor(startValue.current + (value - startValue.current) * easeOutExpo);
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{displayValue.toLocaleString()}</span>;
}

export function KPICard({ 
  title, 
  value, 
  subtitle, 
  change, 
  icon: Icon, 
  color,
  suffix = '',
  delay = 0 
}: KPICardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const colors = colorMap[color];
  const numericValue = typeof value === 'number' ? value : 0;
  const isNumeric = typeof value === 'number';

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`
        relative overflow-hidden rounded-xl p-5 
        bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-secondary)]
        border border-[var(--border-subtle)]
        transition-all duration-500 ease-out
        hover:border-[var(--border-prominent)]
        hover:shadow-lg hover:-translate-y-1
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Background Glow Effect */}
      <div className={`
        absolute -top-10 -right-10 w-32 h-32 
        rounded-full blur-3xl opacity-30
        bg-gradient-to-br ${colors.gradient}
        transition-opacity duration-500
        group-hover:opacity-50
      `} />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className={`
            p-2.5 rounded-xl
            ${colors.bg} ${colors.border} border
            transition-transform duration-300
            hover:scale-110
          `}>
            <Icon className={`w-5 h-5 ${colors.text}`} />
          </div>
          
          {change !== undefined && (
            <div className={`
              flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
              ${change >= 0 
                ? 'bg-[var(--status-running)]/10 text-[var(--status-running)]' 
                : 'bg-[var(--status-error)]/10 text-[var(--status-error)]'
              }
            `}>
              <span>{change >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(change).toFixed(1)}%</span>
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-1">
          <span className="text-3xl font-bold tracking-tight kpi-value">
            {isNumeric ? <AnimatedNumber value={numericValue} /> : value}
            {suffix && <span className="text-xl ml-1">{suffix}</span>}
          </span>
        </div>

        {/* Title */}
        <p className="text-sm text-[var(--text-secondary)] font-medium mb-1">
          {title}
        </p>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-xs text-[var(--text-muted)]">
            {subtitle}
          </p>
        )}
      </div>

      {/* Bottom Accent Line */}
      <div className={`
        absolute bottom-0 left-0 right-0 h-0.5
        bg-gradient-to-r ${colors.gradient}
        opacity-50
      `} />
    </div>
  );
}
