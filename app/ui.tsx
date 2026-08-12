/** Shared layout primitives for the policy form — usable from server and client components. */

export function Row({
  label,
  description,
  children,
  alignTop = false,
}: {
  label: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  alignTop?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-[20px] border-b border-rule py-[30px] md:grid md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] md:gap-[60px] ${
        alignTop ? "md:items-start" : "md:items-center"
      }`}
    >
      <div className="flex flex-col gap-[15px]">
        <p className="text-[12px] font-bold text-black">{label}</p>
        {description && <p className="text-[12px] leading-[18px] text-black">{description}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
}

export function ContactLine({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex flex-wrap gap-[4px] text-[12px] text-black">
      {children}
      <a className="text-link hover:underline" href="#">
        Contact now
      </a>
    </p>
  );
}

/** Label + control stack used inside the grouped ignore / watchlist sections. */
export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-[8px]">
      <p className="text-[12px] font-bold text-black">{label}</p>
      {children}
      {hint && <div className="text-[12px] leading-[18px] text-black/70">{hint}</div>}
    </div>
  );
}
