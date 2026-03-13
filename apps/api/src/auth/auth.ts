import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../prisma/prisma.instance";

export const auth = betterAuth({
  basePath: "/api/auth",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  trustedOrigins: [
    "http://localhost:8081", // Metro Expo dev server
    // Origines supplémentaires : IP réseau locale, tunnel ngrok/Expo…
    // Configurer via BETTER_AUTH_TRUSTED_ORIGINS (valeurs séparées par virgule)
    ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",").map((o) => o.trim()) ?? []),
  ],
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    // Plugin serveur Expo : ajoute exp:// aux origines de confiance
    // et expose /api/auth/expo-authorization-proxy pour les flux OAuth
    expo(),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
