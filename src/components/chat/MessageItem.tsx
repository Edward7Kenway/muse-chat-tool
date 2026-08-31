import { AlertTriangle, Check, Copy, RefreshCw, ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";

import { Markdown } from "./Markdown";
import type { ChatMessage } from "@/types/chat";
import { cn } from "@/lib/utils";

interface Props {
  message: ChatMessage;
  streaming?: boolean;
  canRegenerate?: boolean;
  onRegenerate?: () => void;
}

function ActionButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        active && "text-primary",
      )}
    >
      {children}
    </button>
  );
}

export function MessageItem({ message, streaming, canRegenerate, onRegenerate }: Props) {
  const [copied, setCopied] = useState(false);
  const [vote, setVote] = useState<"up" | "down" | null>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-secondary px-4 py-2.5 text-[15px] leading-7 whitespace-pre-wrap text-secondary-foreground">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="group/message">
      {message.error ? (
        <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>{message.content}</p>
        </div>
      ) : (
        <div className={cn(streaming && !message.content && "text-muted-foreground")}>
          <div className={cn(streaming && "streaming-caret-wrap")}>
            <Markdown content={message.content} />
          </div>
        </div>
      )}

      {!streaming && !message.error && message.content ? (
        <div className="mt-1.5 -ml-2 flex items-center gap-0.5 opacity-70 transition-opacity group-hover/message:opacity-100">
          <ActionButton label={copied ? "Copied" : "Copy response"} onClick={copy}>
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {copied ? "Copied" : "Copy"}
          </ActionButton>
          {canRegenerate ? (
            <ActionButton label="Regenerate response" onClick={onRegenerate}>
              <RefreshCw className="size-3.5" />
              Regenerate
            </ActionButton>
          ) : null}
          <ActionButton
            label="Good response"
            active={vote === "up"}
            onClick={() => setVote(vote === "up" ? null : "up")}
          >
            <ThumbsUp className="size-3.5" />
          </ActionButton>
          <ActionButton
            label="Bad response"
            active={vote === "down"}
            onClick={() => setVote(vote === "down" ? null : "down")}
          >
            <ThumbsDown className="size-3.5" />
          </ActionButton>
        </div>
      ) : null}
    </div>
  );
}
