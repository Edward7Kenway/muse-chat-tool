/**
 * Central configuration for the AI assistant.
 *
 * This is the ONLY place where the Gemini API key and model IDs live.
 * Nothing else in the codebase should hardcode these values.
 */

// Paste your Gemini API key here
export const GEMINI_API_KEY =
  (import.meta.env?.VITE_GEMINI_API_KEY as string | undefined) ??
  "PASTE_YOUR_GEMINI_API_KEY_HERE";

/** Base URL of the Gemini REST API. */
export const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

/** Gemini model IDs. Change these to swap the underlying models. */
export const MODELS = {
  fast: "gemini-2.5-flash-lite",
  pro: "gemini-2.5-flash",
  thinking: "gemini-2.5-pro",
} as const;

export type ModelKey = keyof typeof MODELS;

export const MODEL_OPTIONS: Array<{
  key: ModelKey;
  label: string;
  description: string;
}> = [
  {
    key: "fast",
    label: "Gemini Fast",
    description: "Quick everyday answers and low latency",
  },
  {
    key: "pro",
    label: "Gemini Pro",
    description: "Stronger reasoning, coding and detail",
  },
  {
    key: "thinking",
    label: "Gemini Deep Thinking",
    description: "Complex reasoning, architecture and analysis",
  },
];

export const DEFAULT_MODEL: ModelKey = "fast";

export const SYSTEM_INSTRUCTION =
  "You are a helpful, precise AI assistant. Use Markdown for structure and always put code inside fenced code blocks with a language tag.";

/** True when the user has actually configured a key. */
export function isApiKeyConfigured(): boolean {
  return Boolean(GEMINI_API_KEY) && GEMINI_API_KEY !== "PASTE_YOUR_GEMINI_API_KEY_HERE";
}
