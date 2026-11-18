/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#ecfdf8',
          100: '#d1faee',
          200: '#a6f3dd',
          300: '#6be6c8',
          400: '#2fd1ad',
          500: '#12b594',
          600: '#0a9279',
          700: '#0b7563',
          800: '#0e5d50',
          900: '#0f4d43',
        },
        urgent: {
          400: '#ff8a5b',
          500: '#ff6a33',
          600: '#f04e14',
        },
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(15, 77, 67, 0.25)',
        glow: '0 0 0 6px rgba(18, 181, 148, 0.15)',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-24px) translateX(12px)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.6)', opacity: '0.8' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        float: 'float 9s ease-in-out infinite',
        pulseRing: 'pulseRing 2s ease-out infinite',
      },
    },
  },
  plugins: [],
}
