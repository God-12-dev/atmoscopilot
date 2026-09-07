"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  CloudSun, Shield, LayoutDashboard, MessageSquare, CalendarDays,
  AlertTriangle, MapPin, History, Settings, LogOut, Menu, X,
  ClipboardList, LineChart, Map, Zap, Wheat, Route,
  FileWarning, Sun, Moon, Monitor, ChevronRight, Bell,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// ── Navigation structure ────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: "Weather",
    items: [
      { href: "/dashboard",    label: "Dashboard",     icon: LayoutDashboard },
      { href: "/forecast",     label: "Forecast",      icon: CalendarDays },
      { href: "/maps",         label: "Weather Maps",  icon: Map },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { href: "/assistant",    label: "AI Copilot",         icon: MessageSquare },
      { href: "/disaster",     label: "Disaster Intel",     icon: Zap },
      { href: "/agriculture",  label: "Agri Advisory",      icon: Wheat },
      { href: "/route-planner",label: "Route Planner",      icon: Route },
      { href: "/climate",      label: "Climate Intel",      icon: LineChart },
    ],
  },
  {
    label: "Services",
    items: [
      { href: "/alerts",       label: "Alerts",             icon: AlertTriangle },
      { href: "/advisories",   label: "Advisories",         icon: ClipboardList },
      { href: "/incidents",    label: "Incident Reports",   icon: FileWarning },
      { href: "/locations",    label: "Locations",          icon: MapPin },
      { href: "/authority",    label: "Authority",          icon: Shield },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/history",      label: "History",            icon: History },
      { href: "/settings",     label: "Settings",           icon: Settings },
    ],
  },
];

// Bottom nav (mobile) — 5 most important routes
const BOTTOM_NAV = [
  { href: "/dashboard",  label: "Home",    icon: LayoutDashboard },
  { href: "/maps",       label: "Map",     icon: Map },
  { href: "/assistant",  label: "AI",      icon: MessageSquare },
  { href: "/alerts",     label: "Alerts",  icon: AlertTriangle },
  { href: "/disaster",   label: "Disaster",icon: Zap },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const options = [
    { value: "light",  icon: Sun,     label: "Light" },
    { value: "dark",   icon: Moon,    label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ];
  return (
    <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          title={label}
          className={cn(
            "rounded-md p-1.5 transition-colors",
            theme === value ? "bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : session?.user?.email?.slice(0, 2).toUpperCase() ?? "W";

  return (
    <div className="flex min-h-screen">
      {/* ── Desktop sidebar ───────────────────────────────────────── */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card/50 backdrop-blur-sm md:flex">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 px-5 py-5 font-bold text-foreground hover:opacity-80 transition-opacity">
          <span className="gradient-accent glow-sm flex h-8 w-8 items-center justify-center rounded-lg">
            <CloudSun className="h-4.5 w-4.5 text-white h-[18px] w-[18px]" />
          </span>
          <span className="text-base">WeatherGPT</span>
        </Link>

        {/* Nav groups */}
        <nav className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 pb-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 px-2 text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
                {group.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150",
                        active
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                      {active && <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-50" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-border p-3 space-y-2">
          <ThemeToggle />
          <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
            <div className="gradient-accent flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-medium">{session?.user?.name ?? session?.user?.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              title="Sign out"
              className="text-muted-foreground hover:text-red-500 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-4 md:px-6">
          {/* Mobile: hamburger + logo */}
          <div className="flex items-center gap-3 md:hidden">
            <button onClick={() => setMobileOpen(true)} className="rounded-lg p-1.5 hover:bg-muted" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/" className="flex items-center gap-2 font-bold">
              <span className="gradient-accent flex h-6 w-6 items-center justify-center rounded-md">
                <CloudSun className="h-3.5 w-3.5 text-white" />
              </span>
              <span className="text-sm">WeatherGPT</span>
            </Link>
          </div>

          {/* Desktop: page title area (empty — pages set their own) */}
          <div className="hidden md:block" />

          {/* Right side */}
          <div className="flex items-center gap-2">
            <div className="hidden md:block"><ThemeToggle /></div>
            <button className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Notifications">
              <Bell className="h-4.5 w-4.5 h-[18px] w-[18px]" />
            </button>
            <div className="gradient-accent flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white">
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 pb-24 md:p-6 md:pb-6">
          {children}
        </main>
      </div>

      {/* ── Mobile drawer ─────────────────────────────────────────── */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-card border-r border-border shadow-elevated md:hidden">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <Link href="/" className="flex items-center gap-2 font-bold" onClick={() => setMobileOpen(false)}>
                <span className="gradient-accent flex h-7 w-7 items-center justify-center rounded-lg">
                  <CloudSun className="h-4 w-4 text-white" />
                </span>
                WeatherGPT
              </Link>
              <button onClick={() => setMobileOpen(false)} className="rounded-lg p-1.5 hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
              {NAV_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="mb-1.5 px-2 text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {group.label}
                  </p>
                  {group.items.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                          active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* Drawer footer */}
            <div className="border-t border-border p-4 space-y-3">
              <ThemeToggle />
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </aside>
        </>
      )}

      {/* ── Mobile bottom nav ─────────────────────────────────────── */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-border bg-card/95 backdrop-blur-sm pb-safe py-2 md:hidden">
        {BOTTOM_NAV.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors min-w-[52px]",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
