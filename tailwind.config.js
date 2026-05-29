/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f6f8fb",
        panel: "#ffffff",
        line: "#e6edf5",
        ink: "#11243a",
        muted: "#66758a",
        brand: "#3b82f6",
        navy: "#003153",
        success: "#16a34a",
        warn: "#f59e0b",
        danger: "#dc2626"
      },
      fontFamily: {
        sans: ["Inter", "Avenir Next", "SF Pro Display", "sans-serif"]
      }
    }
  },
  plugins: []
};
