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

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · TypeScript.
