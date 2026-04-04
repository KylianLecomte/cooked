import { View } from "react-native";
import { ChildrenProps } from "@/types/props.type";

type CardProps = ChildrenProps;

export default function Card({ children }: CardProps) {
  return (
    <View className={`p-4 bg-ckd-surface-1 rounded-ckd-br-11 border border-ckd-border-1`}>
      {children}
    </View>
  );
}
