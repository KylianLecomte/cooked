import { useState } from "react";
import { View } from "react-native";
import { twMerge } from "tailwind-merge";
import CkdSelectableCard, { SelectableCardClassNames } from "./CkdSelectableCard";

type SelectCardGroupProps<T> = Readonly<{
  classNames?: SelectableCardClassNames;
  containerClassName?: string;
  cardContents: { id: number | string; data?: T; content: React.ReactNode }[];
  onSelect: (param: T | number | string) => void;
}>;

export default function CkdSelectCardGroup<T>({
  classNames,
  containerClassName,
  onSelect,
  cardContents,
}: SelectCardGroupProps<T>) {
  const [selectedId, setSelectedId] = useState<number | string | null>(null);

  return (
    <View className={twMerge("gap-2", containerClassName)}>
      {cardContents.map((content) => (
        <CkdSelectableCard
          classNames={classNames}
          key={content.id}
          cardContent={content}
          isSelected={selectedId === content.id}
          onSelect={(param) => {
            setSelectedId(content.id);
            onSelect(param);
          }}
        />
      ))}
    </View>
  );
}
