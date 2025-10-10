// tailwind.config.js
module.exports = {
  darkMode: ["class", '[data-theme="dark"]'], // soporta .dark o data-theme
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-2": "rgb(var(--surface-2) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",

        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
          foreground: "rgb(var(--secondary-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          foreground: "rgb(var(--accent-foreground) / <alpha-value>)",
        },
        success: { DEFAULT: "rgb(var(--success) / <alpha-value>)" },
        warning: { DEFAULT: "rgb(var(--accent) / <alpha-value>)" }, // tu naranja como warning
        danger: { DEFAULT: "rgb(var(--danger) / <alpha-value>)" },
        info: { DEFAULT: "rgb(var(--info) / <alpha-value>)" },
        muted: { DEFAULT: "rgb(var(--muted) / <alpha-value>)" },
      },
      borderRadius: {
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 4px)",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        lift: "var(--shadow-lift)",
      },
      spacing: {
        header: "var(--header-h)",
        sidebar: "var(--sidebar-w)",
        "sidebar-collapsed": "var(--sidebar-w-collapsed)",
      },
      zIndex: {
        header: "var(--z-header)",
        overlay: "var(--z-overlay)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
  safelist: ["is-active"],
};
