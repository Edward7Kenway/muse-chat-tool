import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface CodeBlockProps {
  language: string;
  code: string;
  children: React.ReactNode;
}

export function CodeBlock({ language, code, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => (timer.current ? clearTimeout(timer.current) : undefined), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-border/60 shadow-sm">
      <div className="flex items-center justify-between gap-3 bg-code-header px-3 py-1.5">
        <span className="font-mono text-[11px] tracking-wide text-code-surface-foreground/70 uppercase">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Code copied" : "Copy code"}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-code-surface-foreground/75 transition-colors hover:bg-white/10 hover:text-code-surface-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto bg-code-surface px-4 py-3 text-[13px] leading-relaxed text-code-surface-foreground">
        {children}
      </pre>
    </div>
  );
}
