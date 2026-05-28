/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      // Escala tipográfica ~+15% sobre el default de Tailwind (la base estaba muy chica)
      fontSize: {
        xs: ['0.8125rem', { lineHeight: '1.15rem' }],   // 13px (antes 12)
        sm: ['0.9375rem', { lineHeight: '1.4rem' }],     // 15px (antes 14)
        base: ['1.0625rem', { lineHeight: '1.65rem' }],  // 17px (antes 16)
        lg: ['1.1875rem', { lineHeight: '1.85rem' }],    // 19px (antes 18)
        xl: ['1.375rem', { lineHeight: '1.9rem' }],      // 22px (antes 20)
        '2xl': ['1.625rem', { lineHeight: '2.1rem' }],   // 26px (antes 24)
        '3xl': ['2.0625rem', { lineHeight: '2.4rem' }],  // 33px (antes 30)
        '4xl': ['2.5rem', { lineHeight: '2.7rem' }],     // 40px (antes 36)
        '5xl': ['3.25rem', { lineHeight: '1' }],         // 52px (antes 48)
      },
      fontFamily: {
        serif: ['Georgia', '"Times New Roman"', '"Cormorant Garamond"', 'serif'],
        sans: ['Inter', '"Helvetica Neue"', 'system-ui', 'sans-serif'],
      },
      colors: {
        andersen: {
          red: '#A6192E',
          'red-deep': '#7A1220',
          ink: '#1A1A1A',
          paper: '#F7F5F2',
        },
      },
    },
  },
  plugins: [],
};
