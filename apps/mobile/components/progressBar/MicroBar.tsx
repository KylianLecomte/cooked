import { Text, View } from "react-native";
import ProgressBar, { ProgressBarColors } from "./ProgressBar";

type MicroColor = "green" | "orange" | "red" | "purple";

const colorStyles: Record<MicroColor, ProgressBarColors> = {
  green: {
    text: "text-ckd-green",
    bg: "bg-ckd-green",
    bgSoft: "bg-ckd-green-s",
    border: "border-ckd-green-s",
  },
  orange: {
    text: "text-ckd-orange",
    bg: "bg-ckd-orange",
    bgSoft: "bg-ckd-orange-s",
    border: "border-ckd-orange-s",
  },
  red: {
    text: "text-ckd-red",
    bg: "bg-ckd-red",
    bgSoft: "bg-ckd-red-s",
    border: "border-ckd-red-s",
  },
  purple: {
    text: "text-ckd-purple",
    bg: "bg-ckd-purple",
    bgSoft: "bg-ckd-purple-s",
    border: "border-ckd-purple-s",
  },
} as const;

function getColorStyle(current: number) {
  if (current < 30) return colorStyles.red;
  if (current < 70) return colorStyles.orange;
  if (current > 100) return colorStyles.purple;
  return colorStyles.green;
}

type MicroBarProps = Readonly<{
  label: string;
  current: number;
}>;

export default function MicroBar({ label, current }: MicroBarProps) {
  const colors = getColorStyle(current);

  return (
    <View className={`gap-2 flex-row items-center`}>
      <Text className={`w-22 text-ckd-fs12 font-sans mb-0 text-ckd-text-muted`}>{label}</Text>
      <ProgressBar
        className="flex-1"
        backgroundColor={colors.bgSoft}
        progressColor={colors.bg}
        borderColor={colors.border}
        current={current}
        target={100}
      />

      <View className="w-12 items-end">
        <Text
          numberOfLines={1}
          className={`text-ckd-fs12 font-ckd-sans font-bold tracking-tighter ${colors.text}`}
        >
          {current}
          <Text className={`text-ckd-fs12 ${colors.text} font-normal`}>%</Text>
        </Text>
      </View>
    </View>
  );
}
