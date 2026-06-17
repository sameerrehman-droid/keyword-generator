"use client";

import { createContext, useContext, useState } from "react";

export type Variant = "inline" | "drawer";

const VariantCtx = createContext<{
  variant: Variant;
  setVariant: (v: Variant) => void;
} | null>(null);

export function VariantProvider({ children }: { children: React.ReactNode }) {
  const [variant, setVariant] = useState<Variant>("inline");
  return (
    <VariantCtx.Provider value={{ variant, setVariant }}>{children}</VariantCtx.Provider>
  );
}

export function useVariant() {
  const ctx = useContext(VariantCtx);
  if (!ctx) throw new Error("useVariant must be used within VariantProvider");
  return ctx;
}

const OPTIONS: { value: Variant; label: string }[] = [
  { value: "inline", label: "Inline" },
  { value: "drawer", label: "Slide-out panel" },
];

export function VariantToggle() {
  const { variant, setVariant } = useVariant();
  return (
    <div className="flex flex-wrap items-center gap-[10px]">
      <span className="text-[12px] font-bold text-black">Keyword generator variant</span>
      <div
        role="tablist"
        aria-label="Keyword generator variant"
        className="inline-flex rounded-[8px] border border-edge bg-field p-[2px]"
      >
        {OPTIONS.map((opt) => {
          const active = variant === opt.value;
          return (
            <button
              key={opt.value}
              role="tab"
              aria-selected={active}
              onClick={() => setVariant(opt.value)}
              className={[
                "rounded-[6px] px-[12px] py-[6px] text-[12px] font-semibold transition",
                active ? "bg-white text-black shadow-sm" : "text-black/55 hover:text-black",
              ].join(" ")}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
