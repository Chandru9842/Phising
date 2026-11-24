/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Stripe / Cloudflare Zero Trust Light Enterprise Palette
        canvas: '#F6F8FA',
        chrome: '#FFFFFF',
        sidebar: '#FFFFFF',
        surface: {
          DEFAULT: '#FFFFFF',
          1: '#FFFFFF',
          2: '#F8FAFC',
          3: '#F1F5F9',
          active: '#F1F5F9',
        },
        hover: '#F8FAFC',
        well: '#FFFFFF',
        border: {
          DEFAULT: '#E2E8F0',
          subtle: '#E2E8F0',
          muted: '#CBD5E1',
          active: '#94A3B8',
        },
        ink: {
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#64748B',
        },
        brand: {
          DEFAULT: '#0F172A',
          hover: '#1E293B',
          subtle: '#F1F5F9',
        },
        verdict: {
          safe: '#065F46',
          safeBg: '#ECFDF5',
          safeBorder: '#A7F3D0',
          warn: '#92400E',
          warnBg: '#FFFBEB',
          warnBorder: '#FDE68A',
          danger: '#991B1B',
          dangerBg: '#FEF2F2',
          dangerBorder: '#FECACA',
        },
        // Backwards compatibility with component classes
        cyber: {
          bg: '#F6F8FA',
          surface: '#FFFFFF',
          card: '#FFFFFF',
          border: '#E2E8F0',
          accent: '#0F172A',
          glow: '#1E293B',
          success: '#065F46',
          warning: '#92400E',
          danger: '#991B1B',
        },
      },
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 2px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 2px 4px rgba(15, 23, 42, 0.06)',
        'focus-ring': '0 0 0 2px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  plugins: [],
}
