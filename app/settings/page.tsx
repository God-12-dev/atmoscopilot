"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  User, Palette, Gauge, Globe, Bell, Shield, CheckCircle, Sun, Moon, Monitor, Save, Loader2
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/state";
import { cn } from "@/lib/utils";

interface UserSettings {
  name: string | null;
  email: string;
  tempUnit: "C" | "F";
  windUnit: "kmh" | "mph";
  weatherAlerts: boolean;
  dailyForecast: boolean;
  language: string;
}

const LANGUAGES = [
  { code: "en", label: "English",          native: "English" },
  { code: "kn", label: "Kannada",          native: "ಕನ್ನಡ" },
  { code: "hi", label: "Hindi",            native: "हिन्दी" },
  { code: "te", label: "Telugu",           native: "తెలుగు" },
  { code: "ta", label: "Tamil",            native: "தமிழ்" },
  { code: "ml", label: "Malayalam",        native: "മലയാളം" },
  { code: "mr", label: "Marathi",          native: "मराठी" },
  { code: "bn", label: "Bengali",          native: "বাংলা" },
];

function SettingSection({ icon: Icon, title, description, children }: {
  icon: any; title: string; description?: string; children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            {description && <CardDescription className="text-xs mt-0.5">{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        checked ? "bg-primary" : "bg-muted-foreground/30"
      )}
    >
      <span className={cn(
        "inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
        checked ? "translate-x-4" : "translate-x-0"
      )} />
    </button>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => { if (d.user) setSettings(d.user); })
      .catch(() => setError("Could not load settings."));
  }, []);

  async function update(partial: Partial<UserSettings>) {
    if (!settings) return;
    setSettings({ ...settings, ...partial });
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partial),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* silent */ }
    setSaving(false);
  }

  if (!settings) return <AppShell><LoadingState label="Loading settings..." /></AppShell>;

  const THEMES = [
    { value: "light",  label: "Light",  icon: Sun },
    { value: "dark",   label: "Dark",   icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ] as const;

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your preferences and account</p>
        </div>
        {(saving || saved) && (
          <div className={cn(
            "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
            saved ? "border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-400"
                  : "border-border text-muted-foreground"
          )}>
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
            {saving ? "Saving…" : "Saved"}
          </div>
        )}
      </div>

      <div className="max-w-xl space-y-4 animate-fade-in">

        {/* Profile */}
        <SettingSection icon={User} title="Profile" description="Your account information">
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
              <div className="gradient-accent flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shrink-0">
                {settings.name?.[0]?.toUpperCase() ?? settings.email[0].toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-sm">{settings.name ?? "No name set"}</p>
                <p className="text-xs text-muted-foreground">{settings.email}</p>
              </div>
            </div>
          </div>
        </SettingSection>

        {/* Appearance */}
        <SettingSection icon={Palette} title="Appearance" description="Choose your preferred theme">
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border p-3 text-xs font-medium transition-all",
                  theme === value
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border bg-card hover:border-primary/25 hover:bg-muted/50"
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
                {theme === value && <span className="text-[10px] opacity-70">Active</span>}
              </button>
            ))}
          </div>
        </SettingSection>

        {/* Units */}
        <SettingSection icon={Gauge} title="Units" description="Display units for weather data">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Temperature</p>
                <p className="text-xs text-muted-foreground">How temperature is displayed</p>
              </div>
              <div className="flex gap-1 rounded-lg border border-border bg-muted p-1">
                {(["C", "F"] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => update({ tempUnit: u })}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
                      settings.tempUnit === u ? "gradient-accent text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    °{u}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Wind Speed</p>
                <p className="text-xs text-muted-foreground">How wind speed is displayed</p>
              </div>
              <div className="flex gap-1 rounded-lg border border-border bg-muted p-1">
                {(["kmh", "mph"] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => update({ windUnit: u })}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
                      settings.windUnit === u ? "gradient-accent text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {u === "kmh" ? "km/h" : "mph"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SettingSection>

        {/* Language */}
        <SettingSection icon={Globe} title="Language" description="Default language for AI assistant responses">
          <div className="grid grid-cols-2 gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => update({ language: l.code })}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-all",
                  settings.language === l.code
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border bg-card hover:border-primary/25 hover:bg-muted/50"
                )}
              >
                <span className="text-base leading-none">{l.native[0]}</span>
                <div>
                  <p className="text-xs font-semibold">{l.native}</p>
                  <p className="text-[10px] text-muted-foreground">{l.label}</p>
                </div>
                {settings.language === l.code && <CheckCircle className="ml-auto h-3.5 w-3.5 text-primary shrink-0" />}
              </button>
            ))}
          </div>
        </SettingSection>

        {/* Notifications */}
        <SettingSection icon={Bell} title="Notifications" description="Control which updates you receive">
          <div className="space-y-3">
            {[
              { key: "weatherAlerts",  label: "Weather Alerts",   desc: "Severe weather warnings and watches" },
              { key: "dailyForecast",  label: "Daily Forecast",   desc: "Morning summary of the day's weather" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <Toggle
                  checked={settings[key as keyof UserSettings] as boolean}
                  onChange={(v) => update({ [key]: v } as any)}
                />
              </div>
            ))}
          </div>
        </SettingSection>

        {/* Privacy */}
        <SettingSection icon={Shield} title="Privacy & Data">
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>• Location data is used only to fetch weather for your selected location.</p>
            <p>• AI conversations may be stored to provide history. No data is shared with advertisers.</p>
            <p>• Weather API calls are proxied server-side — your API keys are never exposed to the browser.</p>
            <p className="pt-1 text-primary">WeatherGPT is ad-free and does not sell user data.</p>
          </div>
        </SettingSection>

      </div>
    </AppShell>
  );
}
