"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Mic, MicOff, Bot, User, RotateCcw, Globe, ChevronDown, Zap, AlertTriangle, CloudRain } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { LocationSearch } from "@/components/location-search";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState, ConfigErrorState } from "@/components/state";
import { ChatMarkdown } from "@/components/chat-markdown";
import { useSelectedLocation } from "@/lib/use-location";
import { useWeatherData } from "@/lib/use-weather";
import { cn } from "@/lib/utils";

const LANGUAGES: Record<string, string> = {
  en: "English", kn: "ಕನ್ನಡ", hi: "हिन्दी",
  te: "తెలుగు", ta: "தமிழ்", ml: "മലയാളം",
  mr: "मराठी", bn: "বাংলা",
};

const SUGGESTED = [
  "What's the weather now?",
  "Will it rain today?",
  "Is it safe to travel?",
  "What is the flood risk?",
  "What should farmers do today?",
  "Give me a weather summary.",
];

interface Message { role: "user" | "assistant"; content: string; ts: number; }

// The system prompt is now NEVER an empty string. Previously this returned ""
// when weather hadn't loaded yet, and "" is not null/undefined so it slipped
// past the `systemPrompt ?? DEFAULT_SYSTEM_PROMPT` fallback in lib/ai.ts —
// Gemini received literally no instructions and would fall back on its own
// (stale/seasonal) training knowledge for "what's the temperature in Manvi",
// which is exactly how invented numbers like 31°C/34°C were slipping in
// alongside a correct 27°C shown elsewhere in the UI. Every branch below
// returns a real instruction block.
const AUTHORITATIVE_DATA_RULE =
  "You are a weather assistant. Current weather data provided by the application is authoritative. " +
  "Never invent, estimate, or replace current weather values. Use the supplied live weather data exactly " +
  "when answering questions about current conditions — if the API's current temperature is 27°C, you must say 27°C, " +
  "never a different or rounded-differently number, and never your own estimate for the season/region.";

function buildContext(current: any, hourly: any[], alerts: any[], lang: string) {
  const languageRule = `Always respond in ${LANGUAGES[lang] ?? "English"} unless the user switches languages.`;

  if (!current) {
    return `
${AUTHORITATIVE_DATA_RULE}
${languageRule}

NO LIVE WEATHER DATA IS AVAILABLE YET for the user's location (still loading, or no location has been selected).
Do NOT state, guess, or estimate any temperature, condition, humidity, wind, or rain chance.
Tell the user you don't have live data for their location yet and ask them to select a location (or wait a moment
for it to finish loading) before asking about current conditions.
`.trim();
  }

  const maxRain = Math.max(0, ...hourly.map((h: any) => h.rainChance));
  return `
${AUTHORITATIVE_DATA_RULE}
${languageRule}
Structure responses clearly: lead with the key weather fact, then context, then recommendation.
Keep responses concise and actionable. You may use Markdown (**bold**, bullet lists, headings) — it will be rendered properly.

CURRENT WEATHER (source of truth — use these EXACT numbers, do not round differently or invent alternatives):
Location: ${current.location.name}, ${current.location.state}, ${current.location.country}
Current temperature (use THIS number whenever asked "what is the temperature" / "how hot is it now"): ${Math.round(current.tempC)}°C
Feels-like temperature (a DIFFERENT number — only mention when specifically asked how it feels, never substitute this for the current temperature): ${Math.round(current.feelsLikeC)}°C
Condition: ${current.condition}
Humidity: ${current.humidity}%
Wind: ${current.windKph} km/h
Visibility: ${current.visibilityKm} km
Pressure: ${current.pressure} hPa
Precipitation (last hr): ${current.precipitationMm.toFixed(1)} mm
Sunrise: ${new Date(current.sunrise).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
Sunset: ${new Date(current.sunset).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}

HOURLY NEXT 6 HOURS:
${hourly.slice(0, 6).map((h: any) => `  ${new Date(h.time).toLocaleTimeString([], { hour: "numeric" })}: ${Math.round(h.tempC)}°C, ${h.condition}, Rain: ${h.rainChance}%`).join("\n")}
Peak rain chance in next 6 hrs: ${maxRain}%

ACTIVE ALERTS: ${alerts.length === 0 ? "None" : alerts.map((a: any) => `${a.severity}: ${a.title}`).join("; ")}
`.trim();
}

