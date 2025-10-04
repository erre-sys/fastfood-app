/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#002147", // Oxford Blue
          50: "#e6ecf2",
          100: "#cfd9e6",
          200: "#9fb3cd",
          300: "#6f8db4",
          400: "#40679b",
          500: "#1b4579",
          600: "#0f335e",
          700: "#0a2646",
          800: "#071b32",
          900: "#041221",
        },
        tan: {
          DEFAULT: "#d2b48c",
        },
        danger: {
          DEFAULT: "#e11d48", // rojo para delete
        },
      },
      spacing: {
        'sidebar': '280px',
        'sidebar-collapsed': '80px',
        'header': '64px',
      },
      boxShadow: {
        header: '0 1px 0 rgba(0,0,0,.06)',
      },
      borderRadius: {
        xl2: '1rem',
      },
    },
  },
  safelist: [
    // routerLinkActive
    'is-active'
  ],
  plugins: [require('@tailwindcss/forms')],
}
