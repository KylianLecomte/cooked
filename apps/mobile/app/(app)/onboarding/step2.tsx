import { router } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useUpdateProfile } from "../../../hooks/useProfile";
import { useState } from "react";

type ActivityLevel = "SEDENTARY" | "LIGHTLY_ACTIVE" | "MODERATELY_ACTIVE" | "VERY_ACTIVE" | "EXTRA_ACTIVE";
type Goal = "LOSE_WEIGHT" | "MAINTAIN" | "GAIN_MUSCLE";

const ACTIVITIES: { value: ActivityLevel; label: string; detail: string; multiplier: string }[] = [
  { value: "SEDENTARY", label: "Sédentaire", detail: "Bureau, peu ou pas d'exercice", multiplier: "×1.2" },
  { value: "LIGHTLY_ACTIVE", label: "Légèrement actif", detail: "Exercice léger 1–3 j/sem", multiplier: "×1.375" },
  { value: "MODERATELY_ACTIVE", label: "Modérément actif", detail: "Exercice modéré 3–5 j/sem", multiplier: "×1.55" },
  { value: "VERY_ACTIVE", label: "Très actif", detail: "Exercice intense 6–7 j/sem", multiplier: "×1.725" },
  { value: "EXTRA_ACTIVE", label: "Extrêmement actif", detail: "Travail physique + sport quotidien", multiplier: "×1.9" },
];

const GOALS: { value: Goal; label: string; detail: string; delta: string }[] = [
  { value: "LOSE_WEIGHT", label: "Perdre du poids", detail: "Déficit de 500 kcal/jour", delta: "−500 kcal" },
  { value: "MAINTAIN", label: "Maintenir", detail: "Équilibre calorique", delta: "±0 kcal" },
  { value: "GAIN_MUSCLE", label: "Prendre du muscle", detail: "Surplus de 300 kcal/jour", delta: "+300 kcal" },
];

export default function OnboardingStep2() {
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [error, setError] = useState("");

  const updateProfile = useUpdateProfile();

  async function handleNext() {
    if (!activityLevel) {
      setError("Sélectionne ton niveau d'activité");
      return;
    }
    if (!goal) {
      setError("Sélectionne ton objectif");
      return;
    }

    setError("");

    await updateProfile.mutateAsync({ activityLevel, goal });

    router.push("/(app)/onboarding/step3");
  }

  return (
    <ScrollView className="flex-1 bg-[#080C10]" contentContainerStyle={{ padding: 24 }}>
      {/* Progression */}
      <View className="flex-row gap-2 mb-8 mt-4">
        <View className="flex-1 h-1 bg-[#4ADE80]" />
        <View className="flex-1 h-1 bg-[#4ADE80]" />
        <View className="flex-1 h-1 bg-[#1E293B]" />
      </View>

      <Text className="text-[#334155] text-xs tracking-[3px] mb-2">ÉTAPE 2 / 3</Text>
      <Text className="text-[#F1F5F9] text-3xl font-black mb-1">Activité & Objectif</Text>
      <Text className="text-[#475569] text-sm mb-8">
        Le facteur qui multiplie le plus tes besoins caloriques.
      </Text>

      {/* Niveau d'activité */}
      <Text className="text-[#334155] text-xs tracking-[2px] mb-3">NIVEAU D'ACTIVITÉ</Text>
      <View className="gap-2 mb-7">
        {ACTIVITIES.map((a) => (
          <Pressable
            key={a.value}
            className={`border p-4 flex-row justify-between items-center ${
              activityLevel === a.value
                ? "border-[#4ADE80] bg-[#4ADE8010]"
                : "border-[#1E293B] bg-[#0F172A]"
            }`}
            onPress={() => setActivityLevel(a.value)}
          >
            <View className="flex-1">
              <Text
                className={`font-semibold text-sm ${
                  activityLevel === a.value ? "text-[#4ADE80]" : "text-[#CBD5E1]"
                }`}
              >
                {a.label}
              </Text>
              <Text className="text-[#334155] text-xs mt-0.5">{a.detail}</Text>
            </View>
            <Text
              className={`text-sm font-bold ml-4 ${
                activityLevel === a.value ? "text-[#4ADE80]" : "text-[#334155]"
              }`}
            >
              {a.multiplier}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Objectif */}
      <Text className="text-[#334155] text-xs tracking-[2px] mb-3">OBJECTIF</Text>
      <View className="gap-2 mb-7">
        {GOALS.map((g) => (
          <Pressable
            key={g.value}
            className={`border p-4 flex-row justify-between items-center ${
              goal === g.value
                ? "border-[#4ADE80] bg-[#4ADE8010]"
                : "border-[#1E293B] bg-[#0F172A]"
            }`}
            onPress={() => setGoal(g.value)}
          >
            <View className="flex-1">
              <Text
                className={`font-semibold text-sm ${
                  goal === g.value ? "text-[#4ADE80]" : "text-[#CBD5E1]"
                }`}
              >
                {g.label}
              </Text>
              <Text className="text-[#334155] text-xs mt-0.5">{g.detail}</Text>
            </View>
            <Text
              className={`text-sm font-bold ml-4 ${
                goal === g.value ? "text-[#4ADE80]" : "text-[#334155]"
              }`}
            >
              {g.delta}
            </Text>
          </Pressable>
        ))}
      </View>

      {error !== "" && <Text className="text-red-400 text-sm mb-4">{error}</Text>}

      <Pressable
        className="bg-[#4ADE80] py-4 items-center mb-8"
        onPress={handleNext}
        disabled={updateProfile.isPending}
      >
        {updateProfile.isPending ? (
          <ActivityIndicator size="small" color="#080C10" />
        ) : (
          <Text className="text-[#080C10] font-bold text-base tracking-wider">SUIVANT →</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}
