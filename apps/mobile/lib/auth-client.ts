import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../api/api.constant";

export const authClient = createAuthClient({
  baseURL: `${API_BASE_URL}/auth`,
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
