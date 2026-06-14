/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{tsx,html}"],
  darkMode: ["class", '[data-theme="dark"]'],
  prefix: "organizer-",
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif"
        ]
      },
      fontSize: {
        sm: ["13px", { lineHeight: "1.25rem" }]
      },
      colors: {
        bg: {
          background: "var(--bg-background)",
          surface: "var(--bg-surface)",
          "surface-hover": "var(--bg-surface-hover)",
          input: "var(--bg-input)"
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)"
        },
        border: {
          default: "var(--border-default)"
        },
        primary: "var(--color-primary)",
        tooltip: {
          bg: "var(--tooltip-bg)",
          text: "var(--tooltip-text)"
        }
      }
    }
  }
}
