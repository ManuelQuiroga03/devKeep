/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#090d16',
          card: '#0f172a',
          surface: '#182234',
          border: '#1e293b',
          borderHover: '#334155',
          textMuted: '#94a3b8',
          textMain: '#f8fafc',
        },
        cyanAccent: {
          DEFAULT: '#06b6d4',
          hover: '#0891b2',
          light: '#22d3ee',
          glow: 'rgba(6, 182, 212, 0.15)',
        },
        indigoAccent: {
          DEFAULT: '#6366f1',
          hover: '#4f46e5',
          light: '#818cf8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace']
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
