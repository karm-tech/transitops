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
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
