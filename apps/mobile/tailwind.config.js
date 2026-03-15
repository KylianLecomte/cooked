/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "cooked-bg": "#080C10",
        "cooked-bg-light": "#0F172A",
        "cooked-border": "#1E293B",
        "cooked-primary": "#4ADE80",
        "cooked-text": "#F1F5F9",
        "cooked-text-secondary": "#475569",
        "cooked-text-tertiary": "#334155",
      },
    },
  },
  plugins: [],
};
