import { Pressable } from "react-native";
import { twMerge } from "tailwind-merge";

type ButtonProps = {
  onPress: () => void;
  children: React.ReactNode;
  containerClassName?: string;
};

export default function Button({ onPress, children, containerClassName }: Readonly<ButtonProps>) {
  return (
    <Pressable
      className={twMerge(
        "self-start rounded-lg min-w-8 min-h-8 w-fit items-center justify-center",
        containerClassName,
      )}
      onPress={onPress}
    >
      {children}
    </Pressable>
  );
}
