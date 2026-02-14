'use client';

import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import { Activity, TrendingUp, TrendingDown } from 'lucide-react';

interface SparklineProps {
  data: { value: number; label?: string }[];
  title?: string;
  value?: string | number;
  change?: number;
  color?: string;
}

export function SparklineChart({ 
  data, 
  title, 
  value, 
  change,
  color = 'var(--text-accent)'
}: SparklineProps) {
  const isPositive = change && change >= 0;

  return (
    <div className="glass-card p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          {title && (
            <h4 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">
              {title}
            </h4>
          )}
          {value !== undefined && (
            <div className="text-2xl font-bold text-[var(--text-primary)] font-mono">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
          )}
        </div>
        
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            isPositive ? 'text-[var(--status-running)]' : 'text-[var(--status-error)]'
          }`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{Math.abs(change).toFixed(1)}%</span>
          </div>
        )}
      </div>

      <div className="h-16">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <defs>
              <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis domain={['dataMin', 'dataMax']} hide />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                fontSize: '12px',
              }}
              itemStyle={{ color: 'var(--text-primary)' }}
              formatter={(value: number) => [value.toLocaleString(), '数值']}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              fillOpacity={1}
              fill="url(#sparklineGradient)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Circular Gauge for SOP Health
interface CircularGaugeProps {
  value: number; // 0-100
  max?: number;
  title?: string;
  subtitle?: string;
  size?: number;
}

export function CircularGauge({ 
  value, 
  max = 100, 
  title, 
  subtitle,
  size = 120 
}: CircularGaugeProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - 8) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 80) return 'var(--status-running)';
    if (percentage >= 50) return 'var(--status-warning)';
    return 'var(--status-error)';
  };

  return (
    <div className="glass-card p-4 flex flex-col items-center">
      {title && (
        <h4 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">
          {title}
        </h4>
      )}
      
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border-subtle)"
            strokeWidth={6}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-[var(--text-primary)] font-mono">
            {Math.round(percentage)}%
          </span>
          {subtitle && (
            <span className="text-xs text-[var(--text-muted)]">{subtitle}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// Agent Activity Heatmap
interface HeatmapProps {
  data: { day: string; hour: number; value: number }[];
}

export function ActivityHeatmap({ data }: HeatmapProps) {
  const getColor = (value: number) => {
    if (value === 0) return 'var(--bg-tertiary)';
    if (value <= 3) return 'rgba(34, 211, 238, 0.2)';
    if (value <= 6) return 'rgba(34, 211, 238, 0.4)';
    if (value <= 9) return 'rgba(34, 211, 238, 0.6)';
    return 'rgba(34, 211, 238, 0.8)';
  };

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Activity size={16} className="text-[var(--text-accent)]" />
        <h4 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
          智能体活跃度
        </h4>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day) => (
          <div key={day} className="text-center">
            <div className="text-[10px] text-[var(--text-muted)] mb-1">{day}</div>
            <div className="space-y-1">
              {[0, 1, 2, 3].map((period) => {
                const value = Math.floor(Math.random() * 12);
                return (
                  <div
                    key={period}
                    className="w-6 h-6 rounded-sm cursor-pointer hover:ring-1 hover:ring-[var(--text-accent)] transition-all"
                    style={{ backgroundColor: getColor(value) }}
                    title={`${value} 次活动`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex items-center justify-end gap-2 mt-3 text-[10px] text-[var(--text-muted)]">
        <span>少</span>
        <div className="flex gap-0.5">
          {[0.2, 0.4, 0.6, 0.8].map((opacity) => (
            <div
              key={opacity}
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: `rgba(34, 211, 238, ${opacity})` }}
            />
          ))}
        </div>
        <span>多</span>
      </div>
    </div>
  );
}
