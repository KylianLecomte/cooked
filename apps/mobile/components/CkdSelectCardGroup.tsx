import { View } from "react-native";
import { twMerge } from "tailwind-merge";
import CkdSelectableCard, { SelectableCardClassNames } from "./CkdSelectableCard";

type SelectCardGroupProps<T> = Readonly<{
  classNames?: SelectableCardClassNames;
  containerClassName?: string;
  selectedId: number | string | null;
  cardContents: { id: number | string; data?: T; content: React.ReactNode }[];
  onSelect: (param: T | number | string) => void;
}>;

export default function CkdSelectCardGroup<T>({
  classNames,
  containerClassName,
  selectedId,
  onSelect,
  cardContents,
}: SelectCardGroupProps<T>) {
  return (
    <View className={twMerge("gap-2", containerClassName)}>
      {cardContents.map((content) => (
        <CkdSelectableCard
          classNames={classNames}
          key={content.id}
          cardContent={content}
          isSelected={selectedId === content.id}
          onSelect={onSelect}
        />
      ))}
    </View>
  );
}
