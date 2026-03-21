import { ACTIVITY_LEVEL_LABELS, GOAL_LABELS } from "@cooked/shared";
import { router } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useProfile } from "../../../hooks/useProfile";

export default function OnboardingStep3() {
  const { data: profile, isLoading } = useProfile();

  if (isLoading || !profile) {
    return (
      <View className="flex-1 bg-[#080C10] items-center justify-center">
        <ActivityIndicator size="small" color="#4ADE80" />
      </View>
    );
  }

  function handleStart() {
    // Le profil est complet — l'(app)/_layout.tsx ne redirigera plus vers l'onboarding
    router.replace("/(app)/(tabs)/journal");
  }

  return (
    <ScrollView className="flex-1 bg-[#080C10]" contentContainerStyle={{ padding: 24 }}>
      {/* Progression */}
      <View className="flex-row gap-2 mb-8 mt-4">
        <View className="flex-1 h-1 bg-[#4ADE80]" />
        <View className="flex-1 h-1 bg-[#4ADE80]" />
        <View className="flex-1 h-1 bg-[#4ADE80]" />
      </View>

      <Text className="text-[#334155] text-xs tracking-[3px] mb-2">ÉTAPE 3 / 3</Text>
      <Text className="text-[#F1F5F9] text-3xl font-black mb-1">Ton TDEE</Text>
      <Text className="text-[#475569] text-sm mb-8">
        Voici tes besoins caloriques calculés selon la formule Mifflin-St Jeor.
      </Text>

      {/* TDEE principal */}
      <View className="bg-[#0F172A] border border-[#4ADE8044] p-6 mb-4 items-center">
        <Text className="text-[#334155] text-xs tracking-[2px] mb-2">DÉPENSE ÉNERGÉTIQUE TOTALE</Text>
        <Text className="text-[#4ADE80] text-6xl font-black">{profile.tdeeKcal}</Text>
        <Text className="text-[#475569] text-base mt-1">kcal / jour</Text>
        <View className="border-t border-[#1E293B] mt-4 pt-4 w-full items-center">
          <Text className="text-[#334155] text-xs">
            Objectif {profile.goal ? GOAL_LABELS[profile.goal] : "—"} :{" "}
            <Text className="text-[#4ADE80] font-bold">{profile.targetKcal} kcal</Text>
          </Text>
        </View>
      </View>

      {/* Répartition macros */}
      <View className="bg-[#0F172A] border border-[#1E293B] p-4 mb-4">
        <Text className="text-[#334155] text-xs tracking-[2px] mb-4">RÉPARTITION DES MACROS</Text>
        <View className="flex-row justify-between">
          <View className="items-center flex-1">
            <Text className="text-[#61DAFB] text-2xl font-black">{profile.targetProteinG}g</Text>
            <Text className="text-[#475569] text-xs mt-1">Protéines</Text>
            <Text className="text-[#334155] text-xs">
              {Math.round(((profile.targetProteinG ?? 0) * 4 * 100) / (profile.targetKcal ?? 1))}%
            </Text>
          </View>
          <View className="w-px bg-[#1E293B]" />
          <View className="items-center flex-1">
            <Text className="text-[#FB923C] text-2xl font-black">{profile.targetCarbsG}g</Text>
            <Text className="text-[#475569] text-xs mt-1">Glucides</Text>
            <Text className="text-[#334155] text-xs">
              {Math.round(((profile.targetCarbsG ?? 0) * 4 * 100) / (profile.targetKcal ?? 1))}%
            </Text>
          </View>
          <View className="w-px bg-[#1E293B]" />
          <View className="items-center flex-1">
            <Text className="text-[#FACC15] text-2xl font-black">{profile.targetFatG}g</Text>
            <Text className="text-[#475569] text-xs mt-1">Lipides</Text>
            <Text className="text-[#334155] text-xs">
              {Math.round(((profile.targetFatG ?? 0) * 9 * 100) / (profile.targetKcal ?? 1))}%
            </Text>
          </View>
        </View>
      </View>

      {/* Récap */}
      <View className="bg-[#0F172A] border border-[#1E293B] p-4 mb-8">
        <Text className="text-[#334155] text-xs tracking-[2px] mb-3">RÉCAPITULATIF</Text>
        <View className="flex-row justify-between mb-1">
          <Text className="text-[#475569] text-sm">BMR (métabolisme de base)</Text>
          <Text className="text-[#CBD5E1] text-sm font-semibold">
            {Math.round((profile.tdeeKcal ?? 0) / 1.55)} kcal
          </Text>
        </View>
        <View className="flex-row justify-between mb-1">
          <Text className="text-[#475569] text-sm">Niveau d'activité</Text>
          <Text className="text-[#CBD5E1] text-sm font-semibold">
            {profile.activityLevel ? ACTIVITY_LEVEL_LABELS[profile.activityLevel] : "—"}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-[#475569] text-sm">Poids / Taille</Text>
          <Text className="text-[#CBD5E1] text-sm font-semibold">
            {profile.weightKg} kg · {profile.heightCm} cm
          </Text>
        </View>
      </View>

      <Text className="text-[#334155] text-xs text-center mb-4">
        Tu pourras modifier ces données à tout moment dans ton profil.
      </Text>

      <Pressable className="bg-[#4ADE80] py-4 items-center mb-8" onPress={handleStart}>
        <Text className="text-[#080C10] font-bold text-base tracking-wider">
          COMMENCER À LOGGER →
        </Text>
      </Pressable>
    </ScrollView>
  );
}
