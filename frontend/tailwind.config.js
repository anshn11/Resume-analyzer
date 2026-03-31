/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6d28d9',
          900: '#4c1d95',
        },
      },
      backgroundImage: {
        'gradient-hero':    'linear-gradient(135deg, #0f172a 0%, #1e1040 40%, #3b0764 100%)',
        'gradient-primary': 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)',
        'gradient-card':    'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(168,85,247,0.04) 100%)',
      },
      boxShadow: {
        'glow':    '0 0 30px rgba(168,85,247,0.35)',
        'glow-lg': '0 0 60px rgba(168,85,247,0.4)',
        'primary': '0 4px 16px rgba(124,58,237,0.25)',
      },
      animation: {
        'fade-in-up':  'fadeInUp 0.6s ease both',
        'fade-in':     'fadeIn 0.5s ease both',
        'float':       'float 4s ease-in-out infinite',
        'spin-slow':   'spin 1.2s linear infinite',
        'pulse-glow':  'pulseGlow 2s ease-in-out infinite',
        'shimmer':     'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeInUp: {
          'from': { opacity: '0', transform: 'translateY(24px)' },
          'to':   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          'from': { opacity: '0' },
          'to':   { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(168,85,247,0.3)' },
          '50%':      { boxShadow: '0 0 40px rgba(168,85,247,0.6)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
