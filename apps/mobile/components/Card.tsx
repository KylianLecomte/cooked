import { Text, View } from "react-native";
import MacroBar from "./progressBar/MacroBar";
import ProgressBar from "./progressBar/ProgressBar";

export default function Card() {
  return (
    <View className={`p-4 bg-ckd-surface-1 rounded-ckd-br-11 border border-ckd-border-1`}>
      <Text className={`text-ckd-text font-ckd-mono text-ckd-fs10 mb-ckd-sp-2`}>
        CALORIES & MACROS
      </Text>
      <Text className={`text-ckd-text font-ckd-mono text-ckd-fs10 mb-ckd-sp-2`}>
        2350 kcal obj.
      </Text>
      <Text className={`text-ckd-text font-ckd-mono text-ckd-fs10 mb-ckd-sp-2`}>1260 KCAL</Text>
      <Text className={`text-ckd-text font-ckd-sans text-ckd-fs12 mb-ckd-sp-4`}>
        1080 kcal restants
      </Text>
      <ProgressBar
        className="w-full"
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
