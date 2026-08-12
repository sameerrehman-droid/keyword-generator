# Keyword Generator

Clickable prototype for the **Policy → Keyword Suggestions** flow (Protect / BrandVerity console).

Recreates the "Create Policy" page and adds a keyword generator to the **Keywords** field:
suggest 10 keywords from a brand name + domain, while still letting users add and
remove keywords manually.

Design reference: [PZP-4374 — Policy Keyword Suggestions](https://www.figma.com/design/czkZvucqgaUMDZmltwr7Zb/PZP-4374---Policy-Keyword-Suggestions?node-id=20-20)

## Features

- **Generate keywords** — builds 10 suggestions from the brand name + domain (e.g. `acme reviews`, `acme coupons`, `acme.com`).
- **Manual entry** — type a keyword and press **Enter** or click the **+** button. Multiple keywords can be comma-separated.
- **Remove** — each keyword pill has an **×**; backspace on an empty input removes the last pill.
- **Focus state** — the field shows a blue border and the **+** button activates once text is typed.
- **Error state** — a red border + message appears when the 100-keyword plan limit is exceeded; the list is capped at 100.

## Ignore list / watchlist (domains + affiliates)

Covers the ignore-and-allow story: everything sits under two subheaders below **Domains to
monitor**, so the two outcomes read as two buckets rather than four unrelated fields.

- **Ignore list** — "When these domains or affiliates are detected, an alert will not be created."
- **Watchlist** — "Alerts will be created every time these domains or affiliates are detected."

Domains

- Ignore/watch domain fields accept **partial URLs and tracking codes** (e.g. `pid=8767`) as well as
  whole domains. Anything that isn't a whole domain gets a `contains` tag on its pill, so it is
  obvious it will be matched as a substring of the URL.
- **Domains to monitor** stays strict — it's domains you own, so partial entries are rejected.
- A domain on both lists is flagged in red on both pills, with a warning underneath.

Affiliates — two patterns behind a **Prototype** toggle, for comparison

- **A · Type-ahead + browse** — one input. Typing searches the partner directory (name, ID, website,
  network) and the list always ends with *Add "…" as an unlisted affiliate*. Matching a network name
  offers a network-wide rule. **Browse all partners** opens the slideout for bulk picks.
- **B · Slide-out only** — the field is display-only; everything is added through the slideout, which
  gains a **Search directory** / **Enter manually** tab pair.

Both patterns share the same pill model: directory matches get a blue tick plus their ID and network;
unlisted entries get a clickable **unlisted** tag that opens the details dialog.

Unlisted affiliates need **any one of** affiliate name, affiliate ID, or network — nothing is
individually mandatory, which also allows a network-wide rule ("apply to every partner on this
network"). `app/partners.ts` holds a 28-row mock of the publisher DB.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · TypeScript.
