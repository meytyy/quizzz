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
        correct: '#10B981',
        incorrect: '#EF4444',
      },
    },
  },
  plugins: [],
}




