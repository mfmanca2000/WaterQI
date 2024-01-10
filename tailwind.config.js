/** @type {import('tailwindcss').Config} */


import flowbitePlugin from "flowbite/plugin";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    'node_modules/flowbite-react/lib/esm/**/*.js',
  ],
  theme: {
    extend: {
      colors: {
        'casaleggio-rgba': 'rgba(150, 181, 102, 0.9)',
        'casaleggio-btn-rgba': '#FF675B'
      }
    },
  },
  plugins: [
    flowbitePlugin
  ],
}

