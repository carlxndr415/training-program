/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.8)',
      },
    },
  },
  plugins: [],
}