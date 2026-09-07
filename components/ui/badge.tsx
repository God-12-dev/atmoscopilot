import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type BadgeTone = "default" | "success" | "caution" | "warning" | "danger" | "info" | "primary";

const toneClasses: Record<BadgeTone, string> = {
  default: "bg-muted text-muted-foreground border-border",
  success: "risk-low border",
  caution: "risk-moderate border",
  warning: "risk-high border",
  danger:  "risk-critical border",
  info:    "risk-info border",
  primary: "bg-primary/10 text-primary border-primary/25 border",
};

export function Badge({
  className,
  tone = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
