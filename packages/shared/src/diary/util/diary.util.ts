import { DIARY_ENTRY_MACRO_SUMMARY_EMPTY } from "../dto/diary.dto";

export const createEmptySummary = () => ({
  macrosTotals: { ...DIARY_ENTRY_MACRO_SUMMARY_EMPTY },
  macrosByMeal: {
    BREAKFAST: { ...DIARY_ENTRY_MACRO_SUMMARY_EMPTY },
    LUNCH: { ...DIARY_ENTRY_MACRO_SUMMARY_EMPTY },
    DINNER: { ...DIARY_ENTRY_MACRO_SUMMARY_EMPTY },
    SNACK: { ...DIARY_ENTRY_MACRO_SUMMARY_EMPTY },
  },
});
