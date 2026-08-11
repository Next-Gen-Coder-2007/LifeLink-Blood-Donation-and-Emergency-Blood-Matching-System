/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb",
          dark: "#1d4ed8",
          light: "#3b82f6",
          soft: "#eff6ff",
        },
        secondary: {
          DEFAULT: "#0d9488",
          dark: "#0f766e",
          light: "#14b8a6",
          soft: "#f0fdfa",
        },
        accent: "#14b8a6",
        background: "#f8fafc",
        foreground: "#0f172a",
        muted: "#64748b",
        line: "#e2e8f0",
      },
      fontFamily: {
        sans: ["Inter Variable", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(15 23 42 / 0.04), 0 4px 16px -4px rgb(15 23 42 / 0.08)",
        "card-hover": "0 4px 8px -2px rgb(15 23 42 / 0.05), 0 12px 28px -8px rgb(15 23 42 / 0.14)",
      },
      borderRadius: {
        "2.5xl": "1.25rem",
      },
      keyframes: {
        "toast-in": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "toast-out": {
          from: { opacity: "1", transform: "translateY(0)" },
          to: { opacity: "0", transform: "translateY(12px)" },
        },
      },
      animation: {
        "toast-in": "toast-in 0.2s ease-out",
        "toast-out": "toast-out 0.2s ease-in forwards",
      },
    },
  },
  plugins: [],
};
