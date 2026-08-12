"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Close, Search } from "./icons";
import { matchPartners } from "./partners";
import { affiliateLabel, fromPartner, partnerKey, type Affiliate } from "./affiliates";
import UnlistedForm from "./UnlistedForm";

const PAGE_SIZE = 20;

/**
 * The Assign a partner slideout, reused for policy ignore / watch lists.
 * `mode: "tabs"` adds the manual-entry tab used by variant B, where the
 * slideout is the only way in.
 */
export default function PartnerDrawer({
  onClose,
  onConfirm,
  existing,
  mode,
  intent,
}: {
  onClose: () => void;
  onConfirm: (entries: Affiliate[]) => void;
  existing: Set<string>;
  mode: "search" | "tabs";
  intent: "ignore" | "watch";
}) {
  const [tab, setTab] = useState<"search" | "manual">("search");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [picked, setPicked] = useState<Map<string, Affiliate>>(new Map());

  // Mounted only while open, so state starts clean on every open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const results = useMemo(() => matchPartners(query), [query]);
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const visible = results.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);
  const first = results.length === 0 ? 0 : current * PAGE_SIZE + 1;
  const last = Math.min(results.length, (current + 1) * PAGE_SIZE);

  const staged = [...picked.values()];

  function toggle(entry: Affiliate) {
    setPicked((prev) => {
      const next = new Map(prev);
      if (next.has(entry.key)) next.delete(entry.key);
      else next.set(entry.key, entry);
      return next;
    });
  }

  const listName = intent === "ignore" ? "ignore list" : "watchlist";

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label="Add affiliates"
    >
      <div className="absolute inset-0 bg-black/40 animate-[fadeIn_120ms_ease-out]" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-[460px] flex-col bg-white shadow-2xl animate-[slideIn_180ms_ease-out]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-rule px-[20px] py-[16px]">
          <div>
            <h2 className="font-display text-[15px] font-bold text-black">Add affiliates</h2>
            <p className="text-[11px] text-black/55">Adding to the {listName} for this policy.</p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="grid size-[30px] place-items-center rounded-[6px] text-black/60 hover:bg-black/5 hover:text-black"
          >
            <Close className="size-[20px]" />
          </button>
        </div>

        {mode === "tabs" && (
          <div className="flex gap-[4px] border-b border-rule px-[20px] pt-[12px]">
            {(
              [
                ["search", "Search directory"],
                ["manual", "Enter manually"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className={[
                  "-mb-px border-b-2 px-[10px] pb-[10px] text-[12px] font-semibold transition",
                  tab === value
                    ? "border-save text-black"
                    : "border-transparent text-black/50 hover:text-black",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {mode === "search" || tab === "search" ? (
          <>
            <div className="flex flex-col gap-[10px] border-b border-rule px-[20px] py-[12px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-[8px] top-1/2 size-[15px] -translate-y-1/2 text-black/40" />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(0);
                  }}
                  placeholder="Search company, website, ID or network"
                  className="min-h-[32px] w-full rounded-[6px] bg-field pl-[28px] pr-[8px] py-[6px] text-[12px] text-black outline-none placeholder:not-italic placeholder:text-black/50 focus:ring-2 focus:ring-save/40"
                />
              </div>
              <div className="flex items-center justify-between text-[12px] text-black/60">
                <span>
                  {first}-{last} of {results.length}
                </span>
                <span className="flex items-center gap-[4px]">
                  {Array.from({ length: pageCount }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPage(i)}
                      className={[
                        "min-w-[22px] rounded-[4px] border px-[5px] py-[1px] text-[11px] tabular-nums transition",
                        i === current
                          ? "border-save text-save"
                          : "border-transparent text-black/60 hover:bg-field",
                      ].join(" ")}
                    >
                      {i + 1}
                    </button>
                  ))}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {visible.length === 0 && (
                <div className="px-[20px] py-[24px] text-center text-[12px] text-black/55">
                  <p>No partners match “{query}”.</p>
                  {mode === "tabs" && (
                    <button
                      type="button"
                      onClick={() => setTab("manual")}
                      className="mt-[6px] font-semibold text-link hover:underline"
                    >
                      Enter the details manually
                    </button>
                  )}
                </div>
              )}
              {visible.map((p, i) => {
                const key = partnerKey(p.partnerId);
                const already = existing.has(key);
                const checked = already || picked.has(key);
                return (
                  <label
                    key={key}
                    className={[
                      "flex items-start gap-[12px] border-b border-rule px-[20px] py-[12px] text-[12px]",
                      i % 2 === 1 ? "bg-field" : "bg-white",
                      already ? "cursor-default opacity-60" : "cursor-pointer hover:bg-field-alt",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "mt-[2px] grid size-[16px] shrink-0 place-items-center rounded-[4px] border transition",
                        checked
                          ? already
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
                      disabled={already}
                      onChange={() => toggle(fromPartner(p))}
                    />
                    <span className="flex-1">
                      <span className="block font-semibold text-black">{p.handle}</span>
                      <span className="block text-black/70">Partner ID: {p.partnerId}</span>
                      <span className="block text-black/70">Company name: {p.company}</span>
                      <span className="block text-link">{p.website}</span>
                      <span className="block text-black/50">{p.network}</span>
                    </span>
                    {already && (
                      <span className="rounded-full bg-pill px-[8px] py-[2px] text-[10px] font-semibold text-black/70">
                        Added
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto px-[20px] py-[16px]">
            <p className="mb-[12px] text-[12px] leading-[18px] text-black/70">
              Most affiliates you want to {intent === "ignore" ? "ignore" : "watch"}{" "}
              won&apos;t be in our directory yet. Add them here and we&apos;ll match on whatever you
              give us.
            </p>
            <UnlistedForm submitLabel="Add to list" onSubmit={(entry) => toggle(entry)} />
          </div>
        )}

        {/* Staged selection */}
        {staged.length > 0 && (
          <div className="max-h-[132px] overflow-y-auto border-t border-rule bg-field px-[20px] py-[10px]">
            <p className="mb-[6px] text-[11px] font-bold uppercase tracking-[0.4px] text-black/45">
              Selected ({staged.length})
            </p>
            <div className="flex flex-wrap gap-[5px]">
              {staged.map((a) => (
                <span
                  key={a.key}
                  className="inline-flex items-center gap-[4px] rounded-[20px] bg-pill py-[4px] pl-[8px] pr-[4px] text-[12px] font-semibold text-black"
                >
                  {affiliateLabel(a)}
                  {!a.known && (
                    <span className="rounded-full bg-white/70 px-[6px] py-[1px] text-[10px] font-semibold text-black/60">
                      {a.scope === "network" ? "network" : "unlisted"}
                    </span>
                  )}
                  <button
                    type="button"
                    aria-label={`Remove ${affiliateLabel(a)}`}
                    onClick={() => toggle(a)}
                    className="grid size-[18px] place-items-center rounded-full text-black/70 hover:bg-black/10 hover:text-black"
                  >
                    <Close className="size-[14px]" />
                  </button>
                </span>
              ))}
            </div>
            <p className="mt-[6px] text-[11px] text-black/45">
              {staged.filter((a) => a.known).length} from directory ·{" "}
              {staged.filter((a) => !a.known).length} unlisted
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-[8px] border-t border-rule px-[20px] py-[14px]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[6px] px-[14px] py-[8px] text-[12px] font-semibold text-black/70 hover:bg-black/5"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={staged.length === 0}
            onClick={() => {
              onConfirm(staged);
              onClose();
            }}
            className="rounded-[6px] bg-save px-[16px] py-[8px] text-[12px] font-semibold text-white transition hover:bg-[#2b7de0] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-save"
          >
            Confirm{staged.length > 0 ? ` (${staged.length})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
