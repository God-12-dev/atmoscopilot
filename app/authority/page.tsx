"use client";

import { useState } from "react";
import {
  Shield, AlertTriangle, Users, MapPin, Radio, BarChart3,
  Send, CheckCircle, FileWarning, Clock, Zap, Phone, RefreshCw
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiskBadge } from "@/components/risk-badge";
import { Button } from "@/components/ui/button";
import { PrototypeBanner } from "@/components/state";
import { cn } from "@/lib/utils";

const MOCK_STATS = [
  { label: "Active Alerts",     value: "3",   icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/10" },
  { label: "Citizen Reports",   value: "12",  icon: FileWarning,   color: "text-blue-500",   bg: "bg-blue-500/10" },
  { label: "Shelters Active",   value: "7",   icon: Shield,        color: "text-green-500",  bg: "bg-green-500/10" },
  { label: "Teams Deployed",    value: "4",   icon: Users,         color: "text-purple-500", bg: "bg-purple-500/10" },
];

const MOCK_INCIDENTS = [
  { id: "1", type: "🌊 Flooded Road",    location: "MG Road, Zone 3",       severity: "HIGH" as const,     status: "DISPATCHED",  time: "14 min ago" },
  { id: "2", type: "🌳 Fallen Tree",     location: "Indiranagar, Zone 5",   severity: "MODERATE" as const, status: "VERIFIED",    time: "32 min ago" },
  { id: "3", type: "⚡ Downed Powerline", location: "Koramangala, Zone 2",  severity: "CRITICAL" as const, status: "DISPATCHED",  time: "1 hr ago" },
  { id: "4", type: "🚧 Road Block",      location: "Whitefield, Zone 8",    severity: "LOW" as const,      status: "RESOLVED",    time: "2 hr ago" },
];

const MOCK_SHELTERS = [
  { name: "Govt School, Zone 3",   capacity: 200, occupied: 45,  status: "OPEN" },
  { name: "Community Hall, Zone 5",capacity: 150, occupied: 12,  status: "OPEN" },
  { name: "Relief Camp A-7",       capacity: 500, occupied: 230, status: "OPEN" },
  { name: "Municipal Hall, Zone 1",capacity: 100, occupied: 100, status: "FULL" },
];

const ALERT_TYPES = ["Flash Flood Warning", "Heavy Rainfall Advisory", "High Wind Alert", "Heat Wave Warning", "Evacuation Notice", "All Clear"];
const SEVERITIES = ["INFO", "WATCH", "WARNING", "CRITICAL"];
const CHANNELS = ["Web Platform", "SMS", "WhatsApp", "Push Notification"];
const REGIONS = ["All Zones", "Zone 1 — Central", "Zone 2 — North", "Zone 3 — South", "Zone 4 — East", "Zone 5 — West"];

export default function AuthorityPage() {
  const [alertType, setAlertType] = useState("Flash Flood Warning");
  const [severity, setSeverity] = useState("WARNING");
  const [region, setRegion] = useState("All Zones");
  const [message, setMessage] = useState("");
  const [channels, setChannels] = useState<string[]>(["Web Platform"]);
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcasted, setBroadcasted] = useState(false);

  function toggleChannel(ch: string) {
    setChannels((prev) => prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]);
  }

  async function broadcast() {
    if (!message.trim()) return;
    setBroadcasting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setBroadcasting(false);
    setBroadcasted(true);
    setTimeout(() => setBroadcasted(false), 4000);
  }

  return (
    <AppShell>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold md:text-2xl flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Authority Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">Emergency management command centre — NDRF / SDMA / District authority</p>
        </div>
        <Badge tone="danger" className="animate-pulse">🔴 Live Operations</Badge>
      </div>

      <PrototypeBanner feature="Authority dashboard data" />

      <div className="space-y-5 animate-fade-in">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {MOCK_STATS.map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", bg)}>
                    <Icon className={cn("h-4.5 w-4.5", color)} style={{ height: 18, width: 18 }} />
                  </div>
                </div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {/* Active incidents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileWarning className="h-4 w-4 text-orange-500" />
                  Active Citizen Reports
                </CardTitle>
                <CardDescription>Incoming from the Citizen Reporting module</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {MOCK_INCIDENTS.map((inc) => (
                  <div key={inc.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div>
                        <p className="text-sm font-medium">{inc.type}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{inc.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground">{inc.time}</span>
                      <RiskBadge level={inc.severity} size="sm" showIcon={false} />
                      <select
                        defaultValue={inc.status}
                        className="rounded-lg border border-border bg-muted/40 px-2 py-1 text-xs outline-none focus:border-primary/50"
                      >
                        {["REPORTED", "VERIFIED", "DISPATCHED", "RESOLVED"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Broadcast alert */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-red-500" />
                  Broadcast Emergency Alert
                </CardTitle>
                <CardDescription>Send alerts across all enabled channels</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {broadcasted && (
                  <div className="flex items-center gap-2 rounded-xl border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    Alert broadcast successfully to {channels.join(", ")}.
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">Alert Type</p>
                    <select
                      value={alertType}
                      onChange={(e) => setAlertType(e.target.value)}
                      className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm outline-none focus:border-primary/50"
                    >
                      {ALERT_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">Severity</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {SEVERITIES.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSeverity(s)}
                          className={cn(
                            "rounded-full border px-2.5 py-1 text-xs font-semibold transition-all",
                            severity === s ? (
                              s === "CRITICAL" ? "bg-red-500 text-white border-red-500" :
                              s === "WARNING"  ? "bg-orange-500 text-white border-orange-500" :
                              s === "WATCH"    ? "bg-yellow-500 text-white border-yellow-500" :
                              "bg-blue-500 text-white border-blue-500"
                            ) : "border-border bg-card hover:bg-muted"
                          )}
                        >{s}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5">Target Region</p>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm outline-none focus:border-primary/50"
                  >
                    {REGIONS.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5">Alert Message</p>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    placeholder="Type the emergency alert message here…"
                    className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm outline-none focus:border-primary/50 resize-none placeholder:text-muted-foreground"
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Broadcast Channels</p>
                  <div className="flex flex-wrap gap-2">
                    {CHANNELS.map((ch) => (
                      <button
                        key={ch}
                        onClick={() => toggleChannel(ch)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                          channels.includes(ch) ? "gradient-accent text-white border-transparent" : "border-border bg-card hover:bg-muted"
                        )}
                      >{ch}</button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={broadcast}
                  disabled={!message.trim() || channels.length === 0 || broadcasting}
                  variant="danger"
                  className="w-full"
                  size="lg"
                >
                  {broadcasting ? (
                    <><RefreshCw className="h-4 w-4 animate-spin" />Broadcasting…</>
                  ) : (
                    <><Send className="h-4 w-4" />Broadcast Alert to {channels.length} channel{channels.length !== 1 ? "s" : ""}</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Shelter status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  Shelter Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {MOCK_SHELTERS.map((s) => {
                  const pct = Math.round((s.occupied / s.capacity) * 100);
                  const full = s.status === "FULL";
                  return (
                    <div key={s.name} className="rounded-xl border border-border bg-card/50 p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-xs font-medium leading-tight">{s.name}</p>
                        <Badge tone={full ? "danger" : "success"}>{s.status}</Badge>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", full ? "bg-red-500" : pct > 70 ? "bg-yellow-500" : "bg-green-500")}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{s.occupied}/{s.capacity} occupied ({pct}%)</p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Quick actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {[
                  { label: "Call NDRF Control",     number: "011-24363260", icon: Phone },
                  { label: "State EOC Hotline",      number: "1070",         icon: Radio },
                  { label: "National Emergency",     number: "112",          icon: Zap },
                ].map(({ label, number, icon: Icon }) => (
                  <a key={label} href={`tel:${number}`} className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2.5 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="text-xs">{label}</span>
                    </div>
                    <span className="text-xs font-bold text-primary">{number}</span>
                  </a>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
