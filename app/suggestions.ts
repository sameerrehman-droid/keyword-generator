export const MAX_KEYWORDS = 100;

/** True when the value looks like a real domain / URL (with or without protocol). */
export function isValidDomain(raw: string): boolean {
  const v = raw.trim();
  if (!v) return false;
  return /^(https?:\/\/)?([a-z0-9](-?[a-z0-9])*\.)+[a-z]{2,}(\/[^\s]*)?$/i.test(v);
}

export function cleanDomain(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
}

/** Compact 10-keyword set used by the inline variant. */
export function buildSuggestions(brandRaw: string, domainRaw: string): string[] {
  const brand = brandRaw.trim().toLowerCase();
  const domain = cleanDomain(domainRaw);

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
  if (brand) for (const s of suffixes) out.push(`${brand} ${s}`);
  if (domain) out.push(domain);

  return out.slice(0, 10);
}

export type Suggestion = { keyword: string; category: string };

/** Larger, categorized candidate list used by the slide-out variant. */
export function buildLargeSuggestions(brandRaw: string, domainRaw: string): Suggestion[] {
  const brand = brandRaw.trim().toLowerCase();
  const domain = cleanDomain(domainRaw);
  if (!brand && !domain) return [];

  const b = brand || domain.split(".")[0];

  const groups: { category: string; items: string[] }[] = [
    {
      category: "Brand & site",
      items: [
        b,
        `${b} official site`,
        `${b} official website`,
        `${b} store`,
        `${b} online store`,
        `${b} app`,
        `${b} near me`,
        `${b} store locations`,
        `${b} store hours`,
        `${b} hours`,
      ],
    },
    {
      category: "Deals & coupons",
      items: [
        `${b} coupons`,
        `${b} coupon code`,
        `${b} discount code`,
        `${b} promo code`,
        `${b} promo codes`,
        `${b} voucher code`,
        `${b} deals`,
        `${b} sale`,
        `${b} clearance`,
        `${b} offers`,
        `${b} free shipping`,
        `${b} free shipping code`,
        `${b} gift card`,
        `${b} black friday deals`,
        `${b} cyber monday deals`,
      ],
    },
    {
      category: "Reviews & research",
      items: [
        `${b} reviews`,
        `${b} reviews bbb`,
        `${b} ratings`,
        `${b} complaints`,
        `${b} alternatives`,
        `${b} competitors`,
        `is ${b} legit`,
        `is ${b} a scam`,
        `${b} reddit`,
      ],
    },
    {
      category: "Support & account",
      items: [
        `${b} login`,
        `${b} sign in`,
        `${b} customer service`,
        `${b} customer service number`,
        `${b} phone number`,
        `${b} contact`,
        `${b} support`,
        `${b} account`,
        `${b} order tracking`,
        `${b} returns`,
        `${b} refund`,
        `${b} cancel order`,
        `${b} shipping policy`,
      ],
    },
    {
      category: "Products",
      items: [
        `${b} products`,
        `${b} catalog`,
        `${b} new arrivals`,
        `${b} best sellers`,
        `${b} size guide`,
        `${b} price`,
      ],
    },
  ];

  if (domain) {
    groups.push({
      category: "Domain & URLs",
      items: [domain, `www.${domain}`, `${domain} coupons`, `${domain} login`, `${domain} reviews`],
    });
  }

  const seen = new Set<string>();
  const out: Suggestion[] = [];
  for (const g of groups) {
    for (const item of g.items) {
      const key = item.trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push({ keyword: item, category: g.category });
    }
  }
  return out;
}
