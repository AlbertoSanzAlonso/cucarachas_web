/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#0080bb',
        'primary-blue-hv': '#006fa3',
        'accent-green': '#34d399',
        'accent-green-hv': '#10b981',
        'secondary-gray': '#3c3c3b',
        'primary-gray': '#3c3c3b',
        'bg-light': '#f8fafc',
      },
    },
  },
  plugins: [],
}
