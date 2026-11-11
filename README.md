# STELLAR | 台灣生日應援地圖

[Live →](https://www.stellar-zone.com)

---

## Problem

K-pop birthday cafe culture (生咖, 생카) is big in Taiwan — when a popular idol's birthday arrives, fans organize pop-up café events across cities. During a major artist's birthday, there can easily be 10+ simultaneous events across Taiwan.

But there was no central place to find them. Event organizers posted on Threads and Instagram. If the algorithm didn't surface the right post at the right time, you'd miss it entirely. Fans publicly posted _"Are there really no birthday cafés for [artist] in Taipei?"_ — not because the events didn't exist, but because the information was impossible to aggregate.

Korea already had platforms solving this. Taiwan didn't.

---

## Who I talked to

No formal interviews — I was part of the community. As a K-pop fan in Taiwan, I experienced the problem directly: manually hunting across Threads posts, following the right accounts, hoping the algorithm would cooperate. I watched the same frustrations surface publicly every birthday cycle, consistently enough to build on.

---

## What I learned

The problem wasn't supply — it was discoverability. Events existed, but they lived in scattered social posts with no aggregation layer. Every fan was doing the same manual research every birthday season.

Two things shaped the design:

- **Mobile-first is non-negotiable.** Fans decide whether to show up while they're already out, on their phones.
- **The platform only works if organizers submit.** The submission flow had to be low-friction enough that event hosts would actually use it.

---

## How I drove supply

A map with no events is useless. So I went out to find them.

I reached out directly to 300+ event organizers and 20+ venues on Threads and Instagram — explaining what STELLAR was, handling questions ("Is it free?", "How many people will see it?", "Can I manage my own listing?"), and iterating on my outreach copy based on response rates.

This surfaced a recurring pattern: organizers running large birthday cycles needed to create 8–10 events in a single session. The default flow required filling out a separate form for each one.

I shipped a **copy feature** — duplicate an existing event and edit only what changed. The feedback loop closed in under a week from conversation to production.

When submissions still lagged behind what was being posted on social media, I built an **admin import assistant**: paste a post's caption and image URLs, and Gemini turns it into an event draft (title, dates, venue, social handles) for review. Fields it can't read reliably stay empty instead of being guessed.

---

## Expanding to venues

Talking to organizers exposed the step before an event exists: finding a café that will host one. Venue rules — minimum spend, decoration, capacity, booking channels — were scattered across Instagram highlights and Google Forms.

So STELLAR grew a **venue directory**: venue pages show capacity ranges where available, confirmed pricing and decoration tags, and the birthday events each venue has hosted, and suggest related venues when enough of them share a tag. Venue owners can submit their own listing. Contacting a venue from STELLAR is tracked as booking intent, the conversion the directory exists for.

---

## What I built

STELLAR is a PWA that centralizes birthday support events on an interactive map. Fans can search by artist, browse upcoming events, and save what they want to attend. Organizers submit events and find venues; admins review before publishing.

**Core features:**

- Interactive map with clustering — an artist's ongoing and upcoming events across Taiwan at a glance
- Artist birthday calendar — upcoming birthdays with associated events
- Event submission with copy — organizers submit with images, location, and full details; duplicate to create similar events faster
- Venue directory — filter by region and capacity, pricing and decoration tags, related venues, public venue submission
- Favorites & personal submissions — logged-in users track events they care about
- Admin moderation and import assistant — approval workflow before anything goes live
- PWA — installable on mobile

**Stack:** Next.js (App Router) · TypeScript · PandaCSS · TanStack Query · Zustand · React Leaflet + MapLibre GL · Firebase Auth · Sentry · Vercel

Backend: [stellar](https://github.com/zzuhann/stellar) (Express · Firestore · Cloudflare R2 · GCP Cloud Run)

---

## Technical Highlights

- **Detail pages that were silently server-rendered** — map, event and venue detail pages were meant to be ISR but every request missed the cache, making them 90% of all Vercel function invocations. Moved them to ISR with on-demand revalidation when data changes: function invocations dropped 74%.
- **Firestore read caching** — in-memory caching with event-driven invalidation; concurrent cache misses on the event and venue lists share one fill per instance instead of stampeding Firestore.
- **Backend migration** — moved the API to GCP Cloud Run behind a Cloudflare Worker with weighted routing, shifting traffic gradually; zero errors across two 24-hour checks, versus timeouts and 502s on the previous host.
- **Map that degrades instead of breaking** — devices without WebGL fall back to raster tiles rather than a blank page.
- **Spec-driven workflow with AI agents** — every feature starts with requirements and test cases that I review before implementation, and changes go through an independent review before release.

---

## Result

_30 days ending 2026-11-11 (GA4) and catalog size as of 2026-11-12._

- **4,870** monthly active users
- **650+** events listed since launch
- **355** artists and **41** venues live on the platform
- **31%** of sessions come from organic search

---

## Development

### Requirements

- Node.js 20.9+

### Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`

- Requires the backend server running at `http://localhost:3001/api`
- To run frontend only, set `NEXT_PUBLIC_API_BASE_URL=https://api.stellar-zone.com/api`

### Commands

```bash
npm run build       # production build
npm start           # start production server
npm run lint        # lint and auto-fix
npm run type-check  # TypeScript type check
npm test            # unit and component tests (Vitest)
```

### Environment variables

Contact zzuhann.
