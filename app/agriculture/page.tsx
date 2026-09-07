"use client";

import { useState } from "react";
import { Wheat, Droplets, Thermometer, Wind, AlertTriangle, CheckCircle, Info, Languages } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { LocationSearch } from "@/components/location-search";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiskBadge } from "@/components/risk-badge";
import { Button } from "@/components/ui/button";
import { LoadingState, ConfigErrorState, ErrorState, PrototypeBanner } from "@/components/state";
import { useSelectedLocation } from "@/lib/use-location";
import { useWeatherData } from "@/lib/use-weather";
import { cn } from "@/lib/utils";

const CROPS = [
  { id: "rice",    label: "Rice / Paddy",  icon: "🌾", optTemp: [22, 32], maxHumidity: 80, maxRain: 60 },
  { id: "tomato",  label: "Tomato",        icon: "🍅", optTemp: [18, 28], maxHumidity: 70, maxRain: 40 },
  { id: "cotton",  label: "Cotton",        icon: "🌱", optTemp: [20, 35], maxHumidity: 65, maxRain: 30 },
  { id: "wheat",   label: "Wheat",         icon: "🌿", optTemp: [15, 25], maxHumidity: 70, maxRain: 35 },
  { id: "sugarcane", label: "Sugarcane",   icon: "🎋", optTemp: [22, 38], maxHumidity: 75, maxRain: 55 },
  { id: "maize",   label: "Maize / Corn",  icon: "🌽", optTemp: [18, 30], maxHumidity: 72, maxRain: 45 },
];

const LANGUAGES: Record<string, { label: string; code: string }> = {
  en: { label: "English", code: "en" },
  kn: { label: "ಕನ್ನಡ", code: "kn" },
  hi: { label: "हिन्दी", code: "hi" },
  te: { label: "తెలుగు", code: "te" },
  ta: { label: "தமிழ்", code: "ta" },
  ml: { label: "മലയാളം", code: "ml" },
  mr: { label: "मराठी", code: "mr" },
  bn: { label: "বাংলা", code: "bn" },
};

function getAgriAdvice(crop: typeof CROPS[0], tempC: number, humidity: number, rainChance: number, windKph: number): { issues: string[]; recommendations: string[]; diseaseRisk: "LOW" | "MODERATE" | "HIGH" | "CRITICAL"; irrigationNeeded: boolean; sprayRecommended: boolean; harvestSafe: boolean } {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let diseaseRisk: "LOW" | "MODERATE" | "HIGH" | "CRITICAL" = "LOW" as "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  let irrigationNeeded = false;
  let sprayRecommended = false;
  let harvestSafe = true;

  // Temperature analysis
  if (tempC < crop.optTemp[0]) {
    issues.push(`Temperature (${Math.round(tempC)}°C) below optimal range (${crop.optTemp[0]}–${crop.optTemp[1]}°C)`);
    recommendations.push("Consider mulching to retain soil warmth.");
  } else if (tempC > crop.optTemp[1]) {
    issues.push(`Temperature (${Math.round(tempC)}°C) above optimal range — heat stress risk`);
    recommendations.push("Increase irrigation frequency. Apply shade nets if available.");
    diseaseRisk = "MODERATE";
  }

  // Humidity & disease risk
  if (humidity > crop.maxHumidity) {
    issues.push(`High humidity (${humidity}%) — fungal disease risk elevated`);
    diseaseRisk = humidity > 85 ? "HIGH" : "MODERATE";
    recommendations.push("Improve field drainage. Monitor for fungal/blight symptoms.");
    sprayRecommended = true;
  }

  // Rain
  if (rainChance >= crop.maxRain) {
    issues.push(`High rain probability (${rainChance}%) — waterlogging risk`);
    recommendations.push("Delay irrigation. Ensure drainage channels are clear.");
    irrigationNeeded = false;
    if (rainChance >= 70) {
      harvestSafe = false;
      recommendations.push("Delay harvesting operations until after rain.");
    }
  } else if (rainChance < 15 && humidity < 50) {
    irrigationNeeded = true;
    recommendations.push("Irrigate fields — low moisture conditions expected.");
  }

  // Wind
  if (windKph > 35) {
    recommendations.push("Avoid pesticide spraying — winds too high for effective application.");
    sprayRecommended = false;
    if (windKph > 50) {
      harvestSafe = false;
      recommendations.push("Secure loose plant supports. Lodging risk is high.");
    }
  } else if (windKph < 15 && sprayRecommended) {
    recommendations.push("Suitable wind conditions for spray operations.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Conditions are suitable. Continue regular field monitoring.");
  }

  return { issues, recommendations, diseaseRisk, irrigationNeeded, sprayRecommended, harvestSafe };
}

