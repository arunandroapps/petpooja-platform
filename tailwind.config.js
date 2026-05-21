/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html','./src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {
    colors: {
      brand: { 50:'#fff7ed',100:'#ffedd5',200:'#fed7aa',300:'#fdba74',400:'#fb923c',500:'#f97316',600:'#ea580c',700:'#c2410c',800:'#9a3412',900:'#7c2d12' },
      sa: { 500:'#8b5cf6',600:'#7c3aed',700:'#6d28d9' },   // superadmin purple
      dist: { 500:'#0ea5e9',600:'#0284c7',700:'#0369a1' },  // distributor blue
      own: { 500:'#10b981',600:'#059669',700:'#047857' },   // owner green
    }
  }},
  plugins: [],
};
