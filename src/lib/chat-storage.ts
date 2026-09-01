import { DEFAULT_MODEL, type ModelKey } from "@/config";
import type { ChatMessage, Conversation } from "@/types/chat";

const STORAGE_KEY = "ai-assistant.conversations.v1";

export function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function loadConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Conversation[]) : [];
  } catch {
    return [];
  }
}

export function saveConversations(conversations: Conversation[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    // storage full / unavailable — ignore
  }
}

export function createConversation(model: ModelKey = DEFAULT_MODEL): Conversation {
  const now = Date.now();
  return {
    id: uid(),
    title: "New chat",
    createdAt: now,
    updatedAt: now,
    model,
    messages: [],
  };
}

export function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return { id: uid(), role, content, createdAt: Date.now() };
}

export function titleFromText(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > 42 ? `${clean.slice(0, 42)}…` : clean || "New chat";
}

export type ConversationGroup = { label: string; items: Conversation[] };

export function groupConversations(conversations: Conversation[]): ConversationGroup[] {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 86_400_000;
  const startOfWeek = startOfToday - 7 * 86_400_000;

  const groups: ConversationGroup[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "Previous 7 days", items: [] },
    { label: "Older", items: [] },
  ];

  for (const c of [...conversations].sort((a, b) => b.updatedAt - a.updatedAt)) {
    if (c.updatedAt >= startOfToday) groups[0]!.items.push(c);
    else if (c.updatedAt >= startOfYesterday) groups[1]!.items.push(c);
    else if (c.updatedAt >= startOfWeek) groups[2]!.items.push(c);
    else groups[3]!.items.push(c);
  }

  return groups.filter((g) => g.items.length > 0);
}
