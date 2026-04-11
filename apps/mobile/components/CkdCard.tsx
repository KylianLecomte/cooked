import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { View } from "react-native";
import Button from "@/components/CkdButton";
import { colors } from "@/theme/colors.style";
import { buttonVariants } from "@/theme/variant.style";

type CardProps = Readonly<{
  titleLeft?: React.ReactNode;
  titleRight?: React.ReactNode;
  content?: React.ReactNode;
  closable?: boolean;
}>;

export default function CkdCard({ titleLeft, titleRight, content, closable = false }: CardProps) {
  const [open, setOpen] = useState(true);

  return (
    <View className="p-4 bg-ckd-surface-1 rounded-lg border border-ckd-border-1">
      <View className="flex-row justify-between items-center">
        {titleLeft}
        <View className="flex-row gap-2 justify-center">
          {titleRight}
          {closable ? (
            <Button
              containerClassName={buttonVariants.iconBorderLess.containerClassName}
              textClassName={buttonVariants.iconBorderLess.textClassName}
              onPress={() => setOpen(!open)}
            >
              {open ? (
                <Ionicons name="chevron-down-sharp" size={18} color={colors.main} />
              ) : (
                <Ionicons name="chevron-up-outline" size={18} color={colors.main} />
              )}
            </Button>
          ) : null}
        </View>
      </View>
      {(closable && open) || !closable ? <View className="mt-2">{content}</View> : null}
    </View>
  );
}
