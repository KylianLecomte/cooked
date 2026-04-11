import {
  ACTIVITY_LEVEL_DETAILS,
  ACTIVITY_LEVEL_LABELS,
  ACTIVITY_LEVELS,
  ACTIVITY_MULTIPLIERS,
  type ActivityLevel,
  GOAL_KCAL_DELTA,
  GOAL_LABELS,
  GOALS,
  type Goal,
} from "@cooked/shared";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useUpdateProfile } from "../../../hooks/useProfile";

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
        <View className="flex-1 h-1 bg-ckd-green" />
        <View className="flex-1 h-1 bg-ckd-green" />
        <View className="flex-1 h-1 bg-ckd-border-1" />
      </View>

      <Text className="text-ckd-text-muted text-xs tracking-[3px] mb-2">ÉTAPE 2 / 3</Text>
      <Text className="text-ckd-text text-3xl font-black mb-1">Activité & Objectif</Text>
      <Text className="text-ckd-text-muted text-sm mb-8">
        Le facteur qui multiplie le plus tes besoins caloriques.
      </Text>

      {/* Niveau d'activité */}
      <Text className="text-ckd-text-muted text-xs tracking-[2px] mb-3">NIVEAU D'ACTIVITÉ</Text>
      <View className="gap-2 mb-7">
        {ACTIVITY_LEVELS.map((a) => (
          <Pressable
            key={a}
            className={`border p-4 flex-row justify-between items-center ${
              activityLevel === a
                ? "border-ckd-green bg-ckd-green-s"
                : "border-ckd-input-border bg-ckd-input-bg"
            }`}
            onPress={() => setActivityLevel(a)}
          >
            <View className="flex-1">
              <Text
                className={`font-semibold text-sm ${
                  activityLevel === a ? "text-ckd-green" : "text-ckd-text-muted"
                }`}
              >
                {ACTIVITY_LEVEL_LABELS[a]}
              </Text>
              <Text className="text-ckd-text-muted text-xs mt-0.5">
                {ACTIVITY_LEVEL_DETAILS[a]}
              </Text>
            </View>
            <Text
              className={`text-sm font-bold ml-4 ${
                activityLevel === a ? "text-ckd-green" : "text-ckd-text-muted"
              }`}
            >
              ×{ACTIVITY_MULTIPLIERS[a]}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Objectif */}
      <Text className="text-ckd-text-muted text-xs tracking-[2px] mb-3">OBJECTIF</Text>
      <View className="gap-2 mb-7">
        {GOALS.map((g) => (
          <Pressable
            key={g}
            className={`border p-4 flex-row justify-between items-center ${
              goal === g
                ? "border-ckd-green bg-ckd-green-s"
                : "border-ckd-input-border bg-ckd-input-bg"
            }`}
            onPress={() => setGoal(g)}
          >
            <View className="flex-1">
              <Text
                className={`font-semibold text-sm ${
                  goal === g ? "text-ckd-green" : "text-ckd-text-muted"
                }`}
              >
                {GOAL_LABELS[g]}
              </Text>
              <Text className="text-ckd-text-muted text-xs mt-0.5">
                {GOAL_KCAL_DELTA[g] === 0
                  ? "Équilibre calorique"
                  : `${GOAL_KCAL_DELTA[g] > 0 ? "+" : ""}${GOAL_KCAL_DELTA[g]} kcal/jour`}
              </Text>
            </View>
            <Text
              className={`text-sm font-bold ml-4 ${
                goal === g ? "text-ckd-green" : "text-ckd-text-muted"
              }`}
            >
              {GOAL_KCAL_DELTA[g] === 0
                ? "±0 kcal"
                : `${GOAL_KCAL_DELTA[g] > 0 ? "+" : ""}${GOAL_KCAL_DELTA[g]} kcal`}
            </Text>
          </Pressable>
        ))}
      </View>

      {error !== "" && <Text className="text-ckd-red text-sm mb-4">{error}</Text>}

      <Pressable
        className="bg-ckd-green py-4 items-center mb-8"
        onPress={handleNext}
        disabled={updateProfile.isPending}
      >
        {updateProfile.isPending ? (
          <ActivityIndicator className="text-ckd-text-dark" size="small" />
        ) : (
          <Text className="text-ckd-text-dark font-bold text-base tracking-wider">SUIVANT</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}
