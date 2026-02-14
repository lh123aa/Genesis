import React from 'react';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({ 
  children, 
  className = '',
  hoverEffect = false
}) => {
  return (
    <div 
      className={`
        glass-panel rounded-xl p-6 transition-all duration-300
        ${hoverEffect ? 'hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:border-[rgba(0,240,255,0.4)]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
