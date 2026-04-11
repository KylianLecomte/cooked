import { twMerge } from "tailwind-merge";
import { CardVariants } from "@/theme/variant.style";
import CkdButton from "./CkdButton";

export type SelectableCardClassNames = {
  btnCommon?: string;
  btnNotSelected?: string;
  btnSelected?: string;
};

type SelectableCardProps<T> = Readonly<{
  classNames?: SelectableCardClassNames;
  cardContent: { id: number | string; data?: T; content: React.ReactNode };
  isSelected?: boolean;
  onSelect: (param: T | number | string) => void;
}>;

export default function CkdSelectableCard<T>({
  classNames,
  cardContent,
  isSelected = false,
  onSelect,
}: SelectableCardProps<T>) {
  return (
    <CkdButton
      containerClassName={twMerge(
        CardVariants.main,
        classNames?.btnCommon,
        isSelected ? classNames?.btnSelected : classNames?.btnNotSelected,
      )}
      onPress={() => onSelect(cardContent.data || cardContent.id)}
    >
      {cardContent.content}
    </CkdButton>
  );
}
