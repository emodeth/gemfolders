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
          popover: "var(--bg-popover)",
          surface: "var(--bg-surface)",
          "surface-hover": "var(--bg-surface-hover)",
          card: "var(--bg-card)",
          input: "var(--bg-input)",
          "input-focus": "var(--bg-input-focus)",
          "button-surface": "var(--bg-button-surface)",
          "switch-off": "var(--bg-switch-off)"
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          placeholder: "var(--text-placeholder)"
        },
        border: {
          default: "var(--border-default)"
        },
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)"
        },
        tooltip: {
          bg: "var(--tooltip-bg)",
          text: "var(--tooltip-text)"
        }
      }
    }
  }
}
