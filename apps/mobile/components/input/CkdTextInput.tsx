import { TextInput } from "react-native";
import { twMerge } from "tailwind-merge";

type CkdTextInputProps = Readonly<{
  className?: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  maxLength?: number;
  keyboardType?:
    | "default"
    | "email-address"
    | "numeric"
    | "phone-pad"
    | "number-pad"
    | "decimal-pad";
}>;

export default function CkdTextInput({
  className,
  placeholder,
  value,
  onChangeText,
  maxLength,
  keyboardType = "default",
}: CkdTextInputProps) {
  return (
    <TextInput
      className={twMerge(
        "bg-ckd-input-bg border rounded-lg border-ckd-input-border text-ckd-text p-2 text-center text-base placeholder:text-ckd-placeholder",
        className,
      )}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      maxLength={maxLength}
      keyboardType={keyboardType}
    />
  );
}
