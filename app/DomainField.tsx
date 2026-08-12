"use client";

import { useMemo, useRef, useState } from "react";
import { Close, Plus } from "./icons";
import { cleanDomain, isValidDomain } from "./suggestions";

/** Split on commas / newlines into trimmed, non-empty tokens. */
function parseInput(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);
}

/** True when the token is not a whole domain — a path, a fragment, or a tracking code. */
export function isPartialMatch(value: string): boolean {
  return !isValidDomain(value);
}

export default function DomainField({
  values,
  onChange,
  label,
  placeholder = "Add domains",
  /** Ignore lists accept partial URLs and tracking codes; owned domains must be real domains. */
  allowPartial = false,
  conflicts,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  label: string;
  placeholder?: string;
  allowPartial?: boolean;
  conflicts?: Set<string>;
}) {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasInput = input.trim().length > 0;
  const existing = useMemo(() => new Set(values), [values]);

  function add(candidates: string[]) {
    const fresh: string[] = [];
    const rejected: string[] = [];
    const seen = new Set(existing);

    for (const raw of candidates) {
      const whole = isValidDomain(raw);
      if (!whole && !allowPartial) {
        rejected.push(raw);
        continue;
      }
      const value = whole ? cleanDomain(raw) : raw;
      if (seen.has(value)) continue;
      seen.add(value);
      fresh.push(value);
    }

    if (rejected.length) {
      setError(
        `${rejected.join(", ")} — enter a full domain you own, e.g. acme.com.`,
      );
    } else {
      setError(null);
    }
    if (fresh.length) onChange([...values, ...fresh]);
  }

  function commit() {
    if (!hasInput) return;
    add(parseInput(input));
    setInput("");
  }

  function remove(index: number) {
    onChange(values.filter((_, i) => i !== index));
    setError(null);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && input.length === 0 && values.length > 0) {
      remove(values.length - 1);
    }
  }

  return (
    <div className="flex flex-col gap-[6px]">
      <div
        onClick={() => inputRef.current?.focus()}
        className={[
          "relative min-h-[100px] cursor-text rounded-[6px] bg-field p-[8px] pb-[44px] transition-colors",
          "border-2",
          error ? "border-danger" : focused ? "border-save" : "border-transparent",
        ].join(" ")}
      >
        <div className="flex flex-wrap items-center gap-[5px]">
          {values.map((domain, i) => {
            const partial = isPartialMatch(domain);
            const clash = conflicts?.has(domain) ?? false;
            return (
              <span
                key={`${domain}-${i}`}
                title={
                  clash
                    ? "This domain is on both the ignore list and the watchlist"
                    : partial
                      ? "Partial match — alerts match any URL containing this text"
                      : undefined
                }
                className={[
                  "inline-flex items-center gap-[4px] rounded-[20px] py-[4px] pl-[8px] pr-[4px] text-[12px] font-semibold text-black",
                  clash ? "bg-danger-bg ring-1 ring-danger/40" : "bg-pill",
                ].join(" ")}
              >
                {domain}
                {partial && (
                  <span className="rounded-full bg-white/70 px-[6px] py-[1px] text-[10px] font-semibold text-black/60">
                    contains
                  </span>
                )}
                <button
                  type="button"
                  aria-label={`Remove ${domain}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(i);
                  }}
                  className="grid size-[18px] place-items-center rounded-full text-black/70 hover:bg-black/10 hover:text-black"
                >
                  <Close className="size-[14px]" />
                </button>
              </span>
            );
          })}

          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={values.length ? "Add domains" : placeholder}
            aria-label={label}
            className="min-w-[160px] flex-1 bg-transparent py-[4px] text-[12px] text-black outline-none placeholder:italic placeholder:text-black/50"
          />
        </div>

        <button
          type="button"
          aria-label={label}
          disabled={!hasInput}
          onClick={(e) => {
            e.stopPropagation();
            commit();
          }}
          className={[
            "absolute bottom-[5px] right-[5px] grid size-[32px] place-items-center rounded-[6px] border transition",
            hasInput
              ? "border-save bg-save text-white shadow-sm hover:bg-[#2b7de0]"
              : "cursor-not-allowed border-edge bg-white text-black/30",
          ].join(" ")}
        >
          <Plus className="size-[20px]" />
        </button>

        {values.length > 0 && (
          <span className="absolute bottom-[12px] right-[46px] text-[11px] tabular-nums text-black/45">
            {values.length}
          </span>
        )}
      </div>

      {error && (
        <p className="text-[12px] font-medium text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
