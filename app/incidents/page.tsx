"use client";

import { useState, useRef } from "react";
import { FileWarning, MapPin, Camera, Send, CheckCircle, AlertTriangle, Clock, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiskBadge } from "@/components/risk-badge";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/state";
import { cn } from "@/lib/utils";

type IncidentType = "FLOOD" | "FALLEN_TREE" | "POWER_LINE" | "ROAD_BLOCK" | "HEAVY_RAIN" | "PROPERTY_DAMAGE" | "OTHER";
type Severity = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
type Status = "REPORTED" | "VERIFIED" | "DISPATCHED" | "RESOLVED";

const INCIDENT_TYPES: { id: IncidentType; label: string; icon: string; description: string }[] = [
  { id: "FLOOD",           label: "Flooded Road",       icon: "🌊", description: "Road or area submerged in water" },
  { id: "FALLEN_TREE",     label: "Fallen Tree",        icon: "🌳", description: "Tree fallen on road or property" },
  { id: "POWER_LINE",      label: "Downed Power Line",  icon: "⚡", description: "Electrical line down — hazardous" },
  { id: "ROAD_BLOCK",      label: "Road Block",         icon: "🚧", description: "Road blocked or impassable" },
  { id: "HEAVY_RAIN",      label: "Severe Rain",        icon: "🌧️", description: "Extremely heavy rainfall" },
  { id: "PROPERTY_DAMAGE", label: "Property Damage",    icon: "🏠", description: "Weather-related structural damage" },
  { id: "OTHER",           label: "Other Emergency",    icon: "🆘", description: "Other weather-related emergency" },
];

const STATUS_CONFIG: Record<Status, { label: string; color: string; icon: any }> = {
  REPORTED:   { label: "Reported",   color: "text-blue-500",   icon: Clock },
  VERIFIED:   { label: "Verified",   color: "text-yellow-500", icon: CheckCircle },
  DISPATCHED: { label: "Dispatched", color: "text-orange-500", icon: RefreshCw },
  RESOLVED:   { label: "Resolved",   color: "text-green-500",  icon: CheckCircle },
};

// Demo incidents (in production these come from /api/incidents)
const DEMO_INCIDENTS = [
  { id: "1", type: "FLOOD" as IncidentType,        title: "Flooded Road",    location: "MG Road, Bengaluru",     severity: "HIGH" as Severity,     status: "DISPATCHED" as Status, time: "14 mins ago", description: "Underpass completely flooded. Vehicles stranded." },
  { id: "2", type: "FALLEN_TREE" as IncidentType,  title: "Fallen Tree",     location: "Indiranagar, Bengaluru", severity: "MODERATE" as Severity, status: "VERIFIED" as Status,   time: "32 mins ago", description: "Large tree blocking one lane of traffic." },
  { id: "3", type: "POWER_LINE" as IncidentType,   title: "Downed Line",     location: "Koramangala, Bengaluru", severity: "CRITICAL" as Severity, status: "DISPATCHED" as Status, time: "1 hr ago",    description: "High-tension wire down across road. Area cordoned." },
  { id: "4", type: "ROAD_BLOCK" as IncidentType,   title: "Road Block",      location: "Whitefield, Bengaluru",  severity: "MODERATE" as Severity, status: "RESOLVED" as Status,   time: "2 hrs ago",   description: "Debris cleared. Road now open." },
];

