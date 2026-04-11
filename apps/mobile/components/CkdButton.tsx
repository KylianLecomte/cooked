import { Pressable } from "react-native";
import { twMerge } from "tailwind-merge";

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
      className={twMerge(
        "self-start rounded-lg min-w-8 min-h-8 w-fit items-center justify-center",
        containerClassName,
      )}
      onPress={onPress}
      disabled={disabled}
    >
      {children}
    </Pressable>
  );
}
