const URL_MAX_LENGTH = 2048;
const SHORT_CODE_RE = /^[^\s]{1,128}$/;
const CLAIM_TOKEN_RE = /^[a-f0-9]{64}$/;

export function normalizeHttpUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    const normalized = parsed.toString().replace(/\/$/, "");
    return normalized.length <= URL_MAX_LENGTH ? normalized : null;
  } catch {
    return null;
  }
}

export function isValidShortCode(value: unknown): value is string {
  return typeof value === "string" && SHORT_CODE_RE.test(value);
}

export function isValidClaimToken(value: unknown): value is string {
  return typeof value === "string" && CLAIM_TOKEN_RE.test(value);
}

export function generateShortCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => chars[byte % chars.length]).join("");
}

export function generateClaimToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function safeText(value: unknown, fallback: string, maxLength: number) {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return (trimmed || fallback).slice(0, maxLength);
}

export function safeDevice(value: unknown) {
  return value === "mobile" || value === "tablet" || value === "desktop"
    ? value
    : "desktop";
}