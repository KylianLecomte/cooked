import { ACTIVITY_LEVEL_LABELS, GOAL_LABELS } from "@cooked/shared";
import { router } from "expo-router";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { twMerge } from "tailwind-merge";
import CkdButton from "@/components/CkdButton";
import CkdCard from "@/components/CkdCard";
import { ButtonVariants } from "@/theme/variant.style";
import { useProfile } from "../../../hooks/useProfile";

export default function OnboardingStep3() {
  const { data: profile, isLoading } = useProfile();

  if (isLoading || !profile) {
    console.debug("OnboardingStep3 loading", { isLoading, profile });

    return (
      <View className="flex-1 bg-ckd-bg items-center justify-center">
        <ActivityIndicator className="text-ckd-text" size="small" />
      </View>
    );
  }

  function handleStart() {
    router.replace("/(app)/(tabs)/journal");
  }

  return (
    <ScrollView className="flex-1 bg-ckd-bg p-4 pt-14">
      <View className="flex-row gap-2 mb-8">
        <View className="flex-1 h-1 bg-ckd-main-color" />
        <View className="flex-1 h-1 bg-ckd-main-color" />
        <View className="flex-1 h-1 bg-ckd-main-color" />
      </View>

      <Text className="text-ckd-text-muted text-xs tracking-[3px] mb-2">ÉTAPE 3 / 3</Text>
      <Text className="text-ckd-text text-3xl font-black mb-1">Ton TDEE</Text>
      <Text className="text-ckd-text-muted text-sm mb-8">
        Voici tes besoins caloriques calculés selon la formule Mifflin-St Jeor.
      </Text>

      <View className="gap-4">
        <CkdCard
          titleLeft={
            <Text className="text-ckd-text text-xs tracking-[2px] mb-2">
              DÉPENSE ÉNERGÉTIQUE TOTALE
            </Text>
          }
          content={
            <View className="items-center">
              <Text className="text-ckd-main-color text-6xl font-black">{profile.tdeeKcal}</Text>
              <Text className="text-ckd-text-muted text-base mt-1">kcal / jour</Text>
              <View className="border-t border-ckd-border-1 mt-4 pt-4 w-full items-center">
                <Text className="text-ckd-text-muted text-xs">
                  Objectif {profile.goal ? GOAL_LABELS[profile.goal] : "—"} :{" "}
                  <Text className="text-ckd-main-color font-bold">{profile.targetKcal} kcal</Text>
                </Text>
              </View>
            </View>
          }
        ></CkdCard>

        <CkdCard
          titleLeft={
            <Text className="text-ckd-text text-xs tracking-[2px] mb-4">
              RÉPARTITION DES MACROS
            </Text>
          }
          content={
            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <Text className="text-ckd-proteine text-2xl font-black">
                  {profile.targetProteinG}g
                </Text>
                <Text className="text-ckd-text-muted text-xs mt-1">Protéines</Text>
                <Text className="text-ckd-text-muted text-xs">
                  {Math.round(
                    ((profile.targetProteinG ?? 0) * 4 * 100) / (profile.targetKcal ?? 1),
                  )}
                  %
                </Text>
              </View>
              <View className="w-px bg-ckd-border-1" />
              <View className="items-center flex-1">
                <Text className="text-ckd-glucide text-2xl font-black">
                  {profile.targetCarbsG}g
                </Text>
                <Text className="text-ckd-text-muted text-xs mt-1">Glucides</Text>
                <Text className="text-ckd-text-muted text-xs">
                  {Math.round(((profile.targetCarbsG ?? 0) * 4 * 100) / (profile.targetKcal ?? 1))}%
                </Text>
              </View>
              <View className="w-px bg-ckd-border-1" />
              <View className="items-center flex-1">
                <Text className="text-ckd-lipide text-2xl font-black">{profile.targetFatG}g</Text>
                <Text className="text-ckd-text-muted text-xs mt-1">Lipides</Text>
                <Text className="text-ckd-text-muted text-xs">
                  {Math.round(((profile.targetFatG ?? 0) * 9 * 100) / (profile.targetKcal ?? 1))}%
                </Text>
              </View>
            </View>
          }
        ></CkdCard>

        <CkdCard
          titleLeft={
            <Text className="text-ckd-text text-xs tracking-[2px] mb-3">RÉCAPITULATIF</Text>
          }
          content={
            <>
              <View className="flex-row justify-between mb-1">
                <Text className="text-ckd-text-muted text-sm">BMR (métabolisme de base)</Text>
                <Text className="text-ckd-text text-sm font-semibold">
                  {Math.round((profile.tdeeKcal ?? 0) / 1.55)} kcal
                </Text>
              </View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-ckd-text-muted text-sm">Niveau d'activité</Text>
                <Text className="text-ckd-text text-sm font-semibold">
                  {profile.activityLevel ? ACTIVITY_LEVEL_LABELS[profile.activityLevel] : "—"}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-ckd-text-muted text-sm">Poids / Taille</Text>
                <Text className="text-ckd-text text-sm font-semibold">
                  {profile.weightKg} kg · {profile.heightCm} cm
                </Text>
              </View>
            </>
          }
        ></CkdCard>

        <Text className="text-ckd-text-muted text-xs text-center mb-4">
          Tu pourras modifier ces données à tout moment dans ton profil.
        </Text>
      </View>

      <CkdButton
        containerClassName={twMerge(ButtonVariants.primary.containerClassName, "self-stretch py-4")}
        onPress={handleStart}
      >
        <Text className={twMerge(ButtonVariants.primary.textClassName, "font-bold tracking-wider")}>
          TERMINER
        </Text>
      </CkdButton>
    </ScrollView>
  );
}
