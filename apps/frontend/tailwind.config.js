/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        retro: {
          bg: 'var(--bg-primary)',
          card: 'var(--bg-secondary)',
          border: 'var(--border)',
          text: 'var(--text-primary)',
          muted: 'var(--text-muted)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        pixel: ['"Press Start 2P"', 'cursive'],
      }
    },
  },
  plugins: [],
}
