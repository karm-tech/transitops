/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf6ec',
          100: '#f9e6cc',
          200: '#f2cc98',
          300: '#eaad63',
          400: '#e3923b',
          500: '#d97a2b',
          600: '#c26322',
          700: '#a04d1f',
          800: '#7f3e20',
          900: '#66341d',
          950: '#431407',
        },
      },
      fontFamily: {
        sans: ['Hanken Grotesk', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out both',
      },
    },
  },
  plugins: [],
}
