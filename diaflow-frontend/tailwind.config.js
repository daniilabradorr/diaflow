/ /** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#6D28D9',   // azul claro personalizado
          DEFAULT: '#4C1D95', // azul principal (por defecto)
          dark: '#3B0764',    // azul oscuro personalizado
        },
        secondary: '#ffffff', // secundario (ej. blanco puro)
        // ... otros colores como éxito/peligro si los usas
      },
    }
  }
  plugins: [],
};
