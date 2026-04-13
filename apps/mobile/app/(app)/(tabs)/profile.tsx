import { ACTIVITY_LEVEL_LABELS, GOAL_LABELS } from "@cooked/shared";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { router } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { twMerge } from "tailwind-merge";
import CkdButton from "@/components/CkdButton";
import CkdCard from "@/components/CkdCard";
import { colors } from "@/theme/colors.style";
import { ButtonVariants, TextVariants } from "@/theme/variant.style";
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
    <ScrollView className="flex-1 bg-ckd-bg p-4 pt-14">
      <Text className="text-[#334155] text-xs tracking-[3px] mb-6 mt-4">PROFIL</Text>

      <View className="gap-4">
        <CkdCard
          content={
            <View className="flex-row justify-between items-center">
              <View className="flex-row gap-4 items-center">
                <View className="w-15 h-15 bg-ckd-main-color-s border rounded-lg border-ckd-main-color" />
                <View className="">
                  <Text className="text-ckd-text font-bold text-lg">Kylian</Text>
                  <Text className="text-ckd-text-muted text-xs">{session?.user.email}</Text>
                  <Text className="text-ckd-text-muted text-xs">75 kg - 178 cm - 27 ans</Text>
                </View>
              </View>
              <View className="items-center">
                <CkdButton
                  containerClassName={ButtonVariants.ternary.containerClassName}
                  onPress={() => console.debug("TODO: edit profile")}
                >
                  <SimpleLineIcons name="pencil" size={18} color={colors.main} />
                </CkdButton>
              </View>
            </View>
          }
        />

        {profile?.targetKcal && (
          <CkdCard
            titleLeft={<Text className={TextVariants.title}>OBJECTIFS QUOTIDIENS</Text>}
            titleRight={
              <CkdButton
                containerClassName={ButtonVariants.iconBorderLess.containerClassName}
                onPress={() => console.debug("TODO: edit goals")}
              >
                <Text className={twMerge("text-xs", ButtonVariants.iconBorderLess.textClassName)}>
                  Modifier
                </Text>
              </CkdButton>
            }
            content={
              <>
                <View className="flex-row justify-between mb-3">
                  <View className="items-center">
                    <Text className="text-ckd-text text-2xl font-black">{profile.targetKcal}</Text>
                    <Text className="text-[#475569] text-xs mt-1">kcal</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-ckd-proteine text-2xl font-black">
                      {profile.targetProteinG}g
                    </Text>
                    <Text className="text-[#475569] text-xs mt-1">protéines</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-ckd-glucide text-2xl font-black">
                      {profile.targetCarbsG}g
                    </Text>
                    <Text className="text-[#475569] text-xs mt-1">glucides</Text>
                  </View>
                  <View className="items-center">
                    <Text className="text-ckd-lipide text-2xl font-black">
                      {profile.targetFatG}g
                    </Text>
                    <Text className="text-[#475569] text-xs mt-1">lipides</Text>
                  </View>
                </View>
                <View className="border-t border-[#1E293B] pt-3">
                  <Text className="text-[#475569] text-xs">
                    TDEE : {profile.tdeeKcal} kcal ·{" "}
                    {profile.goal ? GOAL_LABELS[profile.goal] : "—"}
                  </Text>
                </View>
              </>
            }
          ></CkdCard>
        )}

        {profile?.targetKcal && (
          <View className="bg-[#0F172A] border border-[#1E293B] p-4 mb-4">
            <Text className="text-[#334155] text-xs tracking-[2px] mb-3">OBJECTIFS QUOTIDIENS</Text>
            <View className="flex-row justify-between mb-3">
              <View className="items-center">
                <Text className="text-ckd-text text-2xl font-black">{profile.targetKcal}</Text>
                <Text className="text-[#475569] text-xs mt-1">kcal</Text>
              </View>
              <View className="items-center">
                <Text className="text-ckd-proteine text-2xl font-black">
                  {profile.targetProteinG}g
                </Text>
                <Text className="text-[#475569] text-xs mt-1">protéines</Text>
              </View>
              <View className="items-center">
                <Text className="text-ckd-glucide text-2xl font-black">
                  {profile.targetCarbsG}g
                </Text>
                <Text className="text-[#475569] text-xs mt-1">glucides</Text>
              </View>
              <View className="items-center">
                <Text className="text-ckd-lipide text-2xl font-black">{profile.targetFatG}g</Text>
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
      </View>
    </ScrollView>
  );
}
