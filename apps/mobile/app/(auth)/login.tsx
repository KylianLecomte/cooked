import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { authClient } from "../../lib/auth-client";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError("Email et mot de passe requis");
      return;
    }

    setLoading(true);
    setError("");

    const { error: authError } = await authClient.signIn.email({
      email: email.trim().toLowerCase(),
      password,
    });

    setLoading(false);

    if (authError) {
      // Better Auth retourne des messages en anglais — on les traduit ici
      if (authError.status === 401) {
        setError("Email ou mot de passe incorrect");
      } else {
        setError("Une erreur est survenue, réessaie plus tard");
      }
      return;
    }

    // Succès — Expo Router redirige vers (app) via l'index
    router.replace("/(app)/(tabs)/journal");
  }

  return (
    <View className="flex-1 bg-[#080C10] px-6 justify-center">
      {/* En-tête */}
      <Text className="text-[#4ADE80] text-xs tracking-[3px] mb-2">COOKED</Text>
      <Text className="text-[#F1F5F9] text-4xl font-black mb-1">CONNEXION</Text>
      <Text className="text-[#475569] text-sm mb-10">Content de te revoir !</Text>

      {/* Champs */}
      <TextInput
        className="bg-[#0F172A] border border-[#1E293B] text-[#F1F5F9] px-4 py-4 mb-3 text-base"
        placeholder="Email"
        placeholderTextColor="#334155"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
        onSubmitEditing={handleLogin}
        returnKeyType="next"
      />
      <TextInput
        className="bg-[#0F172A] border border-[#1E293B] text-[#F1F5F9] px-4 py-4 mb-6 text-base"
        placeholder="Mot de passe"
        placeholderTextColor="#334155"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        onSubmitEditing={handleLogin}
        returnKeyType="done"
      />

      {/* Erreur */}
      {error !== "" && <Text className="text-red-400 text-sm mb-4">{error}</Text>}

      {/* Bouton principal */}
      <Pressable
        className="bg-[#4ADE80] py-4 items-center mb-6"
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#080C10" />
        ) : (
          <Text className="text-[#080C10] font-bold text-base tracking-wider">
            SE CONNECTER
          </Text>
        )}
      </Pressable>

      {/* Lien inscription */}
      <Pressable onPress={() => router.push("/(auth)/register")}>
        <Text className="text-[#475569] text-sm text-center">
          Pas encore de compte ?{" "}
          <Text className="text-[#4ADE80] font-semibold">Créer un compte</Text>
        </Text>
      </Pressable>
    </View>
  );
}
