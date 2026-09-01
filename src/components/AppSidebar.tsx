import { Check, Mail, MessageSquare, MoreHorizontal, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { groupConversations } from "@/lib/chat-storage";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/chat";

export type View = "chat" | "mail";

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  view: View;
  onNewChat: () => void;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onOpenMail: () => void;
  onClose?: (() => void) | undefined;
}

export function AppSidebar({
  conversations,
  activeId,
  view,
  onNewChat,
  onSelect,
  onRename,
  onDelete,
  onOpenMail,
  onClose,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId) inputRef.current?.focus();
  }, [editingId]);

  const groups = groupConversations(conversations);

  const commitRename = () => {
    if (editingId) onRename(editingId, draftTitle.trim() || "Untitled chat");
    setEditingId(null);
  };

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <MessageSquare className="size-4" />
          </span>
          <span className="text-sm font-semibold tracking-tight">Nimbus Assistant</span>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent md:hidden"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      <div className="px-3">
        <button
          type="button"
          onClick={onNewChat}
          className="inline-flex w-full items-center gap-2 rounded-lg border border-sidebar-border bg-sidebar-accent/40 px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none"
        >
          <Plus className="size-4" />
          New Chat
        </button>
      </div>

      <nav className="mt-4 min-h-0 flex-1 overflow-y-auto px-3 pb-2" aria-label="Chat history">
        <p className="px-2 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          Chats
        </p>
        {conversations.length === 0 ? (
          <p className="px-2 py-2 text-xs text-muted-foreground">No conversations yet.</p>
        ) : null}
        {groups.map((group) => (
          <div key={group.label} className="mb-3">
            <p className="px-2 py-1 text-[11px] font-medium text-muted-foreground">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((c) => {
                const isActive = view === "chat" && c.id === activeId;
                return (
                  <li key={c.id} className="group/item relative">
                    {editingId === c.id ? (
                      <div className="flex items-center gap-1 px-1">
                        <input
                          ref={inputRef}
                          value={draftTitle}
                          onChange={(e) => setDraftTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitRename();
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          onBlur={commitRename}
                          aria-label="Rename conversation"
                          className="w-full rounded-md border border-sidebar-border bg-background px-2 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
                        />
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={commitRename}
                          aria-label="Save name"
                          className="rounded-md p-1.5 hover:bg-sidebar-accent"
                        >
                          <Check className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => onSelect(c.id)}
                          className={cn(
                            "w-full truncate rounded-lg py-2 pr-9 pl-2.5 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none",
                            isActive
                              ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                              : "hover:bg-sidebar-accent/60",
                          )}
                        >
                          {c.title}
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            aria-label={`Options for ${c.title}`}
                            className="absolute top-1/2 right-1 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity group-hover/item:opacity-100 focus-visible:opacity-100 hover:bg-sidebar-border data-[state=open]:opacity-100"
                          >
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              onSelect={() => {
                                setDraftTitle(c.title);
                                setEditingId(c.id);
                              }}
                            >
                              <Pencil className="size-4" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onSelect={() => onDelete(c.id)}
                            >
                              <Trash2 className="size-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-3 py-3">
        <p className="px-2 pb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          Tools
        </p>
        <button
          type="button"
          onClick={onOpenMail}
          className={cn(
            "inline-flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none",
            view === "mail"
              ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
              : "hover:bg-sidebar-accent/60",
          )}
        >
          <Mail className="size-4" />
          Draft Mail
        </button>
      </div>
    </div>
  );
}
