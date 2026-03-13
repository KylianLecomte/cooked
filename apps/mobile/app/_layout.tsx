import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

// QueryClient unique pour toute l'app.
// staleTime: 60s — évite de refetcher le profil à chaque navigation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      {/*
       * headerShown: false ici — chaque layout enfant gère son propre header.
       * animation: "none" sur la racine pour éviter un flash au démarrage.
       */}
      <Stack screenOptions={{ headerShown: false, animation: "none" }} />
    </QueryClientProvider>
  );
}
