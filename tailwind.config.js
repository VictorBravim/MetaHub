/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        'neomorph': '9px 9px 18px #d1d9e6, -9px -9px 18px #ffffff',
        'neomorph-inner': 'inset 8px 8px 16px #d1d9e6, inset -8px -8px 16px #ffffff',
      },
      colors: {
        'blue-400': '#60a5fa',
        'blue-500': '#3b82f6',
        'blue-600': '#2563eb',
      }
    },
  },
  plugins: [],
}