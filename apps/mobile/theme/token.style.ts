export const colors = {
  // Fonds & surfaces
  bg: "#080A0C", // fond principal de l'app
  s1: "#13161D", // cards, inputs, tab bar
  s2: "#1C2028", // headers de menu, step dots

  // Bordures
  b1: "#23272F", // séparateurs, bordures de cards
  b2: "#2E3441", // toggles, badges, sheet handle

  // Texte
  tx: "#F1F5F9", // texte principal         ~19:1 AAA
  tm: "#9DAFC6", // texte secondaire / muted ~7.8:1 AAA sur s1
  tf: "#2E3441", // texte très subtil, dates futures

  // Orange — nav active, CTA primaire, lipides macros
  orange: "#FF6B2C",
  "orange-s": "rgba(255,107,44,0.12)",
  "orange-m": "rgba(255,107,44,0.35)",

  // Vert — succès, checkmarks, protéines dans les stats
  green: "#4ADE80",
  "green-s": "rgba(74,222,128,0.12)",

  // Bleu — protéines (macros), catégorie shopping
  blue: "#60A5FA",
  "blue-s": "rgba(96,165,250,0.12)",

  // Jaune — glucides (macros), breakfast, amidon shopping
  yellow: "#FBBF24",
  "yellow-s": "rgba(251,191,36,0.12)",

  // Violet — micronutriments, minéraux
  purple: "#A78BFA",
  "purple-s": "rgba(167,139,250,0.12)",

  // Teal — meal planning tab, CTA secondaire, cases cochées
  teal: "#2DD4BF",
  "teal-s": "rgba(45,212,191,0.12)",
  "teal-m": "rgba(45,212,191,0.30)",

  // Rouge — logout, erreurs, dépassement objectif
  red: "#F87171",
};

// DM Sans          → texte courant (body, boutons, labels)
// DM Serif Display → branding, grand display, logo
// DM Mono          → labels, badges, données chiffrées, inputs labels
export const fontFamily = {
  // DM Sans
  sans: "DMSans_400Regular",
  "sans-medium": "DMSans_500Medium",
  "sans-semibold": "DMSans_600SemiBold",
  "sans-bold": "DMSans_700Bold",
  "sans-extrabold": "DMSans_800ExtraBold",
  "sans-black": "DMSans_900Black",

  // DM Serif Display — branding & grands nombres
  serif: "DMSerifDisplay_400Regular",

  // DM Mono — labels & données chiffrées
  mono: "DMMono_400Regular",
  "mono-medium": "DMMono_500Medium",
};

export const fontSize = {
  fs9: { fontSize: 9, lineHeight: 13 }, // nav group labels, captions
  fs10: { fontSize: 10, lineHeight: 14 }, // badge text, section labels
  fs11: { fontSize: 11, lineHeight: 15 }, // labels, macro labels, badges
  fs12: { fontSize: 12, lineHeight: 17 }, // corps texte compact
  fs13: { fontSize: 13, lineHeight: 18 }, // secondary headers, inputs
  fs14: { fontSize: 14, lineHeight: 22 }, // texte principal (p)
  fs15: { fontSize: 15, lineHeight: 20 }, // valeurs macros
  fs16: { fontSize: 16, lineHeight: 22 }, // grands headers
  fs17: { fontSize: 17, lineHeight: 22 }, // valeurs nutriments bold
  fs19: { fontSize: 19, lineHeight: 24 }, // page main headers
  fs22: { fontSize: 22, lineHeight: 28 }, // h2 (font-weight 900)
  fs23: { fontSize: 23, lineHeight: 28 }, // onboarding headers
  fs26: { fontSize: 26, lineHeight: 30 }, // logo cooked
  fs32: { fontSize: 32, lineHeight: 36 }, // grand branding login
  fs44: { fontSize: 44, lineHeight: 44 }, // kcal detail (line-height 1)
  fs52: { fontSize: 52, lineHeight: 52 }, // objectif calorique display
};

export const letterSpacing = {
  // Négatif — headers & display numbers
  "ls-m-0-5": -0.5,
  "ls-m-1": -1,
  "ls-m-2": -2,
  "ls-m-3": -3,

  // Positif — labels monospace espacés
  "ls-2": 2, // input labels, section labels
  "ls-3": 3, // nav group labels
  "ls-4": 4, // champs mot de passe
};

export const borderRadius = {
  "br-2": 2, // progress bars, petits dots
  "br-6": 6, // petits boutons, recipe tags
  "br-9": 9, // portion selectors, tabs, petits contrôles
  "br-11": 11, // cards principales (valeur la plus fréquente)
  "br-13": 13, // inputs, boutons principaux
  "br-14": 14, // tab bar pills, boutons proéminents
  "br-15": 15, // meal sections, planner day cards
  "br-18": 18, // fonds de cards larges
  "br-20": 20, // badges, category pills, nav pills
  "br-9999": 9999, // cercles, toggles
};

export const spacing = {
  "sp-2": 2, // espacement très serré
  "sp-4": 4, // espacement serré entre éléments
  "sp-8": 8, // padding de cards, espacement modéré
  "sp-12": 12, // espacement large entre sections
  "sp-14": 14, // espacement large entre sections
  "sp-16": 16, // padding généreux, marges importantes
  "sp-24": 24, // espacement très large, marges extérieures
};
