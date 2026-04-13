import { Pressable } from "react-native";
import { twMerge } from "tailwind-merge";
import { ButtonVariants } from "@/theme/variant.style";

type ButtonProps = {
  onPress: () => void;
  children: React.ReactNode;
  containerClassName?: string;
  disabled?: boolean;
};

export default function Button({
  onPress,
  children,
  containerClassName,
  disabled = false,
}: Readonly<ButtonProps>) {
  return (
    <Pressable
      className={twMerge(ButtonVariants.common.containerClassName, containerClassName)}
      onPress={onPress}
      disabled={disabled}
    >
      {children}
    </Pressable>
  );
}
