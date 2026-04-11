export const ButtonVariants = {
  secondary: {
    containerClassName: "bg-ckd-orange-s border border-ckd-orange-s",
    textClassName: "text-ckd-orange",
  },
  iconBorderLess: {
    containerClassName: "bg-transparent border-0",
    textClassName: "text-ckd-orange",
  },
} as const;

export const CardVariants = {
  main: "p-4 bg-ckd-surface-1 rounded-lg border border-ckd-border-1",
} as const;
