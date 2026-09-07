"use client";

import { motion } from "framer-motion";
import { Database, BrainCircuit, BellRing, Layers, Code2 } from "lucide-react";

const FEATURES = [
  {
    icon: Database,
    title: "Multi-Source Data",
    desc: "Aggregated real-time readings, forecasts, and geocoding from trusted meteorological providers.",
  },
  {
    icon: BrainCircuit,
    title: "AI/ML Forecasting",
    desc: "Weather-grounded AI that explains conditions and risk in plain language — never invented data.",
  },
  {
    icon: BellRing,
    title: "Real-Time Alerts",
    desc: "Severe weather alerts and hazard signals surfaced the moment they're reported.",
  },
  {
    icon: Layers,
    title: "Scalable Architecture",
    desc: "Built on Next.js and Postgres — from a single dashboard to a platform serving millions of requests.",
  },
  {
    icon: Code2,
    title: "Developer-First API",
    desc: "Clean, typed REST endpoints for weather, forecasts, alerts, and AI — integrate in minutes.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="mb-14 text-center"
      >
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Powerful Features</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Everything you need to build, ship, and scale weather-intelligent products.
        </p>
      </motion.div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
            className="glass group rounded-xl p-5 transition-transform hover:-translate-y-1"
          >
            <span className="gradient-accent mb-4 flex h-10 w-10 items-center justify-center rounded-lg transition-shadow group-hover:glow">
              <f.icon className="h-5 w-5 text-white" />
            </span>
            <h3 className="mb-1.5 text-sm font-semibold">{f.title}</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
