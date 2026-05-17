/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', '"Times New Roman"', '"Cormorant Garamond"', 'serif'],
        sans: ['Inter', '"Helvetica Neue"', 'system-ui', 'sans-serif'],
      },
      colors: {
        andersen: {
          red: '#A6192E',
          'red-deep': '#7A1220',
          'red-soft': '#C44558',
          ink: '#1A1A1A',
          paper: '#F7F5F2',
        },
      },
    },
  },
  plugins: [],
};
