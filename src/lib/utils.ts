import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortLinkOrigin(): string {
  if (typeof window === "undefined") return "";
  return window.location.origin;
}

export function shortLinkUrl(slug: string): string {
  const origin = shortLinkOrigin();
  return origin ? `${origin}/s/${slug}` : `/s/${slug}`;
}

export function shortLinkDisplay(slug: string): string {
  const origin = shortLinkOrigin();
  if (!origin) return `/s/${slug}`;
  return `${origin.replace(/^https?:\/\//, "")}/s/${slug}`;
}
