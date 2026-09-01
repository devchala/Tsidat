/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Palette from the product spec (section 11)
        primary: '#16A34A',
        primaryDark: '#166534',
        bg: '#F7FAF8',
        text: '#17201A',
        warning: '#F59E0B',
        danger: '#DC2626',
      },
      borderRadius: {
        DEFAULT: '14px',
      },
    },
  },
  plugins: [],
};
