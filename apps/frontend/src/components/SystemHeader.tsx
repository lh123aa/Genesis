import React, { useState, useEffect } from 'react';
import { HexLogo } from './ui/HexLogo';
import { Moon, Sun } from 'lucide-react';

export const SystemHeader: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      // Default to light for Retro-Premium Notion-like feel
      setTheme('light');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <header className="w-full h-[64px] flex items-center justify-between px-6 border-b-2 border-[var(--border)] bg-[var(--bg-primary)] sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="border-2 border-[var(--text-primary)] p-1">
          <HexLogo size={20} className="text-[var(--text-primary)]" />
        </div>
        <h1 className="text-lg font-bold tracking-tighter uppercase font-mono">Genesis</h1>
      </div>
      
      <button 
        onClick={toggleTheme}
        className="p-2 border-2 border-transparent hover:border-[var(--border)] hover:shadow-[2px_2px_0px_0px_var(--border)] transition-all text-[var(--text-primary)]"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </header>
  );
};
