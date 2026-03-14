/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B35',
        background: '#1A1A2E',
        surface: '#16213E',
        border: '#0F3460',
      }
    },
  },
  plugins: [],
}