// Demo translations (in a real app, use i18n or AI translation)
const DEMO_TRANSLATIONS: Record<string, Record<string, string>> = {
  kn: {
    "Delay irrigation.": "ನೀರಾವರಿ ವಿಳಂಬ ಮಾಡಿ.",
    "High humidity ({{h}}%) — fungal disease risk elevated": "ಹೆಚ್ಚಿನ ತೇವಾಂಶ ({{h}}%) — ಶಿಲೀಂಧ್ರ ರೋಗದ ಅಪಾಯ ಹೆಚ್ಚಿದೆ",
    "Conditions are suitable. Continue regular field monitoring.": "ಪರಿಸ್ಥಿತಿಗಳು ಸೂಕ್ತವಾಗಿವೆ. ನಿಯಮಿತ ಹೊಲ ಮೇಲ್ವಿಚಾರಣೆ ಮುಂದುವರಿಸಿ.",
  },
  hi: {
    "Delay irrigation.": "सिंचाई में देरी करें।",
    "Conditions are suitable. Continue regular field monitoring.": "परिस्थितियाँ उचित हैं। नियमित खेत निगरानी जारी रखें।",
  },
};

export default function AgriculturePage() {
  const { location, setLocation, ready } = useSelectedLocation();
  const { current, hourly, loading, error, isConfigError } = useWeatherData(location);
  const [selectedCrop, setSelectedCrop] = useState(CROPS[0]);
  const [lang, setLang] = useState("en");

  const maxRain = current ? Math.max(0, ...hourly.map((h) => h.rainChance)) : 0;
  const advice = current
    ? getAgriAdvice(selectedCrop, current.tempC, current.humidity, maxRain, current.windKph)
    : null;

  return (
    <AppShell>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold md:text-2xl flex items-center gap-2">
            <Wheat className="h-5 w-5 text-green-500" />
            Weather-Smart Agriculture
          </h1>
          <p className="text-sm text-muted-foreground">Crop-specific weather advisory for farmers & agricultural officers</p>
        </div>
        <LocationSearch onSelect={setLocation} />
      </div>

      <PrototypeBanner feature="Agricultural advisory" />

      {!ready && <LoadingState />}

      {ready && !location && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="text-5xl">🌾</div>
            <p className="font-semibold text-lg">Select a location for agri-advisory</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Get weather-based crop recommendations for your farm location.
            </p>
          </CardContent>
        </Card>
      )}

      {location && isConfigError && error && <ConfigErrorState message={error} />}
      {location && !isConfigError && error && <ErrorState message={error} />}
      {location && loading && <LoadingState label="Loading weather data..." />}

      {current && advice && !loading && (
        <div className="space-y-5 animate-fade-in">
          {/* ── Controls row ─────────────────────────────────────── */}
          <div className="flex flex-wrap gap-3">
            {/* Crop selector */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Select Crop</p>
              <div className="flex flex-wrap gap-2">
                {CROPS.map((crop) => (
                  <button
                    key={crop.id}
                    onClick={() => setSelectedCrop(crop)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                      selectedCrop.id === crop.id
                        ? "gradient-accent text-white border-transparent shadow-sm"
                        : "border-border bg-card hover:border-primary/30 hover:text-primary"
                    )}
                  >
                    {crop.icon} {crop.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Language selector */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Language</p>
              <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
                <Languages className="h-3.5 w-3.5 text-muted-foreground ml-1" />
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="bg-transparent text-xs outline-none px-1 py-0.5"
                >
                  {Object.entries(LANGUAGES).map(([code, { label }]) => (
                    <option key={code} value={code}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── Main advisory ────────────────────────────────────── */}
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {/* Summary card */}
              <Card className={cn(
                "border-l-4",
                advice.diseaseRisk === "CRITICAL" ? "border-l-red-500" :
                advice.diseaseRisk === "HIGH"     ? "border-l-orange-500" :
                advice.diseaseRisk === "MODERATE" ? "border-l-yellow-500" : "border-l-green-500"
              )}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{selectedCrop.icon}</span>
                        <p className="font-semibold text-lg">{selectedCrop.label}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{location?.name}</p>
                    </div>
                    <RiskBadge level={advice.diseaseRisk} label={`${advice.diseaseRisk} Disease Risk`} />
                  </div>

                  {/* Status indicators */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <StatusIndicator label="Irrigation" status={advice.irrigationNeeded ? "needed" : "ok"} ok="Not Needed" warn="Irrigate Now" />
                    <StatusIndicator label="Spraying" status={advice.sprayRecommended ? "warn" : "ok"} ok="Conditions OK" warn="Review First" />
                    <StatusIndicator label="Harvest" status={advice.harvestSafe ? "ok" : "warn"} ok="Safe" warn="Not Advised" />
                  </div>

                  {/* Issues */}
                  {advice.issues.length > 0 && (
                    <div className="mb-4 space-y-2">
                      {advice.issues.map((issue, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="h-4 w-4 shrink-0 text-orange-500 mt-0.5" />
                          <span>{issue}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recommendations */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recommendations</p>
                    {advice.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm">
                        <CheckCircle className="h-4 w-4 shrink-0 text-green-500 mt-0.5" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Current conditions for this crop */}
              <Card>
                <CardHeader>
                  <CardTitle>Conditions for {selectedCrop.label}</CardTitle>
                  <CardDescription>Live data vs optimal crop ranges</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  {[
                    {
                      label: "Temperature",
                      current: `${Math.round(current.tempC)}°C`,
                      optimal: `${selectedCrop.optTemp[0]}–${selectedCrop.optTemp[1]}°C`,
                      ok: current.tempC >= selectedCrop.optTemp[0] && current.tempC <= selectedCrop.optTemp[1],
                      icon: Thermometer,
                    },
                    {
                      label: "Humidity",
                      current: `${current.humidity}%`,
                      optimal: `< ${selectedCrop.maxHumidity}%`,
                      ok: current.humidity <= selectedCrop.maxHumidity,
                      icon: Droplets,
                    },
                    {
                      label: "Rain Probability",
                      current: `${maxRain}%`,
                      optimal: `< ${selectedCrop.maxRain}%`,
                      ok: maxRain <= selectedCrop.maxRain,
                      icon: Droplets,
                    },
                    {
                      label: "Wind Speed",
                      current: `${current.windKph} km/h`,
                      optimal: "< 35 km/h for spraying",
                      ok: current.windKph < 35,
                      icon: Wind,
                    },
                  ].map(({ label, current: cur, optimal, ok, icon: Icon }) => (
                    <div key={label} className="flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-2">
                      <Icon className={cn("h-4 w-4 shrink-0", ok ? "text-green-500" : "text-orange-500")} />
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="text-sm font-medium">{cur}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Optimal</p>
                        <p className="text-xs">{optimal}</p>
                      </div>
                      <div className={cn("h-2.5 w-2.5 rounded-full shrink-0", ok ? "bg-green-500" : "bg-orange-500")} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* ── Sidebar ───────────────────────────────────────── */}
            <div className="space-y-4">
              {/* Disclaimer */}
              <Card className="border-blue-500/30 bg-blue-500/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">Advisory Disclaimer</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        These recommendations are based on meteorological data only. Always consult your local KVK (Krishi Vigyan Kendra) or agricultural officer before making major crop management decisions.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* KVK helpline */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">KVK Helplines</CardTitle>
                  <CardDescription>Krishi Vigyan Kendra contacts</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {[
                    { label: "Farmer Helpline",      number: "1800-180-1551" },
                    { label: "PM-KISAN Helpline",     number: "155261" },
                    { label: "Kisan Call Centre",     number: "1800-180-1551" },
                    { label: "Soil Health Helpline",  number: "1800-180-1551" },
                  ].map(({ label, number }) => (
                    <a key={label} href={`tel:${number}`} className="flex items-center justify-between text-xs rounded-lg bg-muted/40 px-3 py-2 hover:bg-muted transition-colors">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold text-primary">{number}</span>
                    </a>
                  ))}
                </CardContent>
              </Card>

              {/* Pest/disease calendar (prototype) */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Common Risks — {selectedCrop.label}</CardTitle>
                  <CardDescription>Based on current season & conditions</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {(selectedCrop.id === "tomato" ? [
                    { risk: "Early Blight",    level: advice.diseaseRisk },
                    { risk: "Late Blight",     level: current.humidity > 80 ? "HIGH" as const : "LOW" as const },
                    { risk: "Whitefly",        level: current.tempC > 30 ? "MODERATE" as const : "LOW" as const },
                  ] : selectedCrop.id === "rice" ? [
                    { risk: "Blast Disease",   level: current.humidity > 80 ? "HIGH" as const : "MODERATE" as const },
                    { risk: "Brown Plant Hopper", level: "MODERATE" as const },
                    { risk: "Stem Borer",      level: "LOW" as const },
                  ] : [
                    { risk: "Fungal Disease",  level: advice.diseaseRisk },
                    { risk: "Aphids",          level: current.tempC > 28 ? "MODERATE" as const : "LOW" as const },
                    { risk: "Waterlogging",    level: maxRain > 50 ? "HIGH" as const : "LOW" as const },
                  ]).map(({ risk: r, level }) => (
                    <div key={r} className="flex items-center justify-between">
                      <span className="text-sm">{r}</span>
                      <RiskBadge level={level} size="sm" showIcon={false} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function StatusIndicator({ label, status, ok, warn }: { label: string; status: "ok" | "warn" | "needed"; ok: string; warn: string }) {
  const isOk = status === "ok";
  return (
    <div className={cn("rounded-lg border px-3 py-2 text-center", isOk ? "border-green-500/30 bg-green-500/8" : "border-orange-500/30 bg-orange-500/8")}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("text-xs font-semibold mt-0.5", isOk ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400")}>
        {isOk ? ok : warn}
      </p>
    </div>
  );
}
