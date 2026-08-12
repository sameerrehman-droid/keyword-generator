"use client";

import { useMemo, useState } from "react";
import DomainField from "./DomainField";
import AffiliateField, { type AffiliateVariant } from "./AffiliateField";
import { Field, Row } from "./ui";
import { fromPartner, makeUnlisted, type Affiliate } from "./affiliates";
import { PARTNERS } from "./partners";

const VARIANTS: { value: AffiliateVariant; label: string; blurb: string }[] = [
  {
    value: "combobox",
    label: "A · Type-ahead + browse",
    blurb:
      "One input. Typing searches the partner directory and always offers “add as unlisted”. Browse all partners opens the slideout for bulk picks.",
  },
  {
    value: "slideout",
    label: "B · Slide-out only",
    blurb:
      "The field is display-only. Everything is added through the slideout, which has a Search directory tab and an Enter manually tab.",
  },
];

function GroupHeader({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-[20px] border-b border-rule py-[30px] md:grid md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] md:items-start md:gap-[60px]">
      <div className="flex flex-col gap-[10px]">
        <h2 className="text-[12px] font-bold text-black">{title}</h2>
        <p className="text-[12px] leading-[18px] text-black">{description}</p>
      </div>
      <div className="flex flex-col gap-[24px]">{children}</div>
    </section>
  );
}

function ConflictNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-[6px] bg-danger-bg px-[10px] py-[8px] text-[12px] text-danger" role="alert">
      {children}
    </p>
  );
}

export default function PolicyLists() {
  const [variant, setVariant] = useState<AffiliateVariant>("combobox");

  const [monitored, setMonitored] = useState<string[]>([]);
  const [ignoreDomains, setIgnoreDomains] = useState<string[]>(["bbc.com", "pid=8767"]);
  const [watchDomains, setWatchDomains] = useState<string[]>([]);
  const [ignoreAffiliates, setIgnoreAffiliates] = useState<Affiliate[]>([]);
  const [watchAffiliates, setWatchAffiliates] = useState<Affiliate[]>(() => [
    fromPartner(PARTNERS[0]),
    makeUnlisted({ name: "Deal Savvy UK" }),
  ]);

  const domainConflicts = useMemo(() => {
    const watch = new Set(watchDomains);
    return new Set(ignoreDomains.filter((d) => watch.has(d)));
  }, [ignoreDomains, watchDomains]);

  const affiliateConflicts = useMemo(() => {
    const watch = new Set(watchAffiliates.map((a) => a.key));
    return new Set(ignoreAffiliates.filter((a) => watch.has(a.key)).map((a) => a.key));
  }, [ignoreAffiliates, watchAffiliates]);

  const activeVariant = VARIANTS.find((v) => v.value === variant)!;

  return (
    <>
      <Row
        label="Domains to monitor"
        alignTop
        description="List all domains that you own that we should monitor. All subdomains will automatically be associated with any of the domains on a policy."
      >
        <DomainField
          label="Add domains to monitor"
          values={monitored}
          onChange={setMonitored}
        />
      </Row>

      {/* Prototype-only control so both affiliate patterns can be compared side by side. */}
      <div className="mt-[24px] flex flex-wrap items-center gap-x-[12px] gap-y-[8px] rounded-[6px] border border-dashed border-edge bg-field px-[12px] py-[10px]">
        <span className="rounded-[4px] bg-black/70 px-[6px] py-[2px] text-[10px] font-bold uppercase tracking-[0.4px] text-white">
          Prototype
        </span>
        <span className="text-[12px] font-semibold text-black">Affiliate entry pattern</span>
        <span className="inline-flex rounded-[6px] border border-edge bg-white p-[2px] md:ml-auto">
          {VARIANTS.map((v) => (
            <button
              key={v.value}
              type="button"
              onClick={() => setVariant(v.value)}
              className={[
                "rounded-[4px] px-[10px] py-[5px] text-[12px] font-semibold transition",
                variant === v.value ? "bg-save text-white" : "text-black/60 hover:text-black",
              ].join(" ")}
            >
              {v.label}
            </button>
          ))}
        </span>
        <p className="w-full text-[11px] leading-[16px] text-black/55">{activeVariant.blurb}</p>
      </div>

      <GroupHeader
        title="Ignore list"
        description="When these domains or affiliates are detected, an alert will not be created."
      >
        <Field
          label="Domains"
          hint="Enter full or partial URLs, or codes found in their URLs (such as CJ's PID). Anything that isn't a whole domain is matched as text contained in the URL."
        >
          <DomainField
            label="Add domains to ignore"
            values={ignoreDomains}
            onChange={setIgnoreDomains}
            allowPartial
            conflicts={domainConflicts}
          />
          {domainConflicts.size > 0 && (
            <ConflictNote>
              {[...domainConflicts].join(", ")} {domainConflicts.size === 1 ? "is" : "are"} also on
              the watchlist. Remove from one list — the ignore list wins today.
            </ConflictNote>
          )}
        </Field>

        <Field
          label="Affiliates"
          hint={
            <>
              If you&apos;d like specific partners to always be ignored across every policy, add
              them to your{" "}
              <a className="font-semibold text-link hover:underline" href="#">
                Trusted Partners
              </a>{" "}
              list.
            </>
          }
        >
          <AffiliateField
            variant={variant}
            label="Add affiliates to ignore"
            intent="ignore"
            values={ignoreAffiliates}
            onChange={setIgnoreAffiliates}
            conflicts={affiliateConflicts}
          />
        </Field>
      </GroupHeader>

      <GroupHeader
        title="Watchlist"
        description="Alerts will be created every time these domains or affiliates are detected."
      >
        <Field label="Domains">
          <DomainField
            label="Add domains to watch"
            values={watchDomains}
            onChange={setWatchDomains}
            allowPartial
            conflicts={domainConflicts}
          />
        </Field>

        <Field label="Affiliates">
          <AffiliateField
            variant={variant}
            label="Add affiliates to watch"
            intent="watch"
            values={watchAffiliates}
            onChange={setWatchAffiliates}
            conflicts={affiliateConflicts}
          />
          {affiliateConflicts.size > 0 && (
            <ConflictNote>
              {affiliateConflicts.size} affiliate{affiliateConflicts.size === 1 ? " is" : "s are"} on
              both the ignore list and the watchlist.
            </ConflictNote>
          )}
        </Field>
      </GroupHeader>
    </>
  );
}
