import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

// L'URL de l'API est injectée au build time via EXPO_PUBLIC_API_URL.
// En dev local (WSL2), remplacer par l'IP LAN de la machine WSL si l'app
// tourne sur un vrai appareil (ex: http://192.168.1.x:3000).
// En tunnel Expo, ngrok expose généralement l'API via une URL publique.
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  plugins: [
    expoClient({
      // Doit correspondre au champ "scheme" dans app.json
      scheme: "cooked",
      storage: {
        // expo-secure-store SDK 55 expose des méthodes synchrones.
        // expoClient exige un getItem synchrone (retourne string | null).
        getItem: SecureStore.getItem,
        setItem: SecureStore.setItem,
      },
    }),
  ],
});
