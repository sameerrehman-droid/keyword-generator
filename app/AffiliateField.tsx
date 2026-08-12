"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Close, Plus, Search } from "./icons";
import { NETWORKS, PARTNERS, type Partner } from "./partners";
import {
  affiliateLabel,
  affiliateMeta,
  fromFreeText,
  fromNetwork,
  fromPartner,
  networkKey,
  partnerKey,
  type Affiliate,
} from "./affiliates";
import PartnerDrawer from "./PartnerDrawer";
import { UnlistedDialog, draftFrom, EMPTY_DRAFT, type UnlistedDraft } from "./UnlistedForm";

export type AffiliateVariant = "combobox" | "slideout";

type Option =
  | { kind: "partner"; partner: Partner }
  | { kind: "network"; network: string }
  | { kind: "unlisted"; text: string };

function optionKey(o: Option) {
  if (o.kind === "partner") return partnerKey(o.partner.partnerId);
  if (o.kind === "network") return networkKey(o.network);
  return `new:${o.text.toLowerCase()}`;
}

export default function AffiliateField({
  variant,
  values,
  onChange,
  intent,
  label,
  conflicts,
}: {
  variant: AffiliateVariant;
  values: Affiliate[];
  onChange: (next: Affiliate[]) => void;
  intent: "ignore" | "watch";
  label: string;
  conflicts?: Set<string>;
}) {
  const [query, setQuery] = useState("");
  const [openList, setOpenList] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [focused, setFocused] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const existing = useMemo(() => new Set(values.map((a) => a.key)), [values]);

  // ---- combobox options ----
  const options: Option[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const partners = PARTNERS.filter(
      (p) =>
        !existing.has(partnerKey(p.partnerId)) &&
        (p.company.toLowerCase().includes(q) ||
          p.handle.includes(q) ||
          p.website.includes(q) ||
          p.partnerId.toLowerCase().includes(q)),
    ).slice(0, 6);
    const networks = NETWORKS.filter(
      (n) => n.toLowerCase().includes(q) && !existing.has(networkKey(n)),
    ).slice(0, 2);

    return [
      ...partners.map((partner) => ({ kind: "partner", partner }) as Option),
      ...networks.map((network) => ({ kind: "network", network }) as Option),
      { kind: "unlisted", text: query.trim() } as Option,
    ];
  }, [query, existing]);

  // Close the dropdown on an outside click.
  useEffect(() => {
    if (!openList) return;
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpenList(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [openList]);

  function add(entries: Affiliate[]) {
    const seen = new Set(existing);
    const fresh = entries.filter((a) => {
      if (seen.has(a.key)) return false;
      seen.add(a.key);
      return true;
    });
    if (fresh.length) onChange([...values, ...fresh]);
  }

  function removeAt(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  function replaceKey(key: string, entry: Affiliate) {
    onChange(
      values.map((a) => (a.key === key ? entry : a)).filter(
        // dropping a duplicate if the edit collided with an existing entry
        (a, i, arr) => arr.findIndex((b) => b.key === a.key) === i,
      ),
    );
  }

  function choose(option: Option) {
    if (option.kind === "partner") add([fromPartner(option.partner)]);
    else if (option.kind === "network") add([fromNetwork(option.network)]);
    else add([fromFreeText(option.text)]);
    setQuery("");
    setOpenList(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && query.length === 0 && values.length > 0) {
      removeAt(values.length - 1);
      return;
    }
    if (!openList || options.length === 0) {
      if (e.key === "Enter" && query.trim()) {
        e.preventDefault();
        choose({ kind: "unlisted", text: query.trim() });
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + options.length) % options.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(options[highlight]);
    } else if (e.key === "Escape") {
      setOpenList(false);
    }
  }

  const editing = values.find((a) => a.key === editingKey) ?? null;
  const editingDraft: UnlistedDraft = editing ? draftFrom(editing) : EMPTY_DRAFT;

  const pills = (
    <div className="flex flex-wrap items-center gap-[5px]">
      {values.map((a, i) => {
        const clash = conflicts?.has(a.key) ?? false;
        const meta = affiliateMeta(a);
        return (
          <span
            key={a.key}
            title={clash ? "This affiliate is on both the ignore list and the watchlist" : undefined}
            className={[
              "inline-flex items-center gap-[5px] rounded-[20px] py-[4px] pl-[8px] pr-[4px] text-[12px] font-semibold text-black",
              clash ? "bg-danger-bg ring-1 ring-danger/40" : "bg-pill",
            ].join(" ")}
          >
            {a.known && a.scope === "affiliate" && (
              <span
                title="Matched to a partner in our directory"
                className="grid size-[14px] place-items-center rounded-full bg-save text-white"
              >
                <Check className="size-[10px]" />
              </span>
            )}
            {affiliateLabel(a)}
            {meta && <span className="font-normal text-[11px] text-black/55">{meta}</span>}
            {a.scope === "network" && (
              <span className="rounded-full bg-white/70 px-[6px] py-[1px] text-[10px] font-semibold text-black/60">
                network
              </span>
            )}
            {!a.known && a.scope === "affiliate" && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingKey(a.key);
                }}
                title="Add ID or network details"
                className="rounded-full bg-white/70 px-[6px] py-[1px] text-[10px] font-semibold text-black/60 hover:bg-white hover:text-black"
              >
                unlisted
              </button>
            )}
            <button
              type="button"
              aria-label={`Remove ${affiliateLabel(a)}`}
              onClick={(e) => {
                e.stopPropagation();
                removeAt(i);
              }}
              className="grid size-[18px] place-items-center rounded-full text-black/70 hover:bg-black/10 hover:text-black"
            >
              <Close className="size-[14px]" />
            </button>
          </span>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col gap-[6px]">
      {variant === "combobox" ? (
        <div ref={boxRef} className="relative">
          <div
            onClick={() => inputRef.current?.focus()}
            className={[
              "relative min-h-[100px] cursor-text rounded-[6px] bg-field p-[8px] pb-[44px] transition-colors",
              "border-2",
              focused ? "border-save" : "border-transparent",
            ].join(" ")}
          >
            <div className="flex flex-wrap items-center gap-[5px]">
              {pills}
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setHighlight(0);
                  setOpenList(true);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  setFocused(true);
                  if (query) setOpenList(true);
                }}
                onBlur={() => setFocused(false)}
                placeholder={values.length ? "Add affiliates" : "Search by name, ID or network"}
                aria-label={label}
                aria-expanded={openList}
                role="combobox"
                aria-controls="affiliate-options"
                className="min-w-[180px] flex-1 bg-transparent py-[4px] text-[12px] text-black outline-none placeholder:italic placeholder:text-black/50"
              />
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDrawerOpen(true);
              }}
              className="absolute bottom-[11px] left-[10px] text-[12px] font-semibold text-link hover:underline"
            >
              Browse all partners
            </button>

            <button
              type="button"
              aria-label={label}
              disabled={!query.trim()}
              onClick={(e) => {
                e.stopPropagation();
                if (query.trim()) choose({ kind: "unlisted", text: query.trim() });
              }}
              className={[
                "absolute bottom-[5px] right-[5px] grid size-[32px] place-items-center rounded-[6px] border transition",
                query.trim()
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

          {openList && options.length > 0 && (
            <ul
              id="affiliate-options"
              role="listbox"
              className="absolute left-0 right-0 top-full z-30 mt-[4px] max-h-[300px] overflow-y-auto rounded-[6px] border border-edge bg-white py-[4px] shadow-[0_10px_20px_-6px_rgba(0,0,0,0.25)]"
            >
              {options.map((o, i) => {
                const active = i === highlight;
                const base = [
                  "flex cursor-pointer items-start gap-[10px] px-[12px] py-[8px] text-[12px]",
                  active ? "bg-field-alt" : "",
                ].join(" ");
                return (
                  <li
                    key={optionKey(o)}
                    role="option"
                    aria-selected={active}
                    onMouseEnter={() => setHighlight(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(o)}
                    className={base}
                  >
                    {o.kind === "partner" && (
                      <>
                        <span className="mt-[2px] grid size-[16px] shrink-0 place-items-center rounded-full bg-save text-white">
                          <Check className="size-[11px]" />
                        </span>
                        <span className="flex-1">
                          <span className="block font-semibold text-black">{o.partner.company}</span>
                          <span className="block text-black/60">
                            ID {o.partner.partnerId} · {o.partner.network} · {o.partner.website}
                          </span>
                        </span>
                      </>
                    )}
                    {o.kind === "network" && (
                      <>
                        <span className="mt-[2px] grid size-[16px] shrink-0 place-items-center rounded-full bg-black/10 text-[9px] font-bold text-black/60">
                          N
                        </span>
                        <span className="flex-1">
                          <span className="block font-semibold text-black">{o.network}</span>
                          <span className="block text-black/60">
                            {intent === "ignore" ? "Ignore" : "Watch"} every partner on this network
                          </span>
                        </span>
                      </>
                    )}
                    {o.kind === "unlisted" && (
                      <>
                        <span className="mt-[2px] grid size-[16px] shrink-0 place-items-center rounded-full border border-dashed border-black/35 text-black/50">
                          <Plus className="size-[11px]" />
                        </span>
                        <span className="flex-1">
                          <span className="block font-semibold text-black">
                            Add “{o.text}” as an unlisted affiliate
                          </span>
                          <span className="block text-black/60">
                            Not in our directory — you can add an ID or network after.
                          </span>
                        </span>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : (
        <>
          <div className="relative min-h-[100px] rounded-[6px] bg-field p-[8px]">
            {values.length ? (
              pills
            ) : (
              <span className="text-[12px] italic text-black/50">
                No affiliates added — use Add affiliates
              </span>
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center gap-[6px] rounded-[6px] bg-save px-[14px] py-[8px] text-[12px] font-semibold text-white transition hover:bg-[#2b7de0]"
            >
              <Search className="size-[14px]" />
              Add affiliates
            </button>
          </div>
        </>
      )}

      {drawerOpen && (
        <PartnerDrawer
          onClose={() => setDrawerOpen(false)}
          onConfirm={add}
          existing={existing}
          mode={variant === "combobox" ? "search" : "tabs"}
          intent={intent}
        />
      )}

      <UnlistedDialog
        open={editingKey !== null}
        initial={editingDraft}
        onClose={() => setEditingKey(null)}
        onSave={(entry) => {
          if (editingKey) replaceKey(editingKey, entry);
        }}
      />
    </div>
  );
}
