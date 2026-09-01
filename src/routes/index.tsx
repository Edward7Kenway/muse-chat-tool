import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Menu, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AppSidebar, type View } from "@/components/AppSidebar";
import { DraftMail } from "@/components/DraftMail";
import { ChatInput } from "@/components/chat/ChatInput";
import { MessageItem } from "@/components/chat/MessageItem";
import { ModelSelector } from "@/components/chat/ModelSelector";
import { WelcomeScreen } from "@/components/chat/WelcomeScreen";
import { DEFAULT_MODEL, isApiKeyConfigured, type ModelKey } from "@/config";
import {
  createConversation,
  createMessage,
  loadConversations,
  saveConversations,
  titleFromText,
  uid,
} from "@/lib/chat-storage";
import { streamResponse } from "@/services/gemini";
import type { ChatMessage, Conversation } from "@/types/chat";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nimbus Assistant — AI Chat & Email Drafting" },
      {
        name: "description",
        content:
          "A fast, modern AI assistant for chat, coding help and drafting professional emails with selectable models and tones.",
      },
      { property: "og:title", content: "Nimbus Assistant — AI Chat & Email Drafting" },
      {
        property: "og:description",
        content:
          "Chat with an AI assistant, get syntax-highlighted code answers, and draft professional emails in any tone.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AssistantPage,
});

function AssistantPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [view, setView] = useState<View>("chat");
  const [model, setModel] = useState<ModelKey>(DEFAULT_MODEL);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = loadConversations();
    setConversations(stored);
    setActiveId(stored[0]?.id ?? null);
    if (stored[0]?.model) setModel(stored[0].model);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveConversations(conversations);
  }, [conversations, hydrated]);

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [active?.messages, streamingId]);

  const patchConversation = useCallback(
    (id: string, updater: (c: Conversation) => Conversation) => {
      setConversations((prev) => prev.map((c) => (c.id === id ? updater(c) : c)));
    },
    [],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsGenerating(false);
    setStreamingId(null);
  }, []);

  const runGeneration = useCallback(
    async (conversationId: string, history: ChatMessage[], usedModel: ModelKey) => {
      const assistantId = uid();
      const placeholder: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: Date.now(),
      };

      patchConversation(conversationId, (c) => ({
        ...c,
        messages: [...history, placeholder],
        updatedAt: Date.now(),
      }));

      const controller = new AbortController();
      abortRef.current = controller;
      setIsGenerating(true);
      setStreamingId(assistantId);

      const appendDelta = (chunk: string) => {
        patchConversation(conversationId, (c) => ({
          ...c,
          messages: c.messages.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + chunk } : m,
          ),
        }));
      };

      try {
        await streamResponse({
          model: usedModel,
          messages: history,
          signal: controller.signal,
          onDelta: appendDelta,
        });
      } catch (err) {
        const aborted = (err as Error)?.name === "AbortError";
        if (!aborted) {
          const message = (err as Error).message || "Something went wrong. Please try again.";
          patchConversation(conversationId, (c) => ({
            ...c,
            messages: c.messages.map((m) =>
              m.id === assistantId ? { ...m, content: message, error: true } : m,
            ),
          }));
        } else {
          patchConversation(conversationId, (c) => ({
            ...c,
            messages: c.messages.filter((m) => m.id !== assistantId || m.content.length > 0),
          }));
        }
      } finally {
        abortRef.current = null;
        setIsGenerating(false);
        setStreamingId(null);
        patchConversation(conversationId, (c) => ({ ...c, updatedAt: Date.now() }));
      }
    },
    [patchConversation],
  );

  const send = useCallback(() => {
    const text = input.trim();
    if (!text || isGenerating) return;

    let conversation = active;
    if (!conversation) {
      conversation = createConversation(model);
      setConversations((prev) => [conversation as Conversation, ...prev]);
      setActiveId(conversation.id);
    }

    const userMessage = createMessage("user", text);
    const history = [...conversation.messages, userMessage];
    const isFirst = conversation.messages.length === 0;

    patchConversation(conversation.id, (c) => ({
      ...c,
      title: isFirst ? titleFromText(text) : c.title,
      model,
      messages: history,
      updatedAt: Date.now(),
    }));

    setInput("");
    setView("chat");
    void runGeneration(conversation.id, history, model);
  }, [active, input, isGenerating, model, patchConversation, runGeneration]);

  const regenerate = useCallback(() => {
    if (!active || isGenerating) return;
    const messages = [...active.messages];
    while (messages.length && messages[messages.length - 1]!.role === "assistant") {
      messages.pop();
    }
    if (!messages.length) return;
    patchConversation(active.id, (c) => ({ ...c, messages }));
    void runGeneration(active.id, messages, model);
  }, [active, isGenerating, model, patchConversation, runGeneration]);

  const newChat = useCallback(() => {
    stop();
    const conversation = createConversation(model);
    setConversations((prev) => [conversation, ...prev]);
    setActiveId(conversation.id);
    setView("chat");
    setSidebarOpen(false);
    setInput("");
  }, [model, stop]);

  const selectChat = useCallback(
    (id: string) => {
      stop();
      setActiveId(id);
      setView("chat");
      setSidebarOpen(false);
      const found = conversations.find((c) => c.id === id);
      if (found?.model) setModel(found.model);
    },
    [conversations, stop],
  );

  const deleteChat = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id);
        if (id === activeId) setActiveId(next[0]?.id ?? null);
        return next;
      });
    },
    [activeId],
  );

  const renameChat = useCallback(
    (id: string, title: string) => patchConversation(id, (c) => ({ ...c, title })),
    [patchConversation],
  );

  const sidebar = (
    <AppSidebar
      conversations={conversations}
      activeId={activeId}
      view={view}
      onNewChat={newChat}
      onSelect={selectChat}
      onRename={renameChat}
      onDelete={deleteChat}
      onOpenMail={() => {
        setView("mail");
        setSidebarOpen(false);
      }}
      onClose={() => setSidebarOpen(false)}
    />
  );

  const lastAssistantId = [...(active?.messages ?? [])]
    .reverse()
    .find((m) => m.role === "assistant" && !m.error)?.id;

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <aside className="hidden w-[272px] shrink-0 border-r border-sidebar-border md:block">
        {sidebar}
      </aside>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 bg-foreground/25"
          />
          <div className="absolute inset-y-0 left-0 w-[280px] border-r border-sidebar-border shadow-xl">
            {sidebar}
          </div>
        </div>
      ) : null}

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-1 border-b border-border px-3 sm:px-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted md:hidden"
          >
            <Menu className="size-5" />
          </button>
          {view === "chat" ? (
            <ModelSelector value={model} onChange={setModel} />
          ) : (
            <span className="px-2 text-sm font-medium">Draft Mail</span>
          )}
          <div className="ml-auto">
            <button
              type="button"
              onClick={newChat}
              aria-label="New chat"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </header>

        {!isApiKeyConfigured() ? (
          <div className="flex items-start gap-2.5 border-b border-destructive/20 bg-destructive/5 px-4 py-2.5 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>Gemini API key is not configured. Please add your API key in config.ts.</p>
          </div>
        ) : null}

        {view === "mail" ? (
          <div className="flex-1 overflow-y-auto">
            <DraftMail model={model} />
          </div>
        ) : (
          <>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              {!active || active.messages.length === 0 ? (
                <WelcomeScreen onPick={setInput} />
              ) : (
                <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-6 sm:px-6">
                  {active.messages.map((m) => (
                    <MessageItem
                      key={m.id}
                      message={m}
                      streaming={m.id === streamingId}
                      canRegenerate={m.id === lastAssistantId && !isGenerating}
                      onRegenerate={regenerate}
                    />
                  ))}
                  {isGenerating &&
                  streamingId &&
                  !active.messages.find((m) => m.id === streamingId)?.content ? (
                    <p className="animate-pulse text-sm text-muted-foreground">Thinking...</p>
                  ) : null}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>
            <ChatInput
              value={input}
              onChange={setInput}
              onSend={send}
              onStop={stop}
              isGenerating={isGenerating}
            />
          </>
        )}
      </main>
    </div>
  );
}
