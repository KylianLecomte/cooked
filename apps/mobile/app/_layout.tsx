import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://816c8662410dc6d72ff4681070600c6f@o4511010053685248.ingest.de.sentry.io/4511081608052816',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

// QueryClient unique pour toute l'app.
// staleTime: 60s — évite de refetcher le profil à chaque navigation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
    },
  },
});

export default Sentry.wrap(function RootLayout() {
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
});
