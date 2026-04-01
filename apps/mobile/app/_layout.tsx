import "../global.css";
import {
  DMMono_400Regular,
  DMMono_500Medium,
  useFonts as useMonoFonts,
} from "@expo-google-fonts/dm-mono";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
  DMSans_800ExtraBold,
  DMSans_900Black,
  useFonts as useSansFonts,
} from "@expo-google-fonts/dm-sans";
import {
  DMSerifDisplay_400Regular,
  useFonts as useSerifFonts,
} from "@expo-google-fonts/dm-serif-display";
import * as Sentry from "@sentry/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

Sentry.init({
  dsn: "https://816c8662410dc6d72ff4681070600c6f@o4511010053685248.ingest.de.sentry.io/4511081608052816",
  sendDefaultPii: true,
  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
    },
  },
});

export default Sentry.wrap(function RootLayout() {
  const [sansLoaded] = useSansFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    DMSans_800ExtraBold,
    DMSans_900Black,
  });

  const [serifLoaded] = useSerifFonts({
    DMSerifDisplay_400Regular,
  });

  const [monoLoaded] = useMonoFonts({
    DMMono_400Regular,
    DMMono_500Medium,
  });

  const fontsLoaded = sansLoaded && serifLoaded && monoLoaded;

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: "none" }} />
    </QueryClientProvider>
  );
});
