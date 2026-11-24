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
        // Linear/Stripe Matte Slate Surface System
        canvas: '#0B0E14',
        chrome: '#0E121A',
        surface: {
          DEFAULT: '#12161F',
          1: '#12161F',
          2: '#171C28',
          3: '#1F2637',
          active: '#1F2637',
        },
        hover: '#171C28',
        well: '#0D1017',
        border: {
          DEFAULT: '#1E2430',
          subtle: '#1E2430',
          muted: '#2B3445',
          active: '#3B475D',
        },
        ink: {
          primary: '#F3F4F6',
          secondary: '#9CA3AF',
          muted: '#6B7280',
        },
        brand: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          subtle: 'rgba(37, 99, 235, 0.1)',
        },
        verdict: {
          safe: '#34D399',
          warn: '#FBBF24',
          danger: '#F87171',
        },
        // Backward-compatible aliases mapped to the Matte Slate System
        cyber: {
          bg: '#0B0E14',
          surface: '#0E121A',
          card: '#12161F',
          border: '#1E2430',
          accent: '#2563EB',
          glow: '#3B82F6',
          success: '#34D399',
          warning: '#FBBF24',
          danger: '#F87171',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'focus-ring': '0 0 0 2px rgba(37, 99, 235, 0.35)',
      },
    },
  },
  plugins: [],
}
