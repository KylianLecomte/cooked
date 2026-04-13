import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { View } from "react-native";
import Button from "@/components/CkdButton";
import { colors } from "@/theme/colors.style";
import { ButtonVariants, CardVariants } from "@/theme/variant.style";

type CardProps = Readonly<{
  titleLeft?: React.ReactNode;
  titleRight?: React.ReactNode;
  content?: React.ReactNode;
  closable?: boolean;
}>;

export default function CkdCard({ titleLeft, titleRight, content, closable = false }: CardProps) {
  const [open, setOpen] = useState(true);

  const hasTitle = titleLeft || titleRight;

  return (
    <View className={CardVariants.primary}>
      {hasTitle && (
        <View className="flex-row justify-between items-center">
          {titleLeft}
          <View className="flex-row gap-2 justify-center">
            {titleRight}
            {closable ? (
              <Button
                containerClassName={ButtonVariants.iconBorderLess.containerClassName}
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
      )}
      {(closable && open) || !closable ? (
        <View className={hasTitle ? "mt-2" : ""}>{content}</View>
      ) : null}
    </View>
  );
}
