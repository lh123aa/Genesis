const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export const fetcher = (url: string) => 
  fetch(`${API_BASE}${url}`).then(r => r.json());
