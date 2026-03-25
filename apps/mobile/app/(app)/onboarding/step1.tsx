import { GENDER_LABELS, GENDERS, type Gender } from "@cooked/shared";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { useUpdateProfile } from "../../../hooks/useProfile";

export default function OnboardingStep1() {
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [error, setError] = useState("");

  const updateProfile = useUpdateProfile();

  function validate(): string | null {
    const year = Number(birthYear);
    const month = Number(birthMonth);
    const day = Number(birthDay);
    const now = new Date();

    if (!birthYear || !birthMonth || !birthDay) return "Date de naissance requise";
    if (year < 1900 || year > now.getFullYear() - 10) return "Année invalide";
    if (month < 1 || month > 12) return "Mois invalide (1–12)";
    if (day < 1 || day > 31) return "Jour invalide (1–31)";

    if (!gender) return "Sélectionne ton genre";

    const h = Number(heightCm);
    if (!heightCm || h < 50 || h > 280) return "Taille invalide (50–280 cm)";

    const w = Number(weightKg);
    if (!weightKg || w < 20 || w > 500) return "Poids invalide (20–500 kg)";

    return null;
  }

  async function handleNext() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");

    const birthDate = new Date(
      Number(birthYear),
      Number(birthMonth) - 1,
      Number(birthDay),
    ).toISOString();

    await updateProfile.mutateAsync({
      birthDate,
      gender: gender!,
      heightCm: Number(heightCm),
      weightKg: Number(weightKg),
    });

    router.push("/(app)/onboarding/step2");
  }

  return (
    <View className="flex-1 bg-[#080C10] px-6 justify-center">
      {/* Progression */}
      <View className="flex-row gap-2 mb-8">
        <View className="flex-1 h-1 bg-[#4ADE80]" />
        <View className="flex-1 h-1 bg-[#1E293B]" />
        <View className="flex-1 h-1 bg-[#1E293B]" />
      </View>

      <Text className="text-[#334155] text-xs tracking-[3px] mb-2">ÉTAPE 1 / 3</Text>
      <Text className="text-[#F1F5F9] text-3xl font-black mb-1">Infos physiques</Text>
      <Text className="text-[#475569] text-sm mb-8">
        Pour calculer tes besoins caloriques précis.
      </Text>

      {/* Date de naissance */}
      <Text className="text-[#334155] text-xs tracking-[2px] mb-2">DATE DE NAISSANCE</Text>
      <View className="flex-row gap-2 mb-5">
        <TextInput
          className="flex-1 bg-[#0F172A] border border-[#1E293B] text-[#F1F5F9] px-3 py-4 text-center text-base"
          placeholder="JJ"
          placeholderTextColor="#334155"
          keyboardType="number-pad"
          maxLength={2}
          value={birthDay}
          onChangeText={setBirthDay}
        />
        <TextInput
          className="flex-1 bg-[#0F172A] border border-[#1E293B] text-[#F1F5F9] px-3 py-4 text-center text-base"
          placeholder="MM"
          placeholderTextColor="#334155"
          keyboardType="number-pad"
          maxLength={2}
          value={birthMonth}
          onChangeText={setBirthMonth}
        />
        <TextInput
          className="flex-[2] bg-[#0F172A] border border-[#1E293B] text-[#F1F5F9] px-3 py-4 text-center text-base"
          placeholder="AAAA"
          placeholderTextColor="#334155"
          keyboardType="number-pad"
          maxLength={4}
          value={birthYear}
          onChangeText={setBirthYear}
        />
      </View>

      {/* Genre */}
      <Text className="text-[#334155] text-xs tracking-[2px] mb-2">GENRE BIOLOGIQUE</Text>
      <View className="flex-row gap-2 mb-5">
        {GENDERS.map((g) => (
          <Pressable
            key={g}
            className={`flex-1 py-3 items-center border ${
              gender === g ? "border-[#4ADE80] bg-[#4ADE8015]" : "border-[#1E293B] bg-[#0F172A]"
            }`}
            onPress={() => setGender(g)}
          >
            <Text
              className={`text-sm font-semibold ${
                gender === g ? "text-[#4ADE80]" : "text-[#475569]"
              }`}
            >
              {GENDER_LABELS[g]}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Taille & Poids */}
      <View className="flex-row gap-3 mb-6">
        <View className="flex-1">
          <Text className="text-[#334155] text-xs tracking-[2px] mb-2">TAILLE (cm)</Text>
          <TextInput
            className="bg-[#0F172A] border border-[#1E293B] text-[#F1F5F9] px-4 py-4 text-base"
            placeholder="175"
            placeholderTextColor="#334155"
            keyboardType="decimal-pad"
            value={heightCm}
            onChangeText={setHeightCm}
          />
        </View>
        <View className="flex-1">
          <Text className="text-[#334155] text-xs tracking-[2px] mb-2">POIDS (kg)</Text>
          <TextInput
            className="bg-[#0F172A] border border-[#1E293B] text-[#F1F5F9] px-4 py-4 text-base"
            placeholder="70"
            placeholderTextColor="#334155"
            keyboardType="decimal-pad"
            value={weightKg}
            onChangeText={setWeightKg}
          />
        </View>
      </View>

      {error !== "" && <Text className="text-red-400 text-sm mb-4">{error}</Text>}

      <Pressable
        className="bg-[#4ADE80] py-4 items-center"
        onPress={handleNext}
        disabled={updateProfile.isPending}
      >
        {updateProfile.isPending ? (
          <ActivityIndicator size="small" color="#080C10" />
        ) : (
          <Text className="text-[#080C10] font-bold text-base tracking-wider">SUIVANT →</Text>
        )}
      </Pressable>
    </View>
  );
}
