import { Check, ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MODEL_OPTIONS, type ModelKey } from "@/config";

interface Props {
  value: ModelKey;
  onChange: (value: ModelKey) => void;
}

export function ModelSelector({ value, onChange }: Props) {
  const active = MODEL_OPTIONS.find((m) => m.key === value) ?? MODEL_OPTIONS[0]!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Model: ${active.label}. Change model`}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {active.label}
        <ChevronDown className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        {MODEL_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.key}
            onSelect={() => onChange(option.key)}
            className="items-start gap-2 py-2"
          >
            <Check
              className={`mt-0.5 size-4 shrink-0 ${option.key === value ? "opacity-100 text-primary" : "opacity-0"}`}
            />
            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{option.label}</span>
              <span className="text-xs text-muted-foreground">{option.description}</span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
