///tailwind.config.js
// tailwind.config.js

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: 'class', // 👈 Habilita modo oscuro por clase
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.css",
    "./styles/**/*.{css,scss}"
  ],
  theme: {
    extend: {}
  },
  plugins: []
};

module.exports = config;
