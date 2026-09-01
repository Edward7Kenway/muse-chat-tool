import { Eye, EyeOff, KeyRound, Plug, PlugZap } from "lucide-react";
import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getApiKey, setApiKey, subscribeApiKey } from "@/lib/api-key";

export function ApiKeyButton() {
  const [connected, setConnected] = useState(false);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    setConnected(getApiKey().length > 0);
    return subscribeApiKey((key) => setConnected(key.length > 0));
  }, []);

  const openDialog = () => {
    setDraft(getApiKey());
    setReveal(false);
    setOpen(true);
  };

  const save = () => {
    setApiKey(draft);
    setOpen(false);
  };

  const disconnect = () => {
    setApiKey("");
    setDraft("");
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        aria-label={connected ? "API key connected. Manage key" : "Connect your Gemini API key"}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
          connected
            ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15"
            : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        {connected ? <PlugZap className="size-4" /> : <Plug className="size-4" />}
        <span className="hidden sm:inline">{connected ? "Connected" : "Connect"}</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="size-4" /> Gemini API key
            </DialogTitle>
            <DialogDescription>
              Paste your key to start chatting. It is stored only in this browser and never sent
              anywhere except Google&apos;s Gemini API.
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <input
              type={reveal ? "text" : "password"}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
              }}
              placeholder="AIza..."
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 pr-10 font-mono text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            />
            <button
              type="button"
              onClick={() => setReveal((v) => !v)}
              aria-label={reveal ? "Hide key" : "Show key"}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
            >
              {reveal ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <button
              type="button"
              onClick={disconnect}
              disabled={!connected}
              className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
            >
              Disconnect
            </button>
            <button
              type="button"
              onClick={save}
              disabled={!draft.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              Save key
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
