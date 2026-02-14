'use client';

import { useState } from 'react';
import { ArrowRight, Terminal } from 'lucide-react';

export const TaskInput = () => {
  const [task, setTask] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim()) return;
    
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      console.log('Submitting task:', task);
      setTask('');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="w-full mx-auto">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-primary)]">
          <Terminal size={18} />
        </div>
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Enter command..."
          className="w-full h-[64px] pl-12 pr-16 bg-[var(--bg-primary)] border-2 border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:shadow-[4px_4px_0px_0px_var(--border)] transition-all duration-200 font-mono text-lg"
          disabled={isSubmitting}
        />
        
        <button
          type="submit"
          disabled={isSubmitting || !task.trim()}
          className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 transition-colors ${
            task.trim() && !isSubmitting 
              ? 'text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]' 
              : 'text-[var(--text-muted)] cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-[var(--text-muted)] border-t-[var(--text-primary)] rounded-full animate-spin" />
          ) : (
            <ArrowRight size={24} />
          )}
        </button>
      </form>
      <div className="mt-2 flex justify-between text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-widest px-1">
        <span>System Ready</span>
        <span>v2.0.4</span>
      </div>
    </div>
  );
};
