/**
 * Runtime Gemini API key store.
 * The key is pasted by the user at runtime and kept in LocalStorage only.
 */

const STORAGE_KEY = "nimbus.gemini-key";

const ENV_KEY = ((import.meta.env?.['VITE_GEMINI_API_KEY'] as string | undefined) ?? "").trim();

let cached: string | null = null;
const listeners = new Set<(key: string) => void>();

export function getApiKey(): string {
  if (cached !== null) return cached;
  if (typeof window === "undefined") return ENV_KEY;
  cached = (window.localStorage.getItem(STORAGE_KEY) ?? ENV_KEY).trim();
  return cached;
}

export function setApiKey(key: string) {
  const value = key.trim();
  cached = value;
  if (typeof window !== "undefined") {
    if (value) window.localStorage.setItem(STORAGE_KEY, value);
    else window.localStorage.removeItem(STORAGE_KEY);
  }
  listeners.forEach((fn) => fn(value));
}

export function hasApiKey(): boolean {
  return getApiKey().length > 0;
}

export function subscribeApiKey(fn: (key: string) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
