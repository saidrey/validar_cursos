/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // activa dark mode por clase CSS (.dark en <html>)
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#137fec',
        'background-light': '#f6f7f8',
        'background-dark': '#101922',
      },
      fontFamily: {
        display: ['Lexend', 'sans-serif']
      },
    },
  },
  plugins: [],
}
