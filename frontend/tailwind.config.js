/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
          DEFAULT: "#dc2626",
          dark: "#b91c1c",
          light: "#ef4444",
          soft: "#fef2f2",
        },
        secondary: {
          DEFAULT: "#0f172a",
          dark: "#020617",
          light: "#334155",
          soft: "#f8fafc",
        },
        accent: "#dc2626",
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
