import { cn } from "@/lib/utils";
import { ShieldCheck, AlertTriangle, AlertOctagon, Info } from "lucide-react";

type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL" | "INFO";

interface Props {
  level: RiskLevel;
  label?: string;
  showIcon?: boolean;
  className?: string;
  size?: "sm" | "md";
}

const config: Record<RiskLevel, { cls: string; Icon: any; defaultLabel: string }> = {
  LOW:      { cls: "risk-low border",      Icon: ShieldCheck,    defaultLabel: "Low Risk" },
  MODERATE: { cls: "risk-moderate border", Icon: AlertTriangle,  defaultLabel: "Moderate" },
  HIGH:     { cls: "risk-high border",     Icon: AlertTriangle,  defaultLabel: "High Risk" },
  CRITICAL: { cls: "risk-critical border", Icon: AlertOctagon,   defaultLabel: "Critical" },
  INFO:     { cls: "risk-info border",     Icon: Info,           defaultLabel: "Info" },
};

export function RiskBadge({ level, label, showIcon = true, className, size = "md" }: Props) {
  const { cls, Icon, defaultLabel } = config[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        cls,
        className
      )}
    >
      {showIcon && <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />}
      {label ?? defaultLabel}
    </span>
  );
}
