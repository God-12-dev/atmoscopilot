"use client";

import { useState } from "react";
import { Info, AlertTriangle, ShieldAlert, ClipboardList, Users, Wheat, Shield } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { LocationSearch } from "@/components/location-search";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState, ConfigErrorState, ErrorState, EmptyState } from "@/components/state";
import { useSelectedLocation } from "@/lib/use-location";
import { useWeatherData } from "@/lib/use-weather";
import { buildAdvisories, type Advisory } from "@/lib/advisories";
import { cn } from "@/lib/utils";

const TABS: { key: Advisory["audience"]; label: string; icon: any }[] = [
  { key: "citizen",  label: "Citizens",    icon: Users },
  { key: "farmer",   label: "Farmers",     icon: Wheat },
  { key: "disaster", label: "Emergency",   icon: Shield },
];

const LEVEL_CONFIG: Record<Advisory["level"], { cls: string; Icon: any; tone: any }> = {
  info:    { cls: "border-blue-500/30 bg-blue-500/8",   Icon: Info,         tone: "info" },
  caution: { cls: "border-yellow-500/30 bg-yellow-500/8", Icon: AlertTriangle, tone: "caution" },
  warning: { cls: "border-red-500/30 bg-red-500/8",     Icon: ShieldAlert,  tone: "danger" },
};

export default function AdvisoriesPage() {
  const { location, setLocation, ready } = useSelectedLocation();
  const { current, hourly, alerts, loading, error, isConfigError } = useWeatherData(location);
  const [tab, setTab] = useState<Advisory["audience"]>("citizen");

  const advisories = current ? buildAdvisories({ current, hourly, alerts }) : [];
  const filtered = advisories.filter((a) => a.audience === tab);
  const counts = {
    citizen: advisories.filter((a) => a.audience === "citizen").length,
    farmer: advisories.filter((a) => a.audience === "farmer").length,
    disaster: advisories.filter((a) => a.audience === "disaster").length,
  };

  return (
    <AppShell>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold md:text-2xl flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Advisories{location ? ` — ${location.name}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground">Rule-based recommendations generated from live weather data</p>
        </div>
        <LocationSearch onSelect={setLocation} />
      </div>

      <div className="mb-4 flex items-start gap-2 rounded-xl border border-blue-500/30 bg-blue-500/8 px-4 py-3 text-xs text-muted-foreground">
        <Info className="h-3.5 w-3.5 shrink-0 text-blue-500 mt-0.5" />
        These are rule-based recommendations generated from real weather data — not official government warnings.
        For severe events, always follow IMD and local authority guidance.
      </div>

      {ready && !location && <EmptyState icon={ClipboardList} message="Select a location to see weather advisories." />}
      {location && isConfigError && error && <ConfigErrorState message={error} />}
      {location && !isConfigError && error && <ErrorState message={error} />}
      {location && loading && <LoadingState label="Building advisories..." />}

      {current && (
        <div className="animate-fade-in">
          {/* Tab row */}
          <div className="mb-5 flex gap-1 rounded-xl border border-border bg-card p-1 w-fit">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all",
                  tab === key ? "gradient-accent text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
                {counts[key] > 0 && (
                  <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-bold", tab === key ? "bg-white/25 text-white" : "bg-muted text-muted-foreground")}>
                    {counts[key]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Advisory cards */}
          {filtered.length === 0 ? (
            <EmptyState icon={Info} message={`No ${tab} advisories for current conditions. Conditions look generally safe.`} />
          ) : (
            <div className="space-y-3">
              {filtered.map((a, i) => {
                const { cls, Icon, tone } = LEVEL_CONFIG[a.level];
                return (
                  <div key={i} className={cn("flex items-start gap-4 rounded-xl border p-4", cls)}>
                    <div className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                      a.level === "warning" ? "bg-red-500/15" : a.level === "caution" ? "bg-yellow-500/15" : "bg-blue-500/15"
                    )}>
                      <Icon className={cn("h-4.5 w-4.5",
                        a.level === "warning" ? "text-red-500" : a.level === "caution" ? "text-yellow-500" : "text-blue-500"
                      )} style={{ height: 18, width: 18 }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-semibold text-sm">{a.title}</p>
                        <Badge tone={tone}>{a.level === "warning" ? "Warning" : a.level === "caution" ? "Caution" : "Info"}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{a.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="mt-4 text-xs text-muted-foreground text-center">
            {advisories.length} total advisories · Based on live OpenWeather data · Updated in real-time
          </p>
        </div>
      )}
    </AppShell>
  );
}
