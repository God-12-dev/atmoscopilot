import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cToF(c: number) {
  return Math.round((c * 9) / 5 + 32);
}

export function kphToMph(kph: number) {
  return Math.round(kph * 0.621371);
}
