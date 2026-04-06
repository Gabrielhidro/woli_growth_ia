/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        woli: {
          pink: '#E91E63',
          'pink-dark': '#C2185B',
          'pink-light': '#F8BBD9',
          dark: '#1A1A2E',
          'dark-light': '#2D2D44',
          gray: '#6B7280',
          'gray-light': '#F3F4F6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
