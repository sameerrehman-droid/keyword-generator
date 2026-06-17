"use client";

import { useMemo, useRef, useState } from "react";
import { Close, Plus, Sparkle } from "./icons";

const MAX_KEYWORDS = 100;

/** Build up to 10 realistic suggestions from a brand name + domain. */
function buildSuggestions(brandRaw: string, domainRaw: string): string[] {
  const brand = brandRaw.trim().toLowerCase();
  const domain = domainRaw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");

  const suffixes = [
    "reviews",
    "coupons",
    "discount code",
    "promo code",
    "near me",
    "customer service",
    "login",
    "free shipping",
    "sale",
  ];

  const out: string[] = [];
  if (brand) {
    for (const s of suffixes) out.push(`${brand} ${s}`);
  }
  if (domain) out.push(domain);

  // Always aim for 10 suggestions.
  return out.slice(0, 10);
}

/** Split user input on commas / newlines into clean, de-duped keyword strings. */
function parseInput(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((k) => k.trim().replace(/\s+/g, " "))
    .filter(Boolean);
}

export default function KeywordsField() {
  const [brandName, setBrandName] = useState("Acme");
  const [brandDomain, setBrandDomain] = useState("www.acme.com");
  const [keywords, setKeywords] = useState<string[]>(["acme coupons"]);
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const overLimit = keywords.length > MAX_KEYWORDS;
  const atLimit = keywords.length >= MAX_KEYWORDS;
  const hasInput = input.trim().length > 0;

  const pending = useMemo(() => parseInput(input), [input]);

  function addKeywords(candidates: string[]) {
    if (candidates.length === 0) return;

    const existing = new Set(keywords.map((k) => k.toLowerCase()));
    const fresh: string[] = [];
    for (const c of candidates) {
      if (!existing.has(c.toLowerCase())) {
        existing.add(c.toLowerCase());
        fresh.push(c);
      }
    }
    if (fresh.length === 0) return;

    const room = MAX_KEYWORDS - keywords.length;
    if (fresh.length > room) {
      const accepted = fresh.slice(0, Math.max(0, room));
      setKeywords((prev) => [...prev, ...accepted]);
      const dropped = fresh.length - accepted.length;
      setError(
        `You can monitor up to ${MAX_KEYWORDS} keywords on your plan. ${dropped} keyword${
          dropped === 1 ? " was" : "s were"
        } not added.`,
      );
      return;
    }

    setKeywords((prev) => [...prev, ...fresh]);
    setError(null);
  }

  function commitInput() {
    if (!hasInput) return;
    addKeywords(parseInput(input));
    setInput("");
  }

  function removeKeyword(index: number) {
    setKeywords((prev) => prev.filter((_, i) => i !== index));
    if (error) setError(null);
  }

  function handleGenerate() {
    addKeywords(buildSuggestions(brandName, brandDomain));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitInput();
    } else if (e.key === "Backspace" && input.length === 0 && keywords.length > 0) {
      // Quick-delete the last pill when the input is empty.
      removeKeyword(keywords.length - 1);
    }
  }

  const showError = error !== null || overLimit;

  return (
    <div className="flex flex-col gap-[10px]">
      {/* Brand name / domain / generate */}
      <div className="flex flex-wrap items-end gap-[16px]">
        <label className="flex w-[260px] max-w-full flex-col gap-[8px]">
          <span className="text-[12px] font-bold text-black">Brand name</span>
          <input
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="e.g. Acme"
            className="min-h-[32px] rounded-[6px] bg-field px-[8px] py-[7px] text-[12px] text-black outline-none placeholder:italic placeholder:text-black/50 focus:ring-2 focus:ring-save/40"
          />
        </label>

        <label className="flex w-[260px] max-w-full flex-col gap-[8px]">
          <span className="text-[12px] font-bold text-black">Brand domain</span>
          <input
            value={brandDomain}
            onChange={(e) => setBrandDomain(e.target.value)}
            placeholder="e.g. www.acme.com"
            className="min-h-[32px] rounded-[6px] bg-field px-[8px] py-[7px] text-[12px] text-black outline-none placeholder:italic placeholder:text-black/50 focus:ring-2 focus:ring-save/40"
          />
        </label>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={!brandName.trim() && !brandDomain.trim()}
          className="inline-flex min-h-[32px] items-center gap-[6px] rounded-[6px] bg-edge px-[12px] py-[8px] font-display text-[12px] font-bold text-ink shadow-[0px_1px_0.5px_rgba(0,0,0,0.14)] transition hover:bg-[#d2d2d2] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Sparkle className="size-[14px]" />
          Generate keywords
        </button>
      </div>

      {/* Keyword input box */}
      <div
        onClick={() => inputRef.current?.focus()}
        className={[
          "relative min-h-[100px] cursor-text rounded-[6px] bg-field p-[8px] pb-[44px] transition-colors",
          "border-2",
          showError
            ? "border-danger"
            : focused
              ? "border-save"
              : "border-transparent",
        ].join(" ")}
      >
        <div className="flex flex-wrap items-center gap-[5px]">
          {keywords.map((kw, i) => (
            <span
              key={`${kw}-${i}`}
              className="inline-flex items-center gap-[2px] rounded-[20px] bg-pill py-[4px] pl-[8px] pr-[4px] text-[12px] font-semibold text-black"
            >
              {kw}
              <button
                type="button"
                aria-label={`Remove ${kw}`}
                onClick={(e) => {
                  e.stopPropagation();
                  removeKeyword(i);
                }}
                className="grid size-[18px] place-items-center rounded-full text-black/70 hover:bg-black/10 hover:text-black"
              >
                <Close className="size-[14px]" />
              </button>
            </span>
          ))}

          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={keywords.length ? "Add keywords" : "Add keywords (comma separated)"}
            aria-label="Add keywords"
            className="min-w-[160px] flex-1 bg-transparent py-[4px] text-[12px] text-black outline-none placeholder:italic placeholder:text-black/50"
          />
        </div>

        {/* Add button (bottom-right) */}
        <button
          type="button"
          aria-label="Add keywords"
          disabled={!hasInput}
          onClick={(e) => {
            e.stopPropagation();
            commitInput();
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

        {/* Live counter */}
        <span
          className={[
            "absolute bottom-[12px] right-[46px] text-[11px] tabular-nums",
            atLimit ? "font-bold text-danger" : "text-black/45",
          ].join(" ")}
        >
          {keywords.length} / {MAX_KEYWORDS}
        </span>
      </div>

      {/* Helper / error footer */}
      {showError ? (
        <p className="text-[12px] font-medium text-danger" role="alert">
          {error ??
            `You have ${keywords.length} keywords. Only ${MAX_KEYWORDS} can be monitored on your plan — remove some to continue.`}
        </p>
      ) : (
        <p className="flex flex-wrap gap-[4px] text-[12px] text-black">
          Up to {MAX_KEYWORDS} keywords can be monitored with your plan. Contact our sales team to
          upgrade to monitor more.
          <a className="text-link hover:underline" href="#">
            Contact now
          </a>
        </p>
      )}

      {pending.length > 1 && hasInput && (
        <p className="text-[11px] text-black/50">
          Press Enter to add {pending.length} keywords.
        </p>
      )}
    </div>
  );
}
