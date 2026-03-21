import {
  ACTIVITY_LEVEL_LABELS,
  ACTIVITY_LEVELS,
  type ActivityLevel,
  GENDER_LABELS,
  GENDERS,
  type Gender,
  GOAL_LABELS,
  GOALS,
  type Goal,
} from "@cooked/shared";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useProfile, useUpdateProfile } from "../../../hooks/useProfile";

export default function EditProfileScreen() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  // Pré-remplissage depuis le profil existant
  useEffect(() => {
    if (profile) {
      setWeightKg(profile.weightKg?.toString() ?? "");
      setHeightCm(profile.heightCm?.toString() ?? "");
      setGender(profile.gender ?? null);
      setActivityLevel(profile.activityLevel ?? null);
      setGoal(profile.goal ?? null);
    }
  }, [profile]);

  async function handleSave() {
    const w = Number(weightKg);
    const h = Number(heightCm);

    if (weightKg && (w < 20 || w > 500)) {
      setError("Poids invalide (20–500 kg)");
      return;
    }
    if (heightCm && (h < 50 || h > 280)) {
      setError("Taille invalide (50–280 cm)");
      return;
    }

    setError("");

    await updateProfile.mutateAsync({
      ...(weightKg ? { weightKg: w } : {}),
      ...(heightCm ? { heightCm: h } : {}),
      ...(gender ? { gender } : {}),
      ...(activityLevel ? { activityLevel } : {}),
      ...(goal ? { goal } : {}),
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#080C10] items-center justify-center">
        <ActivityIndicator size="small" color="#4ADE80" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#080C10]">
      {/* Header */}
      <View className="flex-row items-center px-6 pt-12 pb-6">
        <Pressable onPress={() => router.back()} className="mr-4">
          <Text className="text-[#4ADE80] text-lg">‹</Text>
        </Pressable>
        <Text className="text-[#F1F5F9] text-xl font-black">MODIFIER LE PROFIL</Text>
      </View>

      <View className="px-6 pb-10">
        {/* Genre */}
        <Text className="text-[#334155] text-xs tracking-[2px] mb-2">GENRE BIOLOGIQUE</Text>
        <View className="flex-row gap-2 mb-6">
          {GENDERS.map((g) => (
            <Pressable
              key={g}
              className={`flex-1 py-3 items-center border ${
                gender === g
                  ? "border-[#4ADE80] bg-[#4ADE8015]"
                  : "border-[#1E293B] bg-[#0F172A]"
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

        {/* Poids & Taille */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1">
            <Text className="text-[#334155] text-xs tracking-[2px] mb-2">POIDS (kg)</Text>
            <TextInput
              className="bg-[#0F172A] border border-[#1E293B] text-[#F1F5F9] px-4 py-4 text-base"
              keyboardType="decimal-pad"
              value={weightKg}
              onChangeText={setWeightKg}
              placeholder="70"
              placeholderTextColor="#334155"
            />
          </View>
          <View className="flex-1">
            <Text className="text-[#334155] text-xs tracking-[2px] mb-2">TAILLE (cm)</Text>
            <TextInput
              className="bg-[#0F172A] border border-[#1E293B] text-[#F1F5F9] px-4 py-4 text-base"
              keyboardType="decimal-pad"
              value={heightCm}
              onChangeText={setHeightCm}
              placeholder="175"
              placeholderTextColor="#334155"
            />
          </View>
        </View>

        {/* Niveau d'activité */}
        <Text className="text-[#334155] text-xs tracking-[2px] mb-2">NIVEAU D'ACTIVITÉ</Text>
        <View className="gap-2 mb-6">
          {ACTIVITY_LEVELS.map((a) => (
            <Pressable
              key={a}
              className={`border p-3 ${
                activityLevel === a
                  ? "border-[#4ADE80] bg-[#4ADE8010]"
                  : "border-[#1E293B] bg-[#0F172A]"
              }`}
              onPress={() => setActivityLevel(a)}
            >
              <Text
                className={`text-sm font-semibold ${
                  activityLevel === a ? "text-[#4ADE80]" : "text-[#CBD5E1]"
                }`}
              >
                {ACTIVITY_LEVEL_LABELS[a]}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Objectif */}
        <Text className="text-[#334155] text-xs tracking-[2px] mb-2">OBJECTIF</Text>
        <View className="gap-2 mb-8">
          {GOALS.map((g) => (
            <Pressable
              key={g}
              className={`border p-3 ${
                goal === g
                  ? "border-[#4ADE80] bg-[#4ADE8010]"
                  : "border-[#1E293B] bg-[#0F172A]"
              }`}
              onPress={() => setGoal(g)}
            >
              <Text
                className={`text-sm font-semibold ${
                  goal === g ? "text-[#4ADE80]" : "text-[#CBD5E1]"
                }`}
              >
                {GOAL_LABELS[g]}
              </Text>
            </Pressable>
          ))}
        </View>

        {error !== "" && <Text className="text-red-400 text-sm mb-4">{error}</Text>}
        {saved && (
          <Text className="text-[#4ADE80] text-sm mb-4 text-center">Profil mis à jour ✓</Text>
        )}

        <Pressable
          className="bg-[#4ADE80] py-4 items-center"
          onPress={handleSave}
          disabled={updateProfile.isPending}
        >
          {updateProfile.isPending ? (
            <ActivityIndicator size="small" color="#080C10" />
          ) : (
            <Text className="text-[#080C10] font-bold text-base tracking-wider">
              ENREGISTRER
            </Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}
