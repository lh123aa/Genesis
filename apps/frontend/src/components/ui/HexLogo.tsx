import React from 'react';

interface HexLogoProps {
  size?: number;
  className?: string;
}

export const HexLogo: React.FC<HexLogoProps> = ({ size = 24, className = '' }) => {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l8.66 5v10L12 22l-8.66-5V7L12 2z" />
        <path d="M12 8v8" />
        <path d="M8 10l8 4" />
        <path d="M8 14l8-4" />
      </svg>
    </div>
  );
};
