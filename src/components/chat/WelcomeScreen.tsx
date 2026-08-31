const SUGGESTIONS = [
  "Explain Kubernetes architecture",
  "Write a Dockerfile for Node.js",
  "Create a Terraform VPC",
  "Draft a professional leave email",
  "Explain CI/CD pipeline",
];

export function WelcomeScreen({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-12 text-center">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Hello, how can I help you?
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
        Ask anything, write code, troubleshoot infrastructure, or draft a professional
        email.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="rounded-full border border-border bg-card px-3.5 py-1.5 text-[13px] text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
