/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'casaleggio-rgba': 'rgba(150, 181, 102, 0.9)',
        'casaleggio-btn-rgba': '#FF675B'
      }
    },
  },
  plugins: [],
}

