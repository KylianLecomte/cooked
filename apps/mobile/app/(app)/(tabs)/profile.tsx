import { ACTIVITY_LEVEL_LABELS, GOAL_LABELS } from "@cooked/shared";
import { router } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useProfile } from "../../../hooks/useProfile";
import { authClient } from "../../../lib/auth-client";

export default function ProfileScreen() {
  const { data: session } = authClient.useSession();
  const { data: profile, isLoading } = useProfile();

  async function handleLogout() {
    await authClient.signOut();
    router.replace("/(auth)/login");
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-ckd-bg items-center justify-center">
        <ActivityIndicator size="small" color="#4ADE80" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-ckd-bg" contentContainerStyle={{ padding: 24 }}>
      {/* En-tête */}
      <Text className="text-[#334155] text-xs tracking-[3px] mb-6 mt-4">PROFIL</Text>

      {/* Identité */}
      <View className="bg-[#0F172A] border border-[#1E293B] p-4 mb-4">
        <Text className="text-[#334155] text-xs tracking-[2px] mb-3">COMPTE</Text>
        <Text className="text-[#F1F5F9] text-lg font-bold">{session?.user.name}</Text>
        <Text className="text-[#475569] text-sm mt-1">{session?.user.email}</Text>
      </View>

      {/* Objectifs nutritionnels */}
      {profile?.targetKcal && (
        <View className="bg-[#0F172A] border border-[#1E293B] p-4 mb-4">
          <Text className="text-[#334155] text-xs tracking-[2px] mb-3">OBJECTIFS QUOTIDIENS</Text>
          <View className="flex-row justify-between mb-3">
            <View className="items-center">
              <Text className="text-[#4ADE80] text-2xl font-black">{profile.targetKcal}</Text>
              <Text className="text-[#475569] text-xs mt-1">kcal</Text>
            </View>
            <View className="items-center">
              <Text className="text-[#61DAFB] text-2xl font-black">{profile.targetProteinG}g</Text>
              <Text className="text-[#475569] text-xs mt-1">protéines</Text>
            </View>
            <View className="items-center">
              <Text className="text-[#FB923C] text-2xl font-black">{profile.targetCarbsG}g</Text>
              <Text className="text-[#475569] text-xs mt-1">glucides</Text>
            </View>
            <View className="items-center">
              <Text className="text-[#FACC15] text-2xl font-black">{profile.targetFatG}g</Text>
              <Text className="text-[#475569] text-xs mt-1">lipides</Text>
            </View>
          </View>
          <View className="border-t border-[#1E293B] pt-3">
            <Text className="text-[#475569] text-xs">
              TDEE : {profile.tdeeKcal} kcal · {profile.goal ? GOAL_LABELS[profile.goal] : "—"}
            </Text>
          </View>
        </View>
      )}

      {/* Infos physiques */}
      {profile && (
        <View className="bg-[#0F172A] border border-[#1E293B] p-4 mb-4">
          <Text className="text-[#334155] text-xs tracking-[2px] mb-3">DONNÉES PHYSIQUES</Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-[#475569] text-sm">Poids</Text>
            <Text className="text-[#CBD5E1] text-sm font-semibold">
              {profile.weightKg ? `${profile.weightKg} kg` : "—"}
            </Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-[#475569] text-sm">Taille</Text>
            <Text className="text-[#CBD5E1] text-sm font-semibold">
              {profile.heightCm ? `${profile.heightCm} cm` : "—"}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-[#475569] text-sm">Activité</Text>
            <Text className="text-[#CBD5E1] text-sm font-semibold">
              {profile.activityLevel ? ACTIVITY_LEVEL_LABELS[profile.activityLevel] : "—"}
            </Text>
          </View>
        </View>
      )}

      {/* Actions */}
      <Pressable
        className="bg-[#0F172A] border border-[#1E293B] p-4 mb-3 flex-row justify-between items-center"
        onPress={() => router.push("/(app)/profile/edit")}
      >
        <Text className="text-[#CBD5E1] font-semibold">Modifier le profil</Text>
        <Text className="text-[#334155]">›</Text>
      </Pressable>

      <Pressable className="border border-red-900 p-4 items-center mt-4" onPress={handleLogout}>
        <Text className="text-red-500 font-semibold text-sm tracking-wider">SE DÉCONNECTER</Text>
      </Pressable>
    </ScrollView>
  );
}
