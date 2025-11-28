/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#4649CF',
        secondary: '#6E71DA',
        accent: '#2E31B4',
        'light-bg': '#F2F2F8',
        'light-surface': '#FFFFFF',
        'dark-bg': '#0F103A',
        'dark-surface': '#1A1B62',
        'neon-red': '#FF3333',
        'neon-yellow': '#FFFF00',
        'neon-blue': '#4649CF',
      },
      boxShadow: {
        'neon-blue': '0 0 10px rgba(70, 73, 207, 0.5)',
        'neon-red': '0 0 10px rgba(255, 51, 51, 0.5)',
        'neon-yellow': '0 0 10px rgba(255, 255, 0, 0.5)',
      }
    },
  },
  plugins: [],
}