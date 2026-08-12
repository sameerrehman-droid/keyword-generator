"use client";

import { useEffect, useState } from "react";
import { Close } from "./icons";
import { hasIdentifier, makeUnlisted, type Affiliate } from "./affiliates";
import { NETWORKS } from "./partners";

export type UnlistedDraft = {
  partnerId: string;
  name: string;
  network: string;
  networkOnly: boolean;
};

export const EMPTY_DRAFT: UnlistedDraft = {
  partnerId: "",
  name: "",
  network: "",
  networkOnly: false,
};

export function draftFrom(a: Affiliate): UnlistedDraft {
  return {
    partnerId: a.partnerId ?? "",
    name: a.name ?? "",
    network: a.network ?? "",
    networkOnly: a.scope === "network",
  };
}

const inputClass =
  "min-h-[34px] rounded-[6px] bg-field px-[10px] py-[7px] text-[12px] text-black outline-none placeholder:not-italic placeholder:text-black/45 focus:ring-2 focus:ring-save/40";

/**
 * Details for an affiliate we don't have in the DB. Any one of ID / name /
 * network is enough — most of the time the user has only seen a name in an ad.
 */
export default function UnlistedForm({
  initial = EMPTY_DRAFT,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: UnlistedDraft;
  submitLabel: string;
  onSubmit: (entry: Affiliate) => void;
  onCancel?: () => void;
}) {
  // Mounted fresh each time the dialog opens, so `initial` only needs reading once.
  const [draft, setDraft] = useState<UnlistedDraft>(initial);

  const valid = hasIdentifier(draft) && (!draft.networkOnly || draft.network.trim().length > 0);

  function set<K extends keyof UnlistedDraft>(key: K, value: UnlistedDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="flex flex-col gap-[12px]">
      <div className="grid grid-cols-2 gap-[10px]">
        <label className="flex flex-col gap-[6px]">
          <span className="text-[12px] font-bold text-black">Affiliate name</span>
          <input
            value={draft.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Coupon Cactus"
            disabled={draft.networkOnly}
            className={`${inputClass} disabled:opacity-40`}
          />
        </label>
        <label className="flex flex-col gap-[6px]">
          <span className="text-[12px] font-bold text-black">Affiliate ID</span>
          <input
            value={draft.partnerId}
            onChange={(e) => set("partnerId", e.target.value)}
            placeholder="e.g. 1011I138782"
            disabled={draft.networkOnly}
            className={`${inputClass} disabled:opacity-40`}
          />
        </label>
      </div>

      <label className="flex flex-col gap-[6px]">
        <span className="text-[12px] font-bold text-black">Network</span>
        <input
          value={draft.network}
          onChange={(e) => set("network", e.target.value)}
          placeholder="Search or type a network"
          list="affiliate-networks"
          className={inputClass}
        />
        <datalist id="affiliate-networks">
          {NETWORKS.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
      </label>

      <label className="flex cursor-pointer items-start gap-[8px]">
        <input
          type="checkbox"
          checked={draft.networkOnly}
          onChange={(e) => set("networkOnly", e.target.checked)}
          className="mt-[2px] size-[14px] accent-[#368ef8]"
        />
        <span className="text-[12px] leading-[17px] text-black">
          Apply to every partner on this network
          <span className="block text-[11px] text-black/55">
            Use this when you want a whole network covered, not one affiliate.
          </span>
        </span>
      </label>

      <p className="text-[11px] text-black/55">
        Add whichever details you have — one of name, ID or network is enough.
      </p>

      <div className="flex items-center gap-[8px]">
        <button
          type="button"
          disabled={!valid}
          onClick={() => {
            onSubmit(makeUnlisted(draft));
            setDraft(EMPTY_DRAFT);
          }}
          className="rounded-[6px] bg-save px-[14px] py-[8px] text-[12px] font-semibold text-white transition hover:bg-[#2b7de0] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-save"
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-[6px] px-[12px] py-[8px] text-[12px] font-semibold text-black/70 hover:bg-black/5"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

/** Modal wrapper — used when filling in details on an already-added unlisted pill. */
export function UnlistedDialog({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: UnlistedDraft;
  onClose: () => void;
  onSave: (entry: Affiliate) => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center p-[20px]"
      role="dialog"
      aria-modal="true"
      aria-label="Affiliate details"
    >
      <div className="absolute inset-0 bg-black/40 animate-[fadeIn_120ms_ease-out]" onClick={onClose} />
      <div className="relative w-full max-w-[440px] rounded-[8px] bg-white p-[20px] shadow-2xl">
        <div className="mb-[14px] flex items-start justify-between">
          <div>
            <h3 className="font-display text-[15px] font-bold text-black">Affiliate details</h3>
            <p className="text-[11px] text-black/55">
              We don&apos;t have this one in our directory — add what you know.
            </p>
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
        <UnlistedForm
          initial={initial}
          submitLabel="Save details"
          onSubmit={(entry) => {
            onSave(entry);
            onClose();
          }}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
