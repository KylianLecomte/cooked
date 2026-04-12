import { colors, palette } from "./theme/colors.style.ts";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./api/**/*.{js,jsx,ts,tsx}",
    "./theme/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "ckd-bg": palette.bg,

        "ckd-surface-1": palette.s1,
        "ckd-surface-2": palette.s2,

        "ckd-border-1": palette.b1,
        "ckd-border-2": palette.b2,

        "ckd-input-bg": palette.s2,
        "ckd-input-border": palette.b2,
        "ckd-placeholder": palette.tp,

        "ckd-text": palette.tx,
        "ckd-text-muted": palette.tm,
        "ckd-text-faint": palette.tf,
        "ckd-text-dark": palette.td,

        "ckd-orange": palette.orange,
        "ckd-orange-s": palette["orange-s"],
        "ckd-orange-m": palette["orange-m"],

        "ckd-green": palette.green,
        "ckd-green-s": palette["green-s"],

        "ckd-blue": palette.blue,
        "ckd-blue-s": palette["blue-s"],

        "ckd-yellow": palette.yellow,
        "ckd-yellow-s": palette["yellow-s"],

        "ckd-purple": palette.purple,
        "ckd-purple-s": palette["purple-s"],

        "ckd-teal": palette.teal,
        "ckd-teal-s": palette["teal-s"],
        "ckd-teal-m": palette["teal-m"],

        "ckd-red": palette.red,
        "ckd-red-s": palette["red-s"],

        "ckd-main-color": colors.main,
        "ckd-main-color-s": colors["main-s"],

        "ckd-proteine": palette.blue,
        "ckd-proteine-s": palette["blue-s"],
        "ckd-glucide": palette.yellow,
        "ckd-glucide-s": palette["yellow-s"],
        "ckd-lipide": palette.orange,
        "ckd-lipide-s": palette["orange-s"],
      },

      // DM Sans          → texte courant (body, boutons, labels)
      // DM Serif Display → branding, grand display, logo
      // DM Mono          → labels, badges, données chiffrées, inputs labels
      fontFamily: {
        // DM Sans
        "ckd-sans": ["DMSans_400Regular"],
        "ckd-sans-medium": ["DMSans_500Medium"],
        "ckd-sans-semibold": ["DMSans_600SemiBold"],
        "ckd-sans-bold": ["DMSans_700Bold"],
        "ckd-sans-extrabold": ["DMSans_800ExtraBold"],
        "ckd-sans-black": ["DMSans_900Black"],

        // DM Serif Display — branding & grands nombres
        "ckd-serif": ["DMSerifDisplay_400Regular"],

        // DM Mono — labels & données chiffrées
        "ckd-mono": ["DMMono_400Regular"],
        "ckd-mono-medium": ["DMMono_500Medium"],
      },

      fontSize: {
        "ckd-fs9": "9px", // nav group labels, captions
        "ckd-fs10": "10px", // badge text, section labels
        "ckd-fs11": "11px", // labels, macro labels, badges
        "ckd-fs12": "12px", // corps texte compact
        "ckd-fs13": "13px", // secondary headers, inputs
        "ckd-fs14": "14px", // texte principal (p)
        "ckd-fs15": "15px", // valeurs macros
        "ckd-fs16": "16px", // grands headers
        "ckd-fs17": "17px", // valeurs nutriments bold
        "ckd-fs19": "19px", // page main headers
        "ckd-fs22": "22px", // h2 (font-weight 900)
        "ckd-fs23": "23px", // onboarding headers
        "ckd-fs26": "26px", // logo cooked
        "ckd-fs32": "32px", // grand branding login
        "ckd-fs44": "44px", // kcal detail (line-height 1)
        "ckd-fs52": "52px", // objectif calorique display
      },

      letterSpacing: {
        // Négatif — headers & display numbers
        "ckd-ls-m-0-5": "-0.5px",
        "ckd-ls-m-1": "-1px",
        "ckd-ls-m-2": "-2px",
        "ckd-ls-m-3": "-3px",

        // Positif — labels monospace espacés
        "ckd-ls-0-5": "0.5px", // input labels, section labels
        "ckd-ls-1": "1px", // input labels, section labels
        "ckd-ls-2": "2px", // input labels, section labels
        "ckd-ls-3": "3px", // nav group labels
        "ckd-ls-4": "4px", // champs mot de passe
      },

      spacing: {
        px: "1px",
        0: "0",
        0.5: "0.125rem",
        1: "0.25rem",
        1.5: "0.375rem",
        2: "0.5rem",
        2.5: "0.625rem",
        3: "0.75rem",
        3.5: "0.875rem",
        4: "1rem",
        5: "1.25rem",
        6: "1.5rem",
        7: "1.75rem",
        8: "2rem",
        9: "2.25rem",
        10: "2.5rem",
        11: "2.75rem",
        12: "3rem",
        14: "3.5rem",
        16: "4rem",
        18: "4.5rem",
        19: "4.75rem",
        20: "5rem",
        22: "5.5rem",
        24: "6rem",
        28: "7rem",
        32: "8rem",
        36: "9rem",
        40: "10rem",
        44: "11rem",
        48: "12rem",
        52: "13rem",
        56: "14rem",
        60: "15rem",
        64: "16rem",
        72: "18rem",
        80: "20rem",
        96: "24rem",
      },
    },
  },
  plugins: [],
};
