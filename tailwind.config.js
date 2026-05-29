/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // CSS-variable driven so we can swap themes by setting data-theme on <html>
        canvas: "var(--c-canvas)",
        panel: "var(--c-panel)",
        line: "var(--c-line)",
        ink: "var(--c-ink)",
        muted: "var(--c-muted)",
        brand: "var(--c-brand)",
        accent: "var(--c-accent)",
        success: "var(--c-success)",
        warn: "var(--c-warn)",
        danger: "var(--c-danger)",
        // Backwards-compat alias used in older copy
        navy: "var(--c-brand)"
      },
      fontFamily: {
        display: "var(--f-display)",
        sans: "var(--f-body)",
        mono: "var(--f-mono)"
      },
      borderRadius: {
        DEFAULT: "var(--r-md)",
        none: "0",
        sm: "var(--r-sm)",
        md: "var(--r-md)",
        lg: "var(--r-lg)",
        xl: "var(--r-xl)",
        "2xl": "var(--r-2xl)",
        full: "var(--r-full)"
      }
    }
  },
  plugins: []
};
