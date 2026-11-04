/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '420px',
      },
      colors: {
        academic: {
          navy: '#1e3a8a',
          royal: '#2563eb',
          emerald: '#059669',
          amber: '#d97706',
          slate: '#f8fafc',
        }
      },
      fontFamily: {
        bengali: ["'Hind Siliguri'", "'Kalpurush'", "'Inter'", "sans-serif"],
      }
    },
  },
  plugins: [],
};
