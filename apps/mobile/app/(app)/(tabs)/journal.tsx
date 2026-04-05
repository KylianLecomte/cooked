import { Text, View } from "react-native";
import Card from "@/components/Card";
import MacroBar from "@/components/progressBar/MacroBar";
import MicroBar from "@/components/progressBar/MicroBar";
import ProgressBar from "@/components/progressBar/ProgressBar";

// Stub P1 — implémentation complète en P3 (Journal Alimentaire)
export default function JournalScreen() {
  return (
    <View className="flex-1 gap-4 bg-ckd-bg p-2">
      <View className="mt-16">
        <Text className="text-ckd-text-muted text-xl font-bold">MERCREDI</Text>
        <Text className="text-ckd-text-muted text-xl font-bold">11 mars 2026</Text>
      </View>
      <Card>
        <View className="flex-row justify-between mb-2">
          <Text className={`text-ckd-text-faint font-ckd-mono text-ckd-fs10`}>
            CALORIES & MACROS
          </Text>
          <Text className={`text-ckd-text-faint font-ckd-mono text-ckd-fs10`}>2350 kcal obj.</Text>
        </View>
        <View className="flex-row items-end gap-1 mb-1">
          <Text className={`text-ckd-orange font-ckd-serif text-7xl`}>1260</Text>
          {/* font-ckd-serif text-ckd-fs52 p-0 m-0 */}
          <View className="gap-1 mb-2">
            <Text className={`text-ckd-orange font-ckd-sans text-ckd-fs12`}>KCAL</Text>
            <Text className={`text-ckd-text-muted font-ckd-sans text-ckd-fs12`}>
              1080 kcal restants
            </Text>
          </View>
        </View>
        <ProgressBar
          className="w-full h-1 mb-2"
          backgroundColor={"bg-ckd-orange-s"}
          progressColor={"bg-ckd-orange"}
          borderColor={"border-ckd-orange-s"}
          current={1}
          target={10}
        />
        <View className={`gap-2`}>
          <MacroBar type="proteine" label="Protéines" current={98} target={176}></MacroBar>
          <MacroBar type="glucide" label="Glucides" current={2500} target={5000}></MacroBar>
          <MacroBar type="lipide" label="Lipides" current={42} target={78}></MacroBar>
        </View>
      </Card>
      <Card>
        <View className="flex-row justify-between mb-2">
          <Text className={`text-ckd-text-faint font-ckd-mono text-ckd-fs10`}>MICRONUTRIMENTS</Text>
          <Text className={`text-ckd-text-faint font-ckd-mono text-ckd-fs10`}>70/100</Text>
        </View>
        <View className={`gap-2`}>
          <MicroBar label="Vitamine D" current={20}></MicroBar>
          <MicroBar label="Magnésium" current={40}></MicroBar>
          <MicroBar label="Vitamine C" current={80}></MicroBar>
          <MicroBar label="Calcium" current={99}></MicroBar>
          <MicroBar label="Vitamine B12" current={140}></MicroBar>
        </View>
      </Card>
    </View>
  );
}
