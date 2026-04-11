import { Pressable, Text } from "react-native";
import { twMerge } from "tailwind-merge";

type ButtonProps = {
  onPress: () => void;
  children: React.ReactNode;
  containerClassName?: string;
  textClassName?: string;
};

export default function Button({
  onPress,
  children,
  containerClassName,
  textClassName,
}: Readonly<ButtonProps>) {
  return (
    <Pressable
      className={twMerge(
        "self-start rounded-lg min-w-8 min-h-8 w-fit items-center justify-center",
        containerClassName,
      )}
      onPress={onPress}
    >
      <Text className={textClassName}>{children}</Text>
    </Pressable>
  );
}
