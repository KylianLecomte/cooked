// L'URL de l'API est injectée au build time via EXPO_PUBLIC_API_URL.
// En dev local (WSL2), remplacer par l'IP LAN de la machine WSL si l'app
// tourne sur un vrai appareil (ex: http://192.168.1.x:3000).
// En tunnel Expo, ngrok expose généralement l'API via une URL publique.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/v1/api";
