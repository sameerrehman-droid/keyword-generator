import { looksLikePartnerId, type Partner } from "./partners";

/**
 * An entry on an affiliate ignore list / watchlist.
 *
 * `known` entries are matched against the publisher DB, so we hold an exact
 * partner ID. Unlisted entries are whatever the user could tell us — any one
 * of ID / name / network is enough to make a rule.
 */
export type Affiliate = {
  key: string;
  known: boolean;
  /** "network" rules apply to every partner on that network. */
  scope: "affiliate" | "network";
  partnerId?: string;
  name?: string;
  network?: string;
};

export function partnerKey(partnerId: string) {
  return `p:${partnerId}`;
}

export function networkKey(network: string) {
  return `n:${network.trim().toLowerCase()}`;
}

export function unlistedKey(a: Pick<Affiliate, "partnerId" | "name" | "network">) {
  return `u:${(a.partnerId ?? "").toLowerCase()}|${(a.name ?? "").toLowerCase()}|${(
    a.network ?? ""
  ).toLowerCase()}`;
}

export function fromPartner(p: Partner): Affiliate {
  return {
    key: partnerKey(p.partnerId),
    known: true,
    scope: "affiliate",
    partnerId: p.partnerId,
    name: p.company,
    network: p.network,
  };
}

export function fromNetwork(network: string): Affiliate {
  return { key: networkKey(network), known: true, scope: "network", network };
}

/** Turn raw typed text into an unlisted entry, reading it as an ID when it looks like one. */
export function fromFreeText(text: string): Affiliate {
  const value = text.trim();
  const asId = looksLikePartnerId(value);
  const draft = asId ? { partnerId: value } : { name: value };
  return { key: unlistedKey(draft), known: false, scope: "affiliate", ...draft };
}

export function makeUnlisted(draft: {
  partnerId?: string;
  name?: string;
  network?: string;
  networkOnly?: boolean;
}): Affiliate {
  const partnerId = draft.partnerId?.trim() || undefined;
  const name = draft.name?.trim() || undefined;
  const network = draft.network?.trim() || undefined;
  if (draft.networkOnly && network) {
    return { key: networkKey(network), known: false, scope: "network", network };
  }
  return {
    key: unlistedKey({ partnerId, name, network }),
    known: false,
    scope: "affiliate",
    partnerId,
    name,
    network,
  };
}

/** At least one identifier is required — that is the whole validation rule. */
export function hasIdentifier(draft: {
  partnerId?: string;
  name?: string;
  network?: string;
}): boolean {
  return Boolean(draft.partnerId?.trim() || draft.name?.trim() || draft.network?.trim());
}

export function affiliateLabel(a: Affiliate): string {
  if (a.scope === "network") return a.network ?? "Network";
  return a.name || (a.partnerId ? `ID ${a.partnerId}` : a.network || "Unnamed affiliate");
}

export function affiliateMeta(a: Affiliate): string {
  if (a.scope === "network") return "All partners on this network";
  const bits: string[] = [];
  if (a.partnerId && a.name) bits.push(`ID ${a.partnerId}`);
  if (a.network) bits.push(a.network);
  return bits.join(" · ");
}
