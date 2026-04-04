/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        sage: {
          50: '#f4f7f4',
          100: '#e6ede6',
          200: '#cddcce',
          300: '#a8c2aa',
          400: '#7da182',
          500: '#5a8260',
          600: '#476850',
          700: '#3a5341',
          800: '#304437',
          900: '#28392e',
        },
        blush: {
          50: '#fdf4f0',
          100: '#fae6dd',
          200: '#f5ccbb',
          300: '#eeaa90',
          400: '#e67e5c',
          500: '#dd5f3a',
          600: '#cf482b',
          700: '#ac3924',
          800: '#8a3023',
          900: '#712c22',
        },
        lavender: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pulseSoft: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.6 } },
      },
    },
  },
  plugins: [],
};
