import { AlertTriangle, Check, Copy, Loader2, Mail, RefreshCw, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MAIL_TONES, generateMail } from "@/services/gemini";
import type { MailTone } from "@/types/chat";
import type { ModelKey } from "@/config";

export function DraftMail({ model }: { model: ModelKey }) {
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [tone, setTone] = useState<MailTone>("professional");
  const [instructions, setInstructions] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const run = async () => {
    if (!instructions.trim() || loading) return;
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const text = await generateMail({
        model,
        recipient,
        subject,
        tone,
        instructions,
        signal: controller.signal,
      });
      setEmail(text);
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") {
        setError((err as Error).message || "Unable to generate the email.");
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const clearAll = () => {
    setEmail("");
    setError(null);
  };

  const fieldClass =
    "w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring/30";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-6 flex items-start gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <Mail className="size-4.5" />
        </span>
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Draft Mail</h1>
          <p className="text-sm text-muted-foreground">
            Draft professional emails in seconds. Choose a tone and describe what you need.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="mail-to" className="mb-1.5 block text-xs font-medium">
            To
          </label>
          <input
            id="mail-to"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="manager@company.com"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="mail-subject" className="mb-1.5 block text-xs font-medium">
            Subject
          </label>
          <input
            id="mail-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Sick leave request"
            className={fieldClass}
          />
        </div>
      </div>

      <div className="mt-4 max-w-xs">
        <label htmlFor="mail-tone" className="mb-1.5 block text-xs font-medium">
          Tone
        </label>
        <Select value={tone} onValueChange={(v) => setTone(v as MailTone)}>
          <SelectTrigger id="mail-tone" aria-label="Email tone" className="w-full bg-card">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MAIL_TONES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                <span className="flex flex-col">
                  <span className="text-sm">{t.label}</span>
                  <span className="text-xs text-muted-foreground">{t.description}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4">
        <label htmlFor="mail-instructions" className="mb-1.5 block text-xs font-medium">
          Instructions
        </label>
        <textarea
          id="mail-instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={5}
          placeholder="Describe what you want to write..."
          className={`${fieldClass} resize-y leading-6`}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={run}
          disabled={!instructions.trim() || loading}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
          {loading ? "Generating..." : "Generate Mail"}
        </button>
        {loading ? (
          <button
            type="button"
            onClick={() => abortRef.current?.abort()}
            className="rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"
          >
            Stop
          </button>
        ) : null}
      </div>

      {error ? (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>{error}</p>
        </div>
      ) : null}

      <div className="mt-6">
        <div className="mb-1.5 flex items-center justify-between">
          <label htmlFor="mail-output" className="text-xs font-medium">
            Generated email
          </label>
          {email ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={copyEmail}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? "Copied!" : "Copy Email"}
              </button>
              <button
                type="button"
                onClick={run}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <RefreshCw className="size-3.5" />
                Regenerate
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Trash2 className="size-3.5" />
                Clear
              </button>
            </div>
          ) : null}
        </div>
        <textarea
          id="mail-output"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          rows={12}
          placeholder="Your generated email will appear here — you can edit it before sending."
          className={`${fieldClass} resize-y font-normal leading-7`}
        />
      </div>
    </div>
  );
}
