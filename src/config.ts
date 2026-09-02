/**
 * Central configuration for the AI assistant.
 *
 * Model IDs and UI options live here. The Gemini API key is managed at
 * runtime through the Connect button (src/lib/api-key.ts) — it is stored
 * in the browser and never hardcoded in this file.
 */

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
