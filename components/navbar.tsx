"use client";

import Link from "next/link";
import { CloudSun, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="gradient-accent glow flex h-8 w-8 items-center justify-center rounded-lg">
            <CloudSun className="h-4 w-4 text-white" />
          </span>
          Atmos Copilot
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link href="/#features" className="text-muted-foreground hover:text-foreground">
            Features
          </Link>
          <Link href="/#how-it-works" className="text-muted-foreground hover:text-foreground">
            How It Works
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Get Started</Button>
          </Link>
        </nav>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3 text-sm">
            <Link href="/#features" onClick={() => setOpen(false)}>Features</Link>
            <Link href="/#how-it-works" onClick={() => setOpen(false)}>How It Works</Link>
            <Link href="/login" onClick={() => setOpen(false)}>Log in</Link>
            <Link href="/signup" onClick={() => setOpen(false)}>
              <Button size="sm" className="w-full">Get Started</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
