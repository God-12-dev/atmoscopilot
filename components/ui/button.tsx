import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:   "gradient-accent text-white shadow-sm hover:opacity-90 glow-sm",
        outline:   "border border-border bg-card hover:bg-muted hover:border-primary/40",
        ghost:     "hover:bg-muted hover:text-foreground",
        danger:    "bg-red-500/10 text-red-600 border border-red-500/30 hover:bg-red-500/20 dark:text-red-400",
        success:   "bg-green-500/10 text-green-700 border border-green-500/30 hover:bg-green-500/20 dark:text-green-400",
        secondary: "bg-muted text-muted-foreground hover:bg-muted/80",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm:      "h-8 px-3 text-xs",
        lg:      "h-11 px-6 text-base",
        icon:    "h-9 w-9",
        "icon-sm": "h-7 w-7",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
  )
);
Button.displayName = "Button";
