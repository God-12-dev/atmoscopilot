"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CloudSun, Droplets, Wind, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-20 sm:pt-28">
      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
        {/* Left: copy + CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            <span className="gradient-accent flex h-5 w-5 items-center justify-center rounded-full glow">
              <Sparkles className="h-3 w-3 text-white" />
            </span>
            Introducing Atmos Copilot
          </div>

          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            Build Smarter Weather
            <br />
            Solutions With{" "}
            <span className="gradient-text">AI Intelligence</span>
          </h1>

          <p className="mt-6 max-w-lg text-base text-muted-foreground sm:text-lg">
            Real-time weather, forecasting, and AI-grounded intelligence — one platform for developers, teams,
            and the people who depend on accurate, actionable weather data.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/signup">
              <Button size="lg" className="w-full gradient-accent glow border-0 text-white sm:w-auto">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/assistant">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Try AI Assistant
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">No credit card required · Free tier available</p>
        </motion.div>

        {/* Right: floating glass weather preview */}
        <motion.div
          initial={{ opacity: 0, y: 32, rotate: -1 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className="relative mx-auto w-full max-w-sm"
        >
          <div className="glass glow relative rounded-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bengaluru, KA</p>
                <p className="text-xs text-muted-foreground">Live preview</p>
              </div>
              <CloudSun className="h-8 w-8 text-primary" />
            </div>

            <div className="mb-5 flex items-end gap-2">
              <span className="gradient-text text-6xl font-bold leading-none">28°</span>
              <span className="mb-1 text-sm text-muted-foreground">Partly Cloudy</span>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                <Droplets className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">64%</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                <Wind className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">12 km/h</span>
              </div>
            </div>

            <motion.div
              animate={{ opacity: [0.75, 1, 0.75] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              className="gradient-alert glow-alert flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-white"
            >
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              Heavy Rain Alert — Karnataka Coast
            </motion.div>
          </div>

          {/* Ambient glow disc behind the card */}
          <div className="gradient-accent absolute -inset-6 -z-10 rounded-3xl opacity-20 blur-3xl" />
        </motion.div>
      </div>
    </section>
  );
}