export default function AssistantPage() {
  const { location, setLocation, ready } = useSelectedLocation();
  const { current, hourly, alerts, loading, error, isConfigError } = useWeatherData(location);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [lang, setLang] = useState("en");
  const [recording, setRecording] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || thinking) return;
    const userMsg: Message = { role: "user", content: text.trim(), ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);
    setAiError(null);

    const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
    const systemPrompt = buildContext(current, hourly, alerts, lang);

    // Debug logging per request: verify in the browser console that the AI is
    // being sent the exact same numbers shown on screen, not stale/invented ones.
    console.log("[AI Copilot] sending message", {
      location: location ? `${location.name}, ${location.state ?? ""} ${location.country ?? ""}` : "(none selected)",
      lat: location?.lat,
      lon: location?.lon,
      currentTempC: current?.tempC ?? "(no live data yet)",
      currentCondition: current?.condition ?? "(no live data yet)",
      humidity: current?.humidity ?? "(no live data yet)",
      windKph: current?.windKph ?? "(no live data yet)",
      peakRainChance: current && hourly.length ? Math.max(0, ...hourly.map((h) => h.rainChance)) : "(no live data yet)",
      systemPromptSentToAI: systemPrompt,
    });

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, systemPrompt }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages((m) => [...m, { role: "assistant", content: data.message, ts: Date.now() }]);
      } else {
        setAiError(data.error ?? "AI response failed.");
      }
    } catch {
      setAiError("AI is temporarily unavailable. Please try again.");
    }
    setThinking(false);
  }, [messages, thinking, current, hourly, alerts, lang, location]);

  function toggleRecording() {
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Speech recognition not supported in this browser."); return; }
    const rec = new SpeechRecognition();
    rec.lang = lang === "kn" ? "kn-IN" : lang === "hi" ? "hi-IN" : lang === "te" ? "te-IN" : lang === "ta" ? "ta-IN" : "en-IN";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setRecording(false);
    };
    rec.onerror = () => setRecording(false);
    rec.onend = () => setRecording(false);
    recognitionRef.current = rec;
    rec.start();
    setRecording(true);
  }

  const hasWeatherContext = !!current;

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="gradient-accent glow-sm flex h-10 w-10 items-center justify-center rounded-xl">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold md:text-xl">WeatherGPT AI Copilot</h1>
            <p className="text-xs text-muted-foreground">
              {hasWeatherContext ? `Grounded in live weather — ${current?.location.name}` : "Select a location to ground AI in real weather"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Language selector */}
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2 py-1">
            <Globe className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-transparent text-xs outline-none"
            >
              {Object.entries(LANGUAGES).map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
          </div>
          <LocationSearch onSelect={setLocation} />
        </div>
      </div>

      {/* Weather context strip */}
      {current && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 font-medium text-foreground">
            <Zap className="h-3.5 w-3.5 text-primary" />Live Context
          </span>
          <span>{current.location.name}</span>
          <span className="font-semibold text-foreground">{Math.round(current.tempC)}°C</span>
          <span>{current.condition}</span>
          <span className="flex items-center gap-1">
            <CloudRain className="h-3 w-3" />{Math.max(0, ...hourly.map((h) => h.rainChance))}% rain
          </span>
          {alerts.length > 0 && (
            <span className="flex items-center gap-1 text-orange-500 font-medium">
              <AlertTriangle className="h-3 w-3" />{alerts.length} active alert{alerts.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}

      {/* Chat window */}
      <Card className="flex flex-col" style={{ height: "calc(100vh - 22rem)" }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Welcome state */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center gap-5 py-8 text-center">
              <div className="gradient-accent glow flex h-16 w-16 items-center justify-center rounded-2xl">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="font-semibold text-lg gradient-text">WeatherGPT AI Copilot</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  {hasWeatherContext
                    ? `Ask me anything about weather in ${current?.location.name}. I'm grounded in live data.`
                    : "Select a location above, then ask me about weather, flood risk, agriculture, routing or any safety question."}
                </p>
              </div>
              {hasWeatherContext && (
                <div className="grid grid-cols-2 gap-2 w-full max-w-md">
                  {SUGGESTED.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="rounded-xl border border-border bg-card px-3 py-2.5 text-xs text-left hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
              <div className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                msg.role === "user" ? "gradient-accent text-white" : "bg-muted border border-border"
              )}>
                {msg.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5 text-primary" />}
              </div>
              <div className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                msg.role === "user"
                  ? "gradient-accent text-white rounded-tr-sm"
                  : "bg-card border border-border rounded-tl-sm"
              )}>
                {msg.role === "user" ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <ChatMarkdown content={msg.content} />
                )}
                <p className={cn("text-[10px] mt-1", msg.role === "user" ? "text-white/60 text-right" : "text-muted-foreground")}>
                  {new Date(msg.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}

          {/* Thinking indicator */}
          {thinking && (
            <div className="flex gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted border border-border">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-card border border-border px-4 py-3">
                <div className="flex gap-1 items-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                  <span className="text-xs text-muted-foreground ml-2">Analysing weather data…</span>
                </div>
              </div>
            </div>
          )}

          {/* AI Error */}
          {aiError && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/8 px-3 py-2 text-xs text-red-600 dark:text-red-400">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />{aiError}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input row */}
        <div className="border-t border-border p-3">
          {/* Suggested chips (after first message) */}
          {messages.length > 0 && messages.length < 3 && hasWeatherContext && (
            <div className="flex gap-1.5 flex-wrap mb-2">
              {SUGGESTED.slice(0, 3).map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs hover:border-primary/30 hover:text-primary transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={toggleRecording}
              title={recording ? "Stop recording" : "Voice input"}
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all",
                recording
                  ? "border-red-500/50 bg-red-500/15 text-red-500 animate-pulse"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"
              )}
            >
              {recording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
              placeholder={hasWeatherContext ? `Ask about weather in ${current?.location.name}…` : "Select a location first…"}
              disabled={thinking}
              className="flex-1 rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50 focus:ring-1 focus:ring-primary/20 disabled:opacity-50"
            />

            <Button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || thinking}
              size="icon"
              className="h-10 w-10 shrink-0 rounded-xl"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {!hasWeatherContext && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              💡 Select a location to ground the AI in real weather data for accurate, reliable answers.
            </p>
          )}
        </div>
      </Card>

      {/* Reset */}
      {messages.length > 0 && (
        <div className="mt-2 flex justify-end">
          <button
            onClick={() => setMessages([])}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-3 w-3" /> Clear conversation
          </button>
        </div>
      )}
    </AppShell>
  );
}
