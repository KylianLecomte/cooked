import { View } from "react-native";
import Animated, { useAnimatedStyle, useDerivedValue, withTiming } from "react-native-reanimated";
import { twMerge } from "tailwind-merge";
import { Props } from "@/types/props.type";

export type ProgressBarColors = {
  text: string;
  bg: string;
  bgSoft: string;
  border: string;
};

export type ProgressBarProps = Readonly<
  {
    current: number;
    target: number;
    progressColor: string;
    backgroundColor: string;
    borderColor: string;
  } & Props
>;

export default function CkdProgressBar({
  className,
  progressColor,
  backgroundColor,
  borderColor,
  current,
  target,
}: Readonly<ProgressBarProps>) {
  const ratio = useDerivedValue(
    () => Math.min(current / Math.max(target, 1), 1),
    [current, target],
  );

  const _animatedFill = useAnimatedStyle(() => ({
    width: withTiming(`${ratio.value * 100}%`, { duration: 450 }),
  }));

  return (
    <View
      className={twMerge(
        "border h-2 rounded-md overflow-hidden",
        backgroundColor,
        borderColor,
        className,
      )}
    >
      <Animated.View className={`h-full rounded-md ${progressColor}`} style={[_animatedFill]} />
    </View>
  );
}
