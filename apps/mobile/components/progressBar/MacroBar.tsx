import { Text, View } from "react-native";
import ProgressBar from "./ProgressBar";

type MacroStyle = {
  text: string;
  bg: string;
  bgSoft: string;
};

type MacroType = "proteine" | "glucide" | "lipide";

const macroStyles: Record<MacroType, MacroStyle> = {
  proteine: {
    text: "text-ckd-proteine",
    bg: "bg-ckd-proteine",
    bgSoft: "bg-ckd-proteine-s",
  },
  glucide: {
    text: "text-ckd-glucide",
    bg: "bg-ckd-glucide",
    bgSoft: "bg-ckd-glucide-s",
  },
  lipide: {
    text: "text-ckd-lipide",
    bg: "bg-ckd-lipide",
    bgSoft: "bg-ckd-lipide-s",
  },
} as const;

type MacroBarProps = Readonly<{
  type: MacroType;
  label: string;
  current: number;
  target: number;
  unit?: string;
}>;

export default function MacroBar({ type, label, current, target, unit = "g" }: MacroBarProps) {
  const exceeded = current > target;

  return (
    <View className={`gap-2 flex-row items-center`}>
      <Text className={`w-14 text-xs font-sans mb-0 text-ckd-text-muted`}>{label}</Text>
      <ProgressBar
        className="flex-1"
        backgroundColor={macroStyles[type].bgSoft}
        progressColor={macroStyles[type].bg}
        current={current}
        target={target}
      />

      <View className="w-18 items-end">
        <Text
          className={`text-ckd-fs11 font-ckd-sans font-bold tracking-tighter ${macroStyles[type].text} ${exceeded ? "text-red" : "text-tx"}`}
        >
          {current}
          <Text className={`${macroStyles[type].text} font-normal`}>
            /{target}
            {unit}
          </Text>
        </Text>
      </View>
    </View>
  );
}
