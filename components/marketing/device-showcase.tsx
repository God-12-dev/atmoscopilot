"use client";

import { motion } from "framer-motion";
import { Globe, Smartphone, Terminal as TerminalIcon, Braces, Check } from "lucide-react";

const ACCESS_METHODS = [
  { icon: Globe, title: "Web Dashboard", desc: "Full-featured dashboard with maps, charts, and the AI assistant." },
  { icon: Smartphone, title: "Mobile SDKs", desc: "Native iOS and Android SDKs for on-device weather intelligence." },
  { icon: Braces, title: "RESTful APIs", desc: "Typed, documented endpoints for weather, forecasts, alerts, and AI." },
  { icon: TerminalIcon, title: "CLI Tools", desc: "Query weather and stream alerts straight from your terminal." },
];

const TERMINAL_LINES = [
  { prompt: true, text: "atmos weather --city Bengaluru" },
  { prompt: false, text: "→ 28°C · Partly Cloudy · humidity 64%" },
  { prompt: true, text: "atmos alerts --state karnataka" },
  { prompt: false, text: "⚠ Heavy Rain Alert — Karnataka Coast" },
  { prompt: true, text: "atmos ai \"should I carry an umbrella?\"" },
  { prompt: false, text: "→ Yes — rain likely after 2 PM today." },
];

export function DeviceShowcase() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        {/* Left: access methods list */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Built for <span className="gradient-text">every surface</span>
          </h2>
          <p className="mt-3 max-w-md text-muted-foreground">
            Access Atmos Copilot however you build — dashboard, mobile, API, or terminal.
          </p>

          <div className="mt-8 space-y-4">
            {ACCESS_METHODS.map((m) => (
              <div key={m.title} className="flex items-start gap-4">
                <span className="gradient-accent flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                  <m.icon className="h-5 w-5 text-white" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{m.title}</p>
                  <p className="text-xs text-muted-foreground">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right: terminal + device preview mockups */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          {/* Terminal window */}
          <div className="glass overflow-hidden rounded-xl">
            <div className="flex items-center gap-1.5 border-b border-white/10 bg-black/20 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
              <span className="ml-2 text-xs text-muted-foreground">atmos — zsh</span>
            </div>
            <div className="space-y-2 p-4 font-mono text-xs">
              {TERMINAL_LINES.map((l, i) => (
                <p key={i} className={l.prompt ? "text-primary" : "pl-4 text-muted-foreground"}>
                  {l.prompt ? "$ " : ""}
                  {l.text}
                </p>
              ))}
            </div>
          </div>

          {/* Floating mobile/watch preview cards */}
          <div className="glass absolute -bottom-8 -right-4 hidden w-32 rounded-xl p-3 shadow-lg sm:block">
            <p className="text-[10px] text-muted-foreground">Watch</p>
            <p className="gradient-text text-2xl font-bold">28°</p>
            <div className="mt-1 flex items-center gap-1 text-[10px] text-green-500">
              <Check className="h-2.5 w-2.5" /> Synced
            </div>
          </div>
          <div className="glass absolute -left-6 -top-6 hidden w-28 rounded-xl p-3 shadow-lg sm:block">
            <p className="text-[10px] text-muted-foreground">Mobile</p>
            <p className="text-sm font-semibold">Rain 2PM</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
