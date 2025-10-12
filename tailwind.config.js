// tailwind.config.js
module.exports = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        // fondos / texto
        bg:         "rgb(var(--bg-rgb) / <alpha-value>)",
        surface:    "rgb(var(--surface-rgb) / <alpha-value>)",
        "surface-2":"rgb(var(--surface2-rgb) / <alpha-value>)",
        "surface-3":"rgb(var(--surface3-rgb) / <alpha-value>)",
        line:       "rgb(var(--line-rgb) / <alpha-value>)",
        foreground: "rgb(var(--fg-rgb) / <alpha-value>)",

        // marca
        brand:      "rgb(var(--brand-rgb) / <alpha-value>)",
        accent:     "rgb(var(--accent-rgb) / <alpha-value>)",

        // intents (semánticos)
        primary: {
          DEFAULT:    "rgb(var(--primary-rgb) / <alpha-value>)",
          foreground: "rgb(var(--brand-ctr-rgb) / <alpha-value>)",
        },
        secondary: {
          DEFAULT:    "rgb(var(--secondary-rgb) / <alpha-value>)",
          foreground: "rgb(var(--brand-ctr-rgb) / <alpha-value>)",
        },
        accentPair: { // <- opcional si quieres par ‘accent/foreground’
          DEFAULT:    "rgb(var(--accent-rgb) / <alpha-value>)",
          foreground: "rgb(var(--brand-ctr-rgb) / <alpha-value>)",
        },

        success:  "rgb(var(--success-rgb)  / <alpha-value>)",
        warning:  "rgb(var(--warning-rgb)  / <alpha-value>)",
        danger:   "rgb(var(--danger-rgb)   / <alpha-value>)",
        info:     "rgb(var(--info-rgb)     / <alpha-value>)",
        muted:    "rgb(var(--muted-rgb)    / <alpha-value>)",
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
  safelist: ["is-active","is-open","is-collapsed"],
};
