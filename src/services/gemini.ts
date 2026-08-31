import {
  GEMINI_API_BASE_URL,
  GEMINI_API_KEY,
  MODELS,
  SYSTEM_INSTRUCTION,
  isApiKeyConfigured,
  type ModelKey,
} from "@/config";
import type { ChatMessage, MailTone } from "@/types/chat";

export class GeminiError extends Error {}

const MESSAGES = {
  missingKey: "Gemini API key is not configured. Please add your API key in config.ts.",
  auth: "Authentication failed. Please check your Gemini API key.",
  quota: "API limit reached. Please try again later.",
  network: "Unable to connect to Gemini. Please check your internet connection.",
  generic: "Something went wrong while contacting Gemini. Please try again.",
};

function endpoint(model: ModelKey, stream: boolean) {
  const id = MODELS[model];
  const method = stream ? "streamGenerateContent?alt=sse&" : "generateContent?";
  return `${GEMINI_API_BASE_URL}/models/${id}:${method}key=${encodeURIComponent(GEMINI_API_KEY)}`;
}

function toContents(messages: ChatMessage[]) {
  return messages
    .filter((m) => !m.error && m.content.trim().length > 0)
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
}

function errorForStatus(status: number): GeminiError {
  if (status === 401 || status === 403) return new GeminiError(MESSAGES.auth);
  if (status === 400) return new GeminiError(MESSAGES.auth);
  if (status === 429) return new GeminiError(MESSAGES.quota);
  return new GeminiError(MESSAGES.generic);
}

interface StreamOptions {
  model: ModelKey;
  messages: ChatMessage[];
  systemInstruction?: string;
  signal?: AbortSignal;
  onDelta: (chunk: string) => void;
}

/** Streams a chat completion, calling onDelta with each text chunk. */
export async function streamResponse({
  model,
  messages,
  systemInstruction = SYSTEM_INSTRUCTION,
  signal,
  onDelta,
}: StreamOptions): Promise<string> {
  if (!isApiKeyConfigured()) throw new GeminiError(MESSAGES.missingKey);

  let res: Response;
  try {
    res = await fetch(endpoint(model, true), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal,
      body: JSON.stringify({
        contents: toContents(messages),
        systemInstruction: { parts: [{ text: systemInstruction }] },
      }),
    });
  } catch (err) {
    if ((err as Error)?.name === "AbortError") throw err;
    throw new GeminiError(MESSAGES.network);
  }

  if (!res.ok || !res.body) throw errorForStatus(res.status);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const json = JSON.parse(payload);
        const parts = json?.candidates?.[0]?.content?.parts ?? [];
        for (const part of parts) {
          if (typeof part?.text === "string" && part.text) {
            full += part.text;
            onDelta(part.text);
          }
        }
      } catch {
        // ignore partial/unparsable SSE frames
      }
    }
  }

  if (!full.trim()) throw new GeminiError(MESSAGES.generic);
  return full;
}

/** Single-shot generation (used by Draft Mail). */
export async function generateResponse(options: {
  model: ModelKey;
  prompt: string;
  systemInstruction?: string;
  signal?: AbortSignal;
}): Promise<string> {
  if (!isApiKeyConfigured()) throw new GeminiError(MESSAGES.missingKey);

  let res: Response;
  try {
    res = await fetch(endpoint(options.model, false), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: options.signal,
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: options.prompt }] }],
        ...(options.systemInstruction
          ? { systemInstruction: { parts: [{ text: options.systemInstruction }] } }
          : {}),
      }),
    });
  } catch (err) {
    if ((err as Error)?.name === "AbortError") throw err;
    throw new GeminiError(MESSAGES.network);
  }

  if (!res.ok) throw errorForStatus(res.status);

  const json = await res.json();
  const text: string = (json?.candidates?.[0]?.content?.parts ?? [])
    .map((p: { text?: string }) => p?.text ?? "")
    .join("");

  if (!text.trim()) throw new GeminiError(MESSAGES.generic);
  return text;
}

export const MAIL_TONES: Array<{
  value: MailTone;
  label: string;
  description: string;
  instruction: string;
}> = [
  {
    value: "professional",
    label: "Professional",
    description: "Formal workplace communication",
    instruction: "Write in a clear, professional workplace tone.",
  },
  {
    value: "friendly",
    label: "Friendly",
    description: "Professional but warm",
    instruction: "Write in a professional but warm, approachable tone.",
  },
  {
    value: "casual",
    label: "Casual",
    description: "Relaxed and conversational",
    instruction: "Write in a relaxed, conversational tone.",
  },
  {
    value: "formal",
    label: "Formal",
    description: "Highly polished and formal",
    instruction: "Write in a highly polished, very formal tone.",
  },
  {
    value: "concise",
    label: "Concise",
    description: "Short, direct and to the point",
    instruction:
      "Write a very short, direct email. Keep it under 80 words with no filler.",
  },
];

export function buildMailPrompt(input: {
  recipient: string;
  subject: string;
  tone: MailTone;
  instructions: string;
}): string {
  const tone = MAIL_TONES.find((t) => t.value === input.tone) ?? MAIL_TONES[0];
  return `You are an expert professional email writer.

Write an email based on the user's instructions.

Tone: ${tone.label} — ${tone.instruction}

Recipient: ${input.recipient || "(unspecified)"}
Subject: ${input.subject || "(unspecified)"}

User request:
${input.instructions}

Requirements:
- Follow the requested tone.
- Keep the email natural.
- Do not add unnecessary explanations.
- Return only the email body.
- Do not wrap the email in markdown unless required.`;
}

export async function generateMail(input: {
  model: ModelKey;
  recipient: string;
  subject: string;
  tone: MailTone;
  instructions: string;
  signal?: AbortSignal;
}): Promise<string> {
  const text = await generateResponse({
    model: input.model,
    prompt: buildMailPrompt(input),
    signal: input.signal,
  });
  return text.replace(/^```[a-z]*\n?/i, "").replace(/```$/, "").trim();
}
