"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Github, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FooterCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="glass glow relative overflow-hidden rounded-2xl px-6 py-16 text-center sm:px-16"
      >
        <div className="gradient-accent pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full opacity-20 blur-3xl" />
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Your weather is more than a number.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Start building with Atmos Copilot today — free tier, no credit card required.
        </p>
        <Link href="/signup">
          <Button size="lg" className="gradient-accent glow mt-7 border-0 text-white">
            Get Started <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>

        <div className="mt-8 flex items-center justify-center gap-5 border-t border-white/10 pt-6">
          <a href="https://github.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
            <Github className="h-4 w-4" />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
            <Twitter className="h-4 w-4" />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
            <Linkedin className="h-4 w-4" />
          </a>
        </div>
      </motion.div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Atmos Copilot
      </p>
    </section>
  );
}
