import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useDerivedValue, withTiming } from "react-native-reanimated";
import * as t from "@/theme/token.style";

type MacroType = "proteine" | "glucide" | "lipide";

type Props = {
  type: MacroType;
  label: string;
  current: number;
  target: number;
  unit?: string;
};

// Couleurs par macro — accent plein + fond semi-transparent pour le track
const MACRO_COLORS: Record<MacroType, { fill: string; track: string }> = {
  proteine: { fill: t.colors.blue, track: t.colors["blue-s"] },
  glucide: { fill: t.colors.yellow, track: t.colors["yellow-s"] },
  lipide: { fill: t.colors.orange, track: t.colors["orange-s"] },
};

export default function MacroBar({ type, label, current, target, unit = "g" }: Props) {
  const { fill, track } = MACRO_COLORS[type];
  const exceeded = current > target;

  // Ratio clampé entre 0 et 1 — Reanimated le dérive en valeur partagée
  const ratio = useDerivedValue(
    () => Math.min(current / Math.max(target, 1), 1),
    [current, target],
  );

  const animatedFill = useAnimatedStyle(() => ({
    width: withTiming(`${ratio.value * 100}%`, { duration: 450 }),
  }));

  return (
    <View style={styles.row}>
      {/* Label + valeur */}
      <View style={styles.meta}>
        <Text style={[styles.label, { color: fill }]}>{label}</Text>
        <Text style={[styles.value, exceeded && styles.valueExceeded]}>
          {current}
          <Text style={styles.target}>
            /{target}
            {unit}
          </Text>
        </Text>
      </View>

      {/* Barre */}
      <View style={[styles.track, { backgroundColor: track }]}>
        <Animated.View
          style={[styles.fill, { backgroundColor: exceeded ? t.colors.red : fill }, animatedFill]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 6,
    marginBottom: t.spacing["sp-8"],
  },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  label: {
    fontFamily: t.fontFamily.mono,
    fontSize: t.fontSize.fs9.fontSize,
    lineHeight: t.fontSize.fs9.lineHeight,
    letterSpacing: t.letterSpacing["ls-2"],
  },
  value: {
    fontFamily: t.fontFamily.mono,
    fontSize: t.fontSize.fs11.fontSize,
    lineHeight: t.fontSize.fs11.lineHeight,
    color: t.colors.tx,
    fontWeight: "700",
  },
  valueExceeded: {
    color: t.colors.red,
  },
  target: {
    color: t.colors.tm,
    fontWeight: "400",
  },
  track: {
    height: 4,
    borderRadius: t.borderRadius["br-2"],
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: t.borderRadius["br-2"],
  },
});
