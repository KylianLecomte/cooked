import * as tokens from "./theme/token.style.ts";

const toPx = (value) => `${value}px`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./api/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: tokens.colors,

      fontFamily: Object.fromEntries(Object.entries(tokens.fontFamily).map(([k, v]) => [k, [v]])),

      fontSize: Object.fromEntries(
        Object.entries(tokens.fontSize).map(([k, v]) => [
          k,
          [toPx(v.fontSize), { lineHeight: toPx(v.lineHeight) }],
        ]),
      ),

      letterSpacing: Object.fromEntries(
        Object.entries(tokens.letterSpacing).map(([k, v]) => [k, toPx(v)]),
      ),

      borderRadius: Object.fromEntries(
        Object.entries(tokens.borderRadius).map(([k, v]) => [k, toPx(v)]),
      ),

      spacing: Object.fromEntries(Object.entries(tokens.spacing).map(([k, v]) => [k, toPx(v)])),
    },
  },
  plugins: [],
};
