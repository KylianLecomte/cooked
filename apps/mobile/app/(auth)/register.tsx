import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { authClient } from "../../lib/auth-client";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate(): string | null {
    if (!name.trim()) return "Le prénom est requis";
    if (!email.trim()) return "L'email est requis";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email invalide";
    if (password.length < 8) return "Le mot de passe doit faire au moins 8 caractères";
    if (password !== confirmPassword) return "Les mots de passe ne correspondent pas";
    return null;
  }

  async function handleRegister() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    const { error: authError } = await authClient.signUp.email({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    });

    setLoading(false);

    if (authError) {
      if (authError.status === 422) {
        setError("Un compte existe déjà avec cet email");
      } else {
        setError("Une erreur est survenue, réessaie plus tard");
      }
      return;
    }

    // Succès — l'utilisateur est connecté automatiquement après signUp
    // Redirect vers l'onboarding pour compléter le profil
    router.replace("/(app)/onboarding/step1");
  }

  return (
    <View className="flex-1 bg-ckd-bg px-6 justify-center">
      {/* En-tête */}
      <Text className="text-[#4ADE80] text-xs tracking-[3px] mb-2">COOKED</Text>
      <Text className="text-[#F1F5F9] text-4xl font-black mb-1">INSCRIPTION</Text>
      <Text className="text-[#475569] text-sm mb-10">Commence à tracker tes repas.</Text>

      {/* Champs */}
      <TextInput
        className="bg-[#0F172A] border border-[#1E293B] text-[#F1F5F9] px-4 py-4 mb-3 text-base"
        placeholder="Prénom"
        placeholderTextColor="#334155"
        autoCapitalize="words"
        autoCorrect={false}
        value={name}
        onChangeText={setName}
        returnKeyType="next"
      />
      <TextInput
        className="bg-[#0F172A] border border-[#1E293B] text-[#F1F5F9] px-4 py-4 mb-3 text-base"
        placeholder="Email"
        placeholderTextColor="#334155"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={setEmail}
        returnKeyType="next"
      />
      <TextInput
        className="bg-[#0F172A] border border-[#1E293B] text-[#F1F5F9] px-4 py-4 mb-3 text-base"
        placeholder="Mot de passe (8 caractères minimum)"
        placeholderTextColor="#334155"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        returnKeyType="next"
      />
      <TextInput
        className="bg-[#0F172A] border border-[#1E293B] text-[#F1F5F9] px-4 py-4 mb-6 text-base"
        placeholder="Confirmer le mot de passe"
        placeholderTextColor="#334155"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        onSubmitEditing={handleRegister}
        returnKeyType="done"
      />

      {/* Erreur */}
      {error !== "" && <Text className="text-red-400 text-sm mb-4">{error}</Text>}

      {/* Bouton principal */}
      <Pressable
        className="bg-[#4ADE80] py-4 items-center mb-6"
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#080C10" />
        ) : (
          <Text className="text-[#080C10] font-bold text-base tracking-wider">
            CRÉER MON COMPTE
          </Text>
        )}
      </Pressable>

      {/* Lien connexion */}
      <Pressable onPress={() => router.back()}>
        <Text className="text-[#475569] text-sm text-center">
          Déjà un compte ? <Text className="text-[#4ADE80] font-semibold">Se connecter</Text>
        </Text>
      </Pressable>
    </View>
  );
}
