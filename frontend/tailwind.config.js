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
        // Semantic PhishShield Dark Enterprise Palette
        canvas: '#07090e',
        surface: {
          1: '#0d111a',
          2: '#131926',
          3: '#1a2234',
          active: '#232d43',
        },
        border: {
          subtle: '#1e293b',
          muted: '#334155',
          active: '#475569',
        },
        ink: {
          primary: '#f8fafc',
          secondary: '#94a3b8',
          muted: '#64748b',
        },
        accent: {
          cyan: '#06b6d4',
          glow: '#38bdf8',
          safe: '#10b981',
          warn: '#f59e0b',
          danger: '#ef4444',
          ai: '#8b5cf6',
        },
        // Backwards compatibility with previous cyber.* aliases
        cyber: {
          bg: '#07090e',
          surface: '#0d111a',
          card: '#131926',
          border: '#1e293b',
          accent: '#06b6d4',
          glow: '#38bdf8',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'card-glow': '0 0 20px -5px rgba(6, 182, 212, 0.1)',
        'cyan-focus': '0 0 0 2px rgba(6, 182, 212, 0.4)',
      },
    },
  },
  plugins: [],
}
