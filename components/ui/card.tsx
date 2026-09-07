import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function Card({
  className,
  plain,
  elevated,
  ...props
}: HTMLAttributes<HTMLDivElement> & { plain?: boolean; elevated?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card text-card-foreground transition-shadow duration-200",
        elevated ? "shadow-elevated" : "shadow-card hover:shadow-card-hover",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pb-2", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-base font-semibold leading-tight tracking-tight", className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground mt-0.5", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pt-2", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pt-0 flex items-center", className)} {...props} />;
}
