import { StyleSheet, Text, View } from "react-native";
import * as primitives from "@/theme/primitive.style";
import * as tokens from "@/theme/token.style";

type CardProps = {
  readonly style?: object;
};

export default function Card({ style }: CardProps) {
  return (
    <View style={[style, styles.card]}>
      <Text style={[style, styles.title]}>CALORIES & MACROS</Text>
      <Text style={[style, styles.title]}>2350 kcal obj.</Text>

      <Text style={[style, styles.title]}>1260 KCAL</Text>
      <Text style={[style, styles.libelle]}>1080 kcal restant</Text>

      <Text style={[style, styles.libelle, styles.proteine]}>Protéines</Text>
      <Text style={[style, styles.title, styles.proteine]}>98/176g</Text>
      <Text style={[style, styles.libelle, styles.glucide]}>Glucides</Text>
      <Text style={[style, styles.title, styles.glucide]}>250/500g</Text>

      <Text style={[style, styles.libelle, styles.lipide]}>Lipides</Text>
      <Text style={[style, styles.title, styles.lipide]}>42/78g</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: tokens.colors.s1,
    ...primitives.border.base,
    ...primitives.spacing.base,
  },
  title: {
    color: tokens.colors.tx,
    fontSize: tokens.fontSize.fs10.fontSize,
    lineHeight: tokens.fontSize.fs10.lineHeight,
    fontFamily: tokens.fontFamily.mono,
    marginBottom: 2,
  },
  libelle: {
    color: tokens.colors.tx,
    fontSize: tokens.fontSize.fs12.fontSize,
    lineHeight: tokens.fontSize.fs12.lineHeight,
    fontFamily: tokens.fontFamily.sans,
    marginBottom: 4,
  },
  proteine: {
    ...primitives.colors.proteine,
  },
  glucide: {
    ...primitives.colors.glucide,
  },
  lipide: {
    ...primitives.colors.lipide,
  },
});
