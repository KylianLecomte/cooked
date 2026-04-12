import { GENDER_LABELS, GENDERS, type Gender } from "@cooked/shared";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import CkdButton from "@/components/CkdButton";
import CkdSelectCardGroup from "@/components/CkdSelectCardGroup";
import CkdTextInput from "@/components/input/CkdTextInput";
import { InputVariants } from "@/theme/variant.style";
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
    console.debug("Profile updated, navigating to step 2");
    router.push("/(app)/onboarding/step2");
  }

  return (
    <ScrollView className="flex-1 bg-ckd-bg p-4 pt-14">
      <View className="flex-row gap-2 mb-8">
        <View className="flex-1 h-1 bg-ckd-main-color" />
        <View className="flex-1 h-1 bg-ckd-border-1" />
        <View className="flex-1 h-1 bg-ckd-border-1" />
      </View>

      <Text className="text-ckd-text-muted text-xs tracking-[3px] mb-2">ÉTAPE 1 / 3</Text>
      <Text className="text-ckd-text text-3xl font-black mb-1">Infos physiques</Text>
      <Text className="text-ckd-text-muted text-sm mb-8">
        Pour calculer tes besoins caloriques précis.
      </Text>

      <Text className="text-ckd-text-muted text-xs tracking-[2px] mb-2">DATE DE NAISSANCE</Text>
      <View className="flex-row gap-2 mb-5">
        <CkdTextInput
          className="flex-1"
          placeholder="JJ"
          keyboardType="number-pad"
          maxLength={2}
          value={birthDay}
          onChangeText={setBirthDay}
        />
        <CkdTextInput
          className="flex-1"
          placeholder="MM"
          keyboardType="number-pad"
          maxLength={2}
          value={birthMonth}
          onChangeText={setBirthMonth}
        />
        <CkdTextInput
          className="flex-[2]"
          placeholder="AAAA"
          keyboardType="number-pad"
          maxLength={4}
          value={birthYear}
          onChangeText={setBirthYear}
        />
      </View>

      <Text className="text-ckd-text-muted text-xs tracking-[2px] mb-2">GENRE BIOLOGIQUE</Text>
      <CkdSelectCardGroup
        containerClassName="flex-row mb-5"
        selectedId={gender}
        classNames={{
          btnCommon: "self-stretch flex-1 py-2",
          btnNotSelected: InputVariants.primary,
          btnSelected: InputVariants.secondary,
        }}
        cardContents={GENDERS.map((g) => ({
          id: g,
          content: (
            <Text
              className={`text-sm font-semibold ${
                gender === g ? "text-ckd-main-color" : "text-ckd-placeholder"
              }`}
            >
              {GENDER_LABELS[g]}
            </Text>
          ),
        }))}
        onSelect={(id) => setGender(id as Gender)}
      ></CkdSelectCardGroup>

      <View className="flex-row gap-3 mb-6">
        <View className="flex-1">
          <Text className="text-ckd-text-muted text-xs tracking-[2px] mb-2">TAILLE (cm)</Text>
          <CkdTextInput
            placeholder="175"
            keyboardType="decimal-pad"
            value={heightCm}
            onChangeText={setHeightCm}
          />
        </View>
        <View className="flex-1">
          <Text className="text-ckd-text-muted text-xs tracking-[2px] mb-2">POIDS (kg)</Text>
          <CkdTextInput
            placeholder="70"
            keyboardType="decimal-pad"
            value={weightKg}
            onChangeText={setWeightKg}
          />
        </View>
      </View>

      {error !== "" && <Text className="text-ckd-red text-sm mb-4">{error}</Text>}

      <CkdButton
        containerClassName="self-stretch bg-ckd-main-color py-4 items-center"
        onPress={handleNext}
        disabled={updateProfile.isPending}
      >
        {updateProfile.isPending ? (
          <ActivityIndicator className="text-ckd-text-dark" size="small" />
        ) : (
          <Text className="text-ckd-text-dark font-bold text-base tracking-wider">SUIVANT</Text>
        )}
      </CkdButton>
    </ScrollView>
  );
}
