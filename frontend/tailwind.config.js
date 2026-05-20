/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#07090f',
        surface: '#0f1520',
        'surface-2': '#141c2e',
        border: 'rgba(99,179,237,0.12)',
        synapse: '#63b3ed',
        pulse: '#9f7aea',
        healthy: '#48bb78',
        warn: '#ed8936',
        critical: '#fc8181',
        muted: '#4a5568',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'synapse-gradient': 'linear-gradient(135deg, #63b3ed, #9f7aea)',
        'card-gradient': 'linear-gradient(135deg, rgba(99,179,237,0.08), rgba(159,122,234,0.08))',
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        synapse: '0 0 20px rgba(99,179,237,0.15)',
        'synapse-lg': '0 0 40px rgba(99,179,237,0.2)',
        pulse: '0 0 20px rgba(159,122,234,0.3)',
      },
    },
  },
  plugins: [],
};
