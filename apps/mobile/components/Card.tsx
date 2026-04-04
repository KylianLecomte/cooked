import { Text, View } from "react-native";
import MacroBar from "./progressBar/MacroBar";
import ProgressBar from "./progressBar/ProgressBar";

export default function Card() {
  return (
    <View className={`p-4 bg-ckd-surface-1 rounded-ckd-br-11 border border-ckd-border-1`}>
      <View className="flex-row justify-between mb-2">
        <Text className={`text-ckd-text-faint font-ckd-mono text-ckd-fs10`}>CALORIES & MACROS</Text>
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
        current={1}
        target={10}
      />
      <View className={`gap-2`}>
        <MacroBar type="proteine" label="Protéines" current={98} target={176}></MacroBar>
        <MacroBar type="glucide" label="Glucides" current={2500} target={5000}></MacroBar>
        <MacroBar type="lipide" label="Lipides" current={42} target={78}></MacroBar>
      </View>
    </View>
  );
}
