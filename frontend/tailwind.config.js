/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Esto hace que 'Montserrat' sea la fuente por defecto
        sans: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}