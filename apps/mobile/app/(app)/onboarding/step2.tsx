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
  getGoalDeltaLabel,
} from "@cooked/shared";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { twMerge } from "tailwind-merge";
import CkdButton from "@/components/CkdButton";
import CkdSelectCardGroup from "@/components/CkdSelectCardGroup";
import { ButtonVariants, InputVariants } from "@/theme/variant.style";
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
    <ScrollView className="flex-1 bg-ckd-bg p-4 pt-14">
      <View className="flex-row gap-2 mb-8">
        <View className="flex-1 h-1 bg-ckd-main-color" />
        <View className="flex-1 h-1 bg-ckd-main-color" />
        <View className="flex-1 h-1 bg-ckd-border-1" />
      </View>

      <Text className="text-ckd-text-muted text-xs tracking-[3px] mb-2">ÉTAPE 2 / 3</Text>
      <Text className="text-ckd-text text-3xl font-black mb-1">Activité & Objectif</Text>
      <Text className="text-ckd-text-muted text-sm mb-8">
        Le facteur qui multiplie le plus tes besoins caloriques.
      </Text>

      <Text className="text-ckd-text-muted text-xs tracking-[2px] mb-3">NIVEAU D'ACTIVITÉ</Text>

      <CkdSelectCardGroup
        containerClassName="mb-8"
        selectedId={activityLevel}
        classNames={{
          btnCommon: "self-stretch flex-row justify-between items-center",
          btnNotSelected: InputVariants.primary,
          btnSelected: InputVariants.secondary,
        }}
        cardContents={ACTIVITY_LEVELS.map((activity) => ({
          id: activity,
          content: (
            <>
              <View className="flex-1">
                <Text
                  className={`font-semibold text-sm ${
                    activityLevel === activity ? "text-ckd-main-color" : "text-ckd-text-muted"
                  }`}
                >
                  {ACTIVITY_LEVEL_LABELS[activity]}
                </Text>
                <Text className="text-ckd-text-muted text-xs mt-0.5">
                  {ACTIVITY_LEVEL_DETAILS[activity]}
                </Text>
              </View>
              <Text
                className={`text-sm font-bold ml-4 ${
                  activityLevel === activity ? "text-ckd-main-color" : "text-ckd-text-muted"
                }`}
              >
                ×{ACTIVITY_MULTIPLIERS[activity]}
              </Text>
            </>
          ),
        }))}
        onSelect={(id) => setActivityLevel(id as ActivityLevel)}
      ></CkdSelectCardGroup>

      <Text className="text-ckd-text-muted text-xs tracking-[2px] mb-3">OBJECTIF</Text>
      <CkdSelectCardGroup
        containerClassName="mb-8"
        selectedId={goal}
        classNames={{
          btnCommon: "self-stretch flex-row justify-between items-center",
          btnNotSelected: InputVariants.primary,
          btnSelected: InputVariants.secondary,
        }}
        cardContents={GOALS.map((g: Goal) => ({
          id: g,
          content: (
            <>
              <View>
                <Text
                  className={`font-semibold text-sm ${
                    goal === g ? "text-ckd-main-color" : "text-ckd-text-muted"
                  }`}
                >
                  {GOAL_LABELS[g]}
                </Text>
                <Text className="text-ckd-text-muted text-xs mt-0.5">
                  {GOAL_KCAL_DELTA[g] === 0
                    ? "Équilibre calorique"
                    : `${getGoalDeltaLabel(g)} kcal/jour`}
                </Text>
              </View>
              <Text
                className={`text-sm font-bold ml-4 ${
                  goal === g ? "text-ckd-main-color" : "text-ckd-text-muted"
                }`}
              >
                {GOAL_KCAL_DELTA[g] === 0 ? "±0 kcal" : `${getGoalDeltaLabel(g)} kcal`}
              </Text>
            </>
          ),
        }))}
        onSelect={(id) => setGoal(id as Goal)}
      ></CkdSelectCardGroup>

      {error !== "" && <Text className="text-ckd-red text-sm mb-4">{error}</Text>}

      <CkdButton
        containerClassName={twMerge(ButtonVariants.primary.containerClassName, "self-stretch py-4")}
        onPress={handleNext}
        disabled={updateProfile.isPending}
      >
        {updateProfile.isPending ? (
          <ActivityIndicator className="text-ckd-text-dark" size="small" />
        ) : (
          <Text
            className={twMerge(ButtonVariants.primary.textClassName, "font-bold tracking-wider")}
          >
            SUIVANT
          </Text>
        )}
      </CkdButton>
    </ScrollView>
  );
}
