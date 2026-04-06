import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[var(--zen-sage-light)] text-[var(--zen-sage-dark)]",
        secondary: "bg-[var(--zen-surface-2)] text-[var(--zen-muted)] border border-[var(--zen-border)]",
        blue: "bg-[var(--zen-blue-light)] text-[#3a6fcb]",
        live: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        offline: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
        danger: "bg-[var(--zen-error-light)] text-[var(--zen-error)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
