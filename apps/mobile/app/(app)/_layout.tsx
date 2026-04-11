import { router, Stack } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useProfile } from "../../hooks/useProfile";
import { authClient } from "../../lib/auth-client";

// Guard d'authentification pour toutes les routes protégées.
//
// Logique :
// 1. Session absente  → redirection vers /(auth)/login
// 2. Profil incomplet → redirection vers /(app)/onboarding/step1
// 3. Profil complet   → rendu du Stack enfant (tabs + autres routes app)
//
// "Incomplet" = un des champs critiques manquant : goal est le dernier
// champ rempli dans le flow onboarding, donc il sert de sentinelle.

export default function AppLayout() {
  const { data: session, isPending: sessionPending } = authClient.useSession();

  // Le profil n'est fetché que si la session est présente (enabled: !!session)
  const { data: profile, isLoading: profileLoading } = useProfile();

  const isLoading = sessionPending || (!!session && profileLoading);

  useEffect(() => {
    console.debug("AppLayout useEffect", { isLoading, session, profile });
    if (isLoading) return;

    if (!session) {
      router.replace("/(auth)/login");
      // return;
    }

    // Profil chargé (null = pas encore créé) et goal non renseigné → onboarding
    // if (profile !== undefined) {
    //   router.replace("/(app)/onboarding/step1");
    // }
  }, [isLoading, session, profile]);

  if (isLoading || !session) {
    return (
      <View className="flex-1 color-cooked-bg items-center justify-center">
        <ActivityIndicator size="small" color="#4ADE80" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
