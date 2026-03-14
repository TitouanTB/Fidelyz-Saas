import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors",
  {
    variants: {
      variant: {
        default: "bg-white/5 text-text-secondary border-white/8",
        violet: "bg-violet-default/15 text-violet-glow border-violet-default/20",
        success: "bg-success/15 text-success border-success/20",
        warning: "bg-warning/15 text-warning border-warning/20",
        destructive: "bg-danger/15 text-danger border-danger/20",
        outline: "border-white/10 text-text-secondary bg-transparent",
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

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
