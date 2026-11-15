/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bosque: '#18271F',
        'bosque-suave': '#22352B',
        marfil: '#F8F6F1',
        'marfil-2': '#F1EDE4',
        salvia: '#879276',
        'salvia-claro': '#E6E9DF',
        rosa: '#D99A9B',
        'rosa-claro': '#F3E3E3',
        crema: '#E4C98A',
        tinta: '#2A2A26',
        'tinta-suave': '#6B6A60',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
