"use client";

import { AlertTriangle, Settings, WifiOff, Inbox, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-5 space-y-3">
        <div className="skeleton h-4 w-2/3" />
        <div className="skeleton h-10 w-1/2" />
        <div className="skeleton h-3 w-3/4" />
        <div className="grid grid-cols-3 gap-2 mt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-12 rounded-lg" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function SkeletonRow({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton h-14 rounded-xl" />
      ))}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <Card className="border-red-500/30 bg-red-500/5">
      <CardContent className="flex items-start gap-3 p-5">
        <WifiOff className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
        <div>
          <p className="font-medium text-red-700 dark:text-red-400">Data unavailable</p>
          <p className="text-sm text-muted-foreground mt-0.5">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ConfigErrorState({ message }: { message: string }) {
  return (
    <Card className="border-yellow-500/30 bg-yellow-500/5">
      <CardContent className="flex items-start gap-3 p-5">
        <Settings className="h-5 w-5 shrink-0 text-yellow-500 mt-0.5" />
        <div>
          <p className="font-medium text-yellow-700 dark:text-yellow-500">Configuration needed</p>
          <p className="text-sm text-muted-foreground mt-0.5">{message}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Add your <code className="rounded bg-muted px-1 py-0.5 text-xs">WEATHER_API_KEY</code> to <code className="rounded bg-muted px-1 py-0.5 text-xs">.env.local</code> to enable live weather data.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function EmptyState({ message, icon: Icon = Inbox }: { message: string; icon?: any }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
      <Icon className="h-8 w-8 opacity-40" />
      <p className="text-sm max-w-sm">{message}</p>
    </div>
  );
}

export function PrototypeBanner({ feature }: { feature: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-blue-500/30 bg-blue-500/8 px-4 py-3 text-sm mb-4">
      <AlertTriangle className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
      <div>
        <span className="font-semibold text-blue-700 dark:text-blue-400">Prototype Mode</span>
        <span className="text-muted-foreground ml-2">
          {feature} uses simulated data for demonstration. Real ML integration is architecture-ready.
        </span>
      </div>
    </div>
  );
}
