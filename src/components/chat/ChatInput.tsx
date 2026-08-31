import { ArrowUp, Square } from "lucide-react";
import { useEffect, useRef } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onStop: () => void;
  isGenerating: boolean;
}

export function ChatInput({ value, onChange, onSend, onStop, isGenerating }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }, [value]);

  const canSend = value.trim().length > 0 && !isGenerating;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-4 sm:px-6">
      <div className="rounded-2xl border border-border bg-card p-2 shadow-sm transition-shadow focus-within:border-primary/40 focus-within:shadow-md">
        <label htmlFor="chat-input" className="sr-only">
          Message the assistant
        </label>
        <textarea
          id="chat-input"
          ref={ref}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (canSend) onSend();
            }
          }}
          placeholder="Ask anything..."
          className="max-h-[220px] w-full resize-none bg-transparent px-3 py-2 text-[15px] leading-6 outline-none placeholder:text-muted-foreground"
        />
        <div className="flex items-center justify-between gap-3 px-2 pt-1">
          <p className="hidden text-[11px] text-muted-foreground sm:block">
            Enter to send · Shift + Enter for a new line
          </p>
          {isGenerating ? (
            <button
              type="button"
              onClick={onStop}
              aria-label="Stop generating"
              className="inline-flex size-9 items-center justify-center rounded-full bg-foreground text-background transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <Square className="size-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onSend}
              disabled={!canSend}
              aria-label="Send message"
              className="inline-flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <ArrowUp className="size-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
