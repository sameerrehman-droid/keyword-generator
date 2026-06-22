"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Close, Plus, Search } from "./icons";
import {
  buildLargeSuggestions,
  cleanDomain,
  isValidDomain,
  MAX_KEYWORDS,
  type Suggestion,
} from "./suggestions";

/** Split user input on commas / newlines into clean, de-duped keyword strings. */
function parseInput(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((k) => k.trim().replace(/\s+/g, " "))
    .filter(Boolean);
}

export default function KeywordsManager() {
  // Keyword box
  const [keywords, setKeywords] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Brand / generator
  const [brandName, setBrandName] = useState("");
  const [brandDomain, setBrandDomain] = useState("");

  // Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [limitHit, setLimitHit] = useState(false);
  const [editBrand, setEditBrand] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);

  const overLimit = keywords.length > MAX_KEYWORDS;
  const atLimit = keywords.length >= MAX_KEYWORDS;
  const hasInput = input.trim().length > 0;
  const domainValid = isValidDomain(brandDomain);
  const canGenerate = brandName.trim().length > 0 && domainValid;
  const domainError = brandDomain.trim().length > 0 && !domainValid;

  const pending = useMemo(() => parseInput(input), [input]);
  const keywordsLower = useMemo(
    () => new Set(keywords.map((k) => k.toLowerCase())),
    [keywords],
  );
  const suggestionKeySet = useMemo(
    () => new Set(suggestions.map((s) => s.keyword.toLowerCase())),
    [suggestions],
  );

  // ----- keyword box helpers -----
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

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitInput();
    } else if (e.key === "Backspace" && input.length === 0 && keywords.length > 0) {
      removeKeyword(keywords.length - 1);
    }
  }

  // ----- drawer -----
  // Checked state always reflects current box membership (the "Active" keywords),
  // plus whatever new picks the user has made this session.
  function syncSelectionToBox(list: Suggestion[]) {
    setSelected(
      new Set(
        list
          .filter((s) => keywordsLower.has(s.keyword.toLowerCase()))
          .map((s) => s.keyword.toLowerCase()),
      ),
    );
  }

  function openDrawer() {
    setLimitHit(false);
    if (suggestions.length > 0) {
      syncSelectionToBox(suggestions);
      setEditBrand(false);
    } else if (canGenerate) {
      const list = buildLargeSuggestions(brandName, brandDomain);
      setSuggestions(list);
      syncSelectionToBox(list);
      setEditBrand(false);
    } else {
      setEditBrand(true);
    }
    setDrawerOpen(true);
  }

  function generateInDrawer() {
    if (!canGenerate) return;
    const list = buildLargeSuggestions(brandName, brandDomain);
    setSuggestions(list);
    syncSelectionToBox(list);
    setEditBrand(false);
    setLimitHit(false);
  }

  // Box keywords that are not part of this batch — always preserved & counted.
  const manualKeywords = useMemo(
    () => keywords.filter((k) => !suggestionKeySet.has(k.toLowerCase())),
    [keywords, suggestionKeySet],
  );
  const projectedTotal = manualKeywords.length + selected.size;
  const slotsLeft = MAX_KEYWORDS - projectedTotal;

  function toggleSuggestion(s: Suggestion) {
    const key = s.keyword.toLowerCase();
    if (keywordsLower.has(key)) return; // Active keywords are locked (remove via the pill)
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        setLimitHit(false);
      } else {
        if (manualKeywords.length + next.size >= MAX_KEYWORDS) {
          setLimitHit(true);
          return prev;
        }
        next.add(key);
      }
      return next;
    });
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? suggestions.filter((s) => s.keyword.toLowerCase().includes(q)) : suggestions;
  }, [suggestions, query]);

  const grouped = useMemo(() => {
    const map = new Map<string, Suggestion[]>();
    for (const s of filtered) {
      const arr = map.get(s.category) ?? [];
      arr.push(s);
      map.set(s.category, arr);
    }
    return [...map.entries()];
  }, [filtered]);

  function selectAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      let room = MAX_KEYWORDS - manualKeywords.length - next.size;
      for (const s of filtered) {
        if (room <= 0) {
          setLimitHit(true);
          break;
        }
        const key = s.keyword.toLowerCase();
        if (!next.has(key)) {
          next.add(key);
          room--;
        }
      }
      return next;
    });
  }

  function clearSelection() {
    // Keep Active (already-in-box) keywords checked; only clear new picks.
    syncSelectionToBox(suggestions);
    setLimitHit(false);
  }

  function applyDrawer() {
    // Additive only: add the newly-selected suggestions that aren't already in the box.
    const chosen = suggestions
      .filter((s) => selected.has(s.keyword.toLowerCase()) && !keywordsLower.has(s.keyword.toLowerCase()))
      .map((s) => s.keyword);
    addKeywords(chosen);
    setDrawerOpen(false);
  }

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const showError = error !== null || overLimit;
  const selectedCount = selected.size;
  const newPicks = useMemo(
    () => suggestions.filter((s) => selected.has(s.keyword.toLowerCase()) && !keywordsLower.has(s.keyword.toLowerCase())).length,
    [suggestions, selected, keywordsLower],
  );

  return (
    <div className="flex flex-col gap-[10px]">
      {/* Trigger */}
      <div>
        <button
          type="button"
          onClick={openDrawer}
          className="inline-flex min-h-[32px] items-center rounded-[6px] bg-edge px-[12px] py-[8px] font-display text-[12px] font-bold text-ink shadow-[0px_1px_0.5px_rgba(0,0,0,0.14)] transition hover:bg-[#d2d2d2]"
        >
          {suggestions.length ? "Edit keyword suggestions" : "Generate keywords"}
        </button>
      </div>

      {/* Keyword box */}
      <div
        onClick={() => inputRef.current?.focus()}
        className={[
          "relative min-h-[100px] cursor-text rounded-[6px] bg-field p-[8px] pb-[44px] transition-colors",
          "border-2",
          showError ? "border-danger" : focused ? "border-save" : "border-transparent",
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
        <p className="text-[11px] text-black/50">Press Enter to add {pending.length} keywords.</p>
      )}

      {/* ------------------------- SLIDE-OUT DRAWER ------------------------- */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Generate keywords">
          <div
            className="absolute inset-0 bg-black/40 animate-[fadeIn_120ms_ease-out]"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative flex h-full w-full max-w-[460px] flex-col bg-white shadow-2xl animate-[slideIn_180ms_ease-out]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-rule px-[20px] py-[16px]">
              <div>
                <h2 className="font-display text-[15px] font-bold text-black">Generate keywords</h2>
                <p className="text-[11px] text-black/55">
                  Suggest keywords from a brand, then pick which to add.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setDrawerOpen(false)}
                className="grid size-[30px] place-items-center rounded-[6px] text-black/60 hover:bg-black/5 hover:text-black"
              >
                <Close className="size-[20px]" />
              </button>
            </div>

            {/* Brand inputs (collapsible) */}
            {editBrand ? (
              <div className="flex flex-col gap-[12px] border-b border-rule px-[20px] py-[16px]">
                <label className="flex flex-col gap-[6px]">
                  <span className="text-[12px] font-bold text-black">Brand name</span>
                  <input
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="Enter brand name"
                    className="min-h-[34px] rounded-[6px] bg-field px-[10px] py-[7px] text-[12px] text-black outline-none placeholder:not-italic placeholder:text-black/50 focus:ring-2 focus:ring-save/40"
                  />
                </label>
                <label className="flex flex-col gap-[6px]">
                  <span className="text-[12px] font-bold text-black">Brand domain</span>
                  <input
                    value={brandDomain}
                    onChange={(e) => setBrandDomain(e.target.value)}
                    placeholder="Enter brand domain"
                    aria-invalid={domainError}
                    className={[
                      "min-h-[34px] rounded-[6px] bg-field px-[10px] py-[7px] text-[12px] text-black outline-none focus:ring-2",
                      domainError ? "ring-1 ring-danger focus:ring-danger/50" : "focus:ring-save/40",
                    ].join(" ")}
                  />
                  {domainError && (
                    <span className="text-[11px] text-danger">Enter a valid domain, e.g. acme.com</span>
                  )}
                </label>
                <button
                  type="button"
                  onClick={generateInDrawer}
                  disabled={!canGenerate}
                  className="inline-flex min-h-[34px] items-center justify-center self-start rounded-[6px] bg-edge px-[14px] font-display text-[12px] font-bold text-ink shadow-[0px_1px_0.5px_rgba(0,0,0,0.14)] transition hover:bg-[#d2d2d2] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-edge"
                >
                  {suggestions.length ? "Regenerate suggestions" : "Generate keywords"}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-[10px] border-b border-rule px-[20px] py-[12px]">
                <span className="text-[12px] text-black/70">
                  Generating from <span className="font-semibold text-black">{brandName}</span>
                  {" · "}
                  {cleanDomain(brandDomain)}
                </span>
                <button
                  type="button"
                  onClick={() => setEditBrand(true)}
                  className="shrink-0 text-[12px] font-semibold text-link hover:underline"
                >
                  Edit
                </button>
              </div>
            )}

            {suggestions.length > 0 ? (
              <>
                {/* Controls */}
                <div className="flex flex-col gap-[10px] border-b border-rule px-[20px] py-[12px]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-[8px] top-1/2 size-[15px] -translate-y-1/2 text-black/40" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search suggestions"
                      className="min-h-[32px] w-full rounded-[6px] bg-field pl-[28px] pr-[8px] py-[6px] text-[12px] text-black outline-none placeholder:not-italic placeholder:text-black/50 focus:ring-2 focus:ring-save/40"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-black/60">
                      <span className="font-semibold text-black">{selectedCount}</span> selected ·{" "}
                      <span className={slotsLeft <= 0 ? "font-semibold text-danger" : ""}>
                        {Math.max(0, slotsLeft)} of {MAX_KEYWORDS} slots left
                      </span>
                    </span>
                    <span className="flex items-center gap-[12px]">
                      <button
                        type="button"
                        onClick={selectAll}
                        className="font-semibold text-link hover:underline"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={clearSelection}
                        className="text-link hover:underline disabled:text-black/30 disabled:no-underline"
                        disabled={newPicks === 0}
                      >
                        Clear
                      </button>
                    </span>
                  </div>
                  {limitHit && (
                    <p className="text-[11px] font-medium text-danger">
                      You&apos;ve reached the {MAX_KEYWORDS}-keyword limit. Remove some keywords to add others.
                    </p>
                  )}
                </div>

                {/* Suggestion list */}
                <div className="flex-1 overflow-y-auto px-[20px] py-[8px]">
                  {grouped.length === 0 && (
                    <p className="py-[20px] text-center text-[12px] text-black/50">
                      No suggestions match “{query}”.
                    </p>
                  )}
                  {grouped.map(([category, items]) => (
                    <div key={category} className="py-[8px]">
                      <p className="mb-[4px] text-[11px] font-bold uppercase tracking-[0.4px] text-black/45">
                        {category}
                      </p>
                      <ul className="flex flex-col">
                        {items.map((s) => {
                          const key = s.keyword.toLowerCase();
                          const active = keywordsLower.has(key);
                          const checked = active || selected.has(key);
                          const blocked = !checked && slotsLeft <= 0;
                          const disabled = active || blocked;
                          return (
                            <li key={key}>
                              <label
                                title={active ? "Already in your keywords — remove it from the box to deselect" : undefined}
                                className={[
                                  "flex items-center gap-[10px] rounded-[6px] px-[6px] py-[7px] text-[12px]",
                                  active ? "cursor-default" : blocked ? "cursor-not-allowed opacity-40" : "cursor-pointer hover:bg-field",
                                ].join(" ")}
                              >
                                <span
                                  className={[
                                    "grid size-[16px] shrink-0 place-items-center rounded-[4px] border transition",
                                    checked
                                      ? active
                                        ? "border-[#8fb6ec] bg-[#8fb6ec] text-white"
                                        : "border-save bg-save text-white"
                                      : "border-[#bbb] bg-white text-transparent",
                                  ].join(" ")}
                                >
                                  <Check className="size-[12px]" />
                                </span>
                                <input
                                  type="checkbox"
                                  className="sr-only"
                                  checked={checked}
                                  disabled={disabled}
                                  onChange={() => toggleSuggestion(s)}
                                />
                                <span className="flex-1 text-black">{s.keyword}</span>
                                {active && (
                                  <span className="rounded-full bg-pill px-[8px] py-[2px] text-[10px] font-semibold text-black/70">
                                    Active
                                  </span>
                                )}
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-[10px] border-t border-rule px-[20px] py-[14px]">
                  <span className="text-[12px] text-black/55">
                    {projectedTotal} / {MAX_KEYWORDS} keywords after update
                  </span>
                  <div className="flex items-center gap-[8px]">
                    <button
                      type="button"
                      onClick={() => setDrawerOpen(false)}
                      className="rounded-[6px] px-[14px] py-[8px] text-[12px] font-semibold text-black/70 hover:bg-black/5"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={applyDrawer}
                      disabled={newPicks === 0}
                      className="rounded-[6px] bg-save px-[16px] py-[8px] text-[12px] font-semibold text-white transition hover:bg-[#2b7de0] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-save"
                    >
                      Add {newPicks > 0 ? `${newPicks} ` : ""}keyword{newPicks === 1 ? "" : "s"}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center px-[20px] text-center">
                <p className="text-[12px] text-black/50">
                  Enter a brand name and domain, then generate to see suggested keywords.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
