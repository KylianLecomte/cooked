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
  primary: "p-4 bg-ckd-surface-1 rounded-lg border border-ckd-border-1",
} as const;

export const InputVariants = {
  primary: "bg-ckd-input-bg border border-ckd-input-border rounded-lg p-4 text-ckd-text",
  secondary: "bg-ckd-main-color-s border border-ckd-main-color rounded-lg p-4 text-ckd-main-color",
} as const;
