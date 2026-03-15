import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { authClient } from "../lib/auth-client";
import "../global.css";

// Point d'entrée de l'app — redirige selon l'état de la session.
// Ce composant dispatch vers le bon groupe de routes sans rien afficher de permanent.
// La vérification profil (onboarding vs tabs) est déléguée à (app)/_layout.tsx.

export default function Index() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <View className="flex-1 bg-[#080C10] items-center justify-center">
        <ActivityIndicator size="small" color="#4ADE80" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(app)/(tabs)/journal" />;
}