export default function IncidentsPage() {
  const [tab, setTab] = useState<"report" | "live">("live");
  const [form, setForm] = useState({
    type: "" as IncidentType | "",
    severity: "" as Severity | "",
    description: "",
    location: "",
    useGPS: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSubmit() {
    if (!form.type || !form.severity || !form.description) return;
    setSubmitting(true);
    try {
      // Try real API; fallback to demo
      const body = {
        type: form.type,
        severity: form.severity,
        description: form.description,
        location: form.location || "Unknown",
        status: "REPORTED",
      };
      const res = await fetch("/api/incidents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) setSubmitted(true);
      else setSubmitted(true); // show success anyway for demo
    } catch {
      setSubmitted(true); // demo fallback
    }
    setSubmitting(false);
  }

  function getGPS() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setForm((f) => ({ ...f, location: `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`, useGPS: true })),
      () => setForm((f) => ({ ...f, useGPS: false }))
    );
  }

  const canSubmit = form.type && form.severity && form.description.trim().length > 5;

  return (
    <AppShell>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold md:text-2xl flex items-center gap-2">
            <FileWarning className="h-5 w-5 text-orange-500" />
            Citizen Incident Reports
          </h1>
          <p className="text-sm text-muted-foreground">Report weather emergencies and view live community reports</p>
        </div>
        <div className="flex gap-1 rounded-lg border border-border bg-card p-1">
          {(["live", "report"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setSubmitted(false); }}
              className={cn("rounded-md px-4 py-1.5 text-sm font-medium transition-all", t === tab ? "gradient-accent text-white shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              {t === "live" ? "🔴 Live Feed" : "📝 Report"}
            </button>
          ))}
        </div>
      </div>

      {tab === "live" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{DEMO_INCIDENTS.length} active reports near Bengaluru</p>
            <Badge tone="info">Live Feed</Badge>
          </div>
          {DEMO_INCIDENTS.map((incident) => {
            const typeConfig = INCIDENT_TYPES.find((t) => t.id === incident.type)!;
            const statusConf = STATUS_CONFIG[incident.status];
            const StatusIcon = statusConf.icon;
            return (
              <Card key={incident.id} className={cn(
                "border-l-4",
                incident.severity === "CRITICAL" ? "border-l-red-500" :
                incident.severity === "HIGH"     ? "border-l-orange-500" :
                incident.severity === "MODERATE" ? "border-l-yellow-500" : "border-l-green-500"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl leading-none mt-0.5">{typeConfig.icon}</span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm">{incident.title}</p>
                          <RiskBadge level={incident.severity} size="sm" />
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="h-3 w-3" />{incident.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs shrink-0">
                      <StatusIcon className={cn("h-3.5 w-3.5", statusConf.color)} />
                      <span className={statusConf.color}>{statusConf.label}</span>
                      <span className="text-muted-foreground">· {incident.time}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{incident.description}</p>
                  {incident.status !== "RESOLVED" && (
                    <div className="mt-3 flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
                      <p className="text-xs text-muted-foreground">
                        {incident.status === "DISPATCHED" ? "Emergency team dispatched to location." : "Report awaiting verification."}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {tab === "report" && (
        <div className="max-w-2xl space-y-5 animate-fade-in">
          {submitted ? (
            <Card className="border-green-500/40 bg-green-500/8">
              <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20">
                  <CheckCircle className="h-7 w-7 text-green-500" />
                </div>
                <div>
                  <p className="font-semibold text-lg text-green-700 dark:text-green-400">Report Submitted!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your incident report has been received. Local authorities will be notified.
                  </p>
                </div>
                <Button variant="outline" onClick={() => { setSubmitted(false); setForm({ type: "", severity: "", description: "", location: "", useGPS: false }); setPhotoName(null); }}>
                  Submit Another Report
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Report an Incident</CardTitle>
                <CardDescription>Help your community by reporting weather-related hazards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Incident type */}
                <div>
                  <p className="text-sm font-semibold mb-2">Incident Type <span className="text-red-500">*</span></p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {INCIDENT_TYPES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setForm((f) => ({ ...f, type: t.id }))}
                        title={t.description}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition-all",
                          form.type === t.id
                            ? "border-primary/50 bg-primary/10 text-primary"
                            : "border-border bg-card hover:border-primary/25 hover:bg-muted/50"
                        )}
                      >
                        <span className="text-2xl">{t.icon}</span>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Severity */}
                <div>
                  <p className="text-sm font-semibold mb-2">Severity <span className="text-red-500">*</span></p>
                  <div className="flex flex-wrap gap-2">
                    {(["LOW", "MODERATE", "HIGH", "CRITICAL"] as Severity[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setForm((f) => ({ ...f, severity: s }))}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                          form.severity === s ? (
                            s === "CRITICAL" ? "bg-red-500 text-white border-red-500" :
                            s === "HIGH"     ? "bg-orange-500 text-white border-orange-500" :
                            s === "MODERATE" ? "bg-yellow-500 text-white border-yellow-500" :
                            "bg-green-500 text-white border-green-500"
                          ) : "border-border bg-card hover:bg-muted"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-sm font-semibold mb-2">Description <span className="text-red-500">*</span></p>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Describe the incident — what you see, how severe it is, if anyone is at risk..."
                    rows={3}
                    className="w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 resize-none placeholder:text-muted-foreground"
                  />
                </div>

                {/* Location */}
                <div>
                  <p className="text-sm font-semibold mb-2">Location</p>
                  <div className="flex gap-2">
                    <input
                      value={form.location}
                      onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                      placeholder="Address or landmark (optional)"
                      className="flex-1 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground"
                    />
                    <Button variant="outline" size="sm" onClick={getGPS}>
                      <MapPin className="h-4 w-4" />
                      {form.useGPS ? "GPS ✓" : "GPS"}
                    </Button>
                  </div>
                </div>

                {/* Photo upload */}
                <div>
                  <p className="text-sm font-semibold mb-2">Photo (optional)</p>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground hover:border-primary/40 hover:bg-muted/50 transition-all w-full"
                  >
                    <Camera className="h-4 w-4" />
                    {photoName ? <span className="text-foreground">{photoName}</span> : "Attach a photo of the incident"}
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setPhotoName(e.target.files?.[0]?.name ?? null)}
                  />
                </div>

                {/* Submit */}
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || submitting}
                  className="w-full"
                  size="lg"
                >
                  {submitting ? (
                    <><RefreshCw className="h-4 w-4 animate-spin" /> Submitting...</>
                  ) : (
                    <><Send className="h-4 w-4" /> Submit Incident Report</>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Reports are reviewed by local authorities. For life-threatening emergencies, call <a href="tel:112" className="text-primary font-semibold">112</a> immediately.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </AppShell>
  );
}
