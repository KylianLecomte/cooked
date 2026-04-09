export const palette = {
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
  red: "#EB2727",
  "red-s": "rgba(235,39,39,0.12)",
};

export const colors = {
  main: palette.orange,
} as const;
