/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#FF5A5F',
        'brand-secondary': '#00A699',
        'brand-dark': '#484848',
        'brand-light': '#F7F7F7',
      },
    },
  },
  plugins: [],
}