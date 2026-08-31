import type { ModelKey } from "@/config";

export type Role = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  error?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  model: ModelKey;
  messages: ChatMessage[];
}

export type MailTone = "professional" | "friendly" | "casual" | "formal" | "concise";

export interface MailToneOption {
  value: MailTone;
  label: string;
  description: string;
  instruction: string;
}
