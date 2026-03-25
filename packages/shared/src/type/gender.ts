import { TypesValuesOf } from "./generics.type";

export const Gender = { MALE: "MALE", FEMALE: "FEMALE", OTHER: "OTHER" } as const;
export type Gender = TypesValuesOf<typeof Gender>;
export const GENDERS = Object.values(Gender);

export const GENDER_LABELS: Record<Gender, string> = {
  MALE: "Homme",
  FEMALE: "Femme",
  OTHER: "Autre",
};
