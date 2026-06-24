/** @type {import('tailwindcss').Config} */
const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        purple: {
          50: '#F3E8FF',
          500: '#8B5CF6',
          600: '#7C3AED',
        },
      },
      keyframes: {
        crumple: {
          '0%': { transform: 'scale(1) rotate(0)', opacity: '1' },
          '25%': { transform: 'scale(0.9) rotate(-3deg)' },
          '50%': { transform: 'scale(0.7) rotate(5deg)' },
          '75%': { transform: 'scale(0.5) rotate(-8deg)' },
          '100%': { transform: 'scale(0) rotate(10deg)', opacity: '0' }
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'crumple': 'crumple 0.5s ease-in forwards',
        'fadeIn': 'fadeIn 150ms ease-out forwards'
      },
      backgroundColor: {
        dark: '#1a1a1a',
      },
      textColor: {
        dark: '#ffffff',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
})
