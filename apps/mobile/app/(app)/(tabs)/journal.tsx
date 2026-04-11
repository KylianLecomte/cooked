import { Text, View } from "react-native";
import Button from "@/components/CkdButton";
import Ckd from "@/components/CkdCard";
import CkdMacroBar from "@/components/progressBar/CkdMacroBar";
import CkdMicroBar from "@/components/progressBar/CkdMicroBar";
import CkdProgressBar from "@/components/progressBar/CkdProgressBar";
import { ButtonVariants } from "@/theme/variant.style";

export default function JournalScreen() {
  return (
    <View className="flex-1 gap-4 bg-ckd-bg p-2">
      <View className="mt-16">
        <Text className="text-ckd-text text-xl font-bold">MERCREDI</Text>
        <Text className="text-ckd-text text-xl font-bold">11 mars 2026</Text>
      </View>

      <Ckd
        titleLeft={
          <Text className="text-ckd-text-faint font-ckd-mono text-ckd-fs10">CALORIES & MACROS</Text>
        }
        titleRight={
          <Text className="text-ckd-text-faint font-ckd-mono text-ckd-fs10">2350 kcal obj.</Text>
        }
        content={
          <>
            <View className="flex-row items-end gap-1 mb-1">
              <Text className="text-ckd-orange font-ckd-serif text-7xl">1260</Text>
              <View className="gap-1 mb-2">
                <Text className="text-ckd-orange font-ckd-sans text-ckd-fs12">KCAL</Text>
                <Text className="text-ckd-text-muted font-ckd-sans text-ckd-fs12">
                  1080 kcal restants
                </Text>
              </View>
            </View>
            <CkdProgressBar
              className="w-full h-1 mb-2"
              backgroundColor="bg-ckd-orange-s"
              progressColor="bg-ckd-orange"
              borderColor="border-ckd-orange-s"
              current={1}
              target={10}
            />
            <View className="gap-2">
              <CkdMacroBar type="proteine" label="Protéines" current={98} target={176} />
              <CkdMacroBar type="glucide" label="Glucides" current={2500} target={5000} />
              <CkdMacroBar type="lipide" label="Lipides" current={42} target={78} />
            </View>
          </>
        }
      />

      <Ckd
        titleLeft={
          <Text className="text-ckd-text-faint font-ckd-mono text-ckd-fs10">MICRONUTRIMENTS</Text>
        }
        titleRight={<Text className="text-ckd-text-faint font-ckd-mono text-ckd-fs10">70/100</Text>}
        content={
          <View className="gap-2">
            <CkdMicroBar label="Vitamine D" current={20} />
            <CkdMicroBar label="Magnésium" current={40} />
            <CkdMicroBar label="Vitamine B12" current={80} />
            <CkdMicroBar label="Calcium" current={99} />
            <CkdMicroBar label="Vitamine C" current={100} />
          </View>
        }
      />

      <Ckd
        titleLeft={
          <Text className="text-ckd-text font-ckd-sans text-ckd-fs16">Petit-déjeuner</Text>
        }
        titleRight={
          <View className="flex-row gap-2 items-center">
            <Text className="text-ckd-text-muted font-ckd-mono text-ckd-fs14">420 kcal</Text>
            <Button
              containerClassName={ButtonVariants.secondary.containerClassName}
              onPress={() => console.debug("Ajouter un aliment")}
            >
              <Text className={ButtonVariants.secondary.textClassName}>+</Text>
            </Button>
          </View>
        }
        content={
          <View className="gap-2">
            <Text className="text-ckd-text text-ckd-fs14 font-ckd-sans">- 2 œufs au plat</Text>
            <Text className="text-ckd-text text-ckd-fs14 font-ckd-sans">
              - 1 tranche de pain complet
            </Text>
            <Text className="text-ckd-text text-ckd-fs14 font-ckd-sans">- 1/2 avocat</Text>
          </View>
        }
        closable={true}
      />
    </View>
  );
}
