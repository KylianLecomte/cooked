import { Text, View } from "react-native";
import ProgressBar, { ProgressBarColors } from "./ProgressBar";

type MacroType = "proteine" | "glucide" | "lipide";

const macroStyles: Record<MacroType, ProgressBarColors> = {
  proteine: {
    text: "text-ckd-proteine",
    bg: "bg-ckd-proteine",
    bgSoft: "bg-ckd-proteine-s",
    border: "border-ckd-proteine-s",
  },
  glucide: {
    text: "text-ckd-glucide",
    bg: "bg-ckd-glucide",
    bgSoft: "bg-ckd-glucide-s",
    border: "border-ckd-glucide-s",
  },
  lipide: {
    text: "text-ckd-lipide",
    bg: "bg-ckd-lipide",
    bgSoft: "bg-ckd-lipide-s",
    border: "border-ckd-lipide-s",
  },
} as const;

type MacroBarProps = Readonly<{
  type: MacroType;
  label: string;
  current: number;
  target: number;
}>;

export default function MacroBar({ type, label, current, target }: MacroBarProps) {
  const exceeded = current > target;

  return (
    <View className={`gap-2 flex-row items-center`}>
      <Text className={`w-16 text-ckd-fs12 font-sans mb-0 text-ckd-text-muted`}>{label}</Text>
      <ProgressBar
        className="flex-1"
        backgroundColor={macroStyles[type].bgSoft}
        progressColor={macroStyles[type].bg}
        current={current}
        target={target}
        borderColor={macroStyles[type].border}
      />

      <View className="w-20 items-end">
        <Text
          numberOfLines={1}
          className={`text-ckd-fs12 font-ckd-sans font-bold tracking-tighter ${macroStyles[type].text} ${exceeded ? "text-red" : "text-tx"}`}
        >
          {current}
          <Text className={`text-ckd-fs12 ${macroStyles[type].text} font-normal`}>/{target}g</Text>
        </Text>
      </View>
    </View>
  );
}
