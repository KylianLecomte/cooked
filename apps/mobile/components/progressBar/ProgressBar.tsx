import { View } from "react-native";
import Animated, { useAnimatedStyle, useDerivedValue, withTiming } from "react-native-reanimated";
import { Props } from "@/types/props.type";

export type ProgressBarProps = Readonly<
  {
    current: number;
    target: number;
    progressColor: string;
    backgroundColor: string;
  } & Props
>;

export default function ProgressBar({
  className,
  progressColor,
  backgroundColor,
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
      className={`h-1.5 rounded-ckd-br-2 overflow-hidden ${backgroundColor} ${className ?? ""}`}
    >
      <Animated.View
        className={`h-full rounded-ckd-br-2 ${progressColor}`}
        style={[_animatedFill]}
      />
    </View>
  );
}
