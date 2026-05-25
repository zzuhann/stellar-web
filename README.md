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

---

## What I built

STELLAR is a PWA that centralizes birthday support events on an interactive map. Fans can search by artist, browse upcoming events, and save what they want to attend. Organizers submit events directly; admins review before publishing.

**Core features:**

- Interactive map with clustering — all events across Taiwan at a glance
- Artist birthday calendar — upcoming birthdays with associated events
- Event submission with copy — organizers submit with images, location, and full details; duplicate to create similar events faster
- Favorites & personal submissions — logged-in users track events they care about
- Admin moderation — approval workflow before events go live
- PWA — installable on mobile

**Stack:** Next.js (App Router) · TypeScript · PandaCSS · TanStack Query · Zustand · React Leaflet · Firebase Auth

---

## Technical Highlights

- **Firestore read optimization** — reduced peak-hour reads by ~90% via in-memory caching with event-driven invalidation and request coalescing to prevent cache stampede
- **PWA** — installable on mobile with offline support; 89.6% of sessions are on mobile

---

## Result

- **3,000+** monthly active users (30-day MAU)
- **~10,000** total users reached
- **300+** events live on the platform
- **300+** artists live on the platform
- **+166%** organic search growth, driven by artist birthday traffic spikes
- Bounce rate dropped from **52% → 23%** after product improvements
- **Threads is the #1 traffic source** at 38% of sessions, grown entirely organically
- 1000+ Threads followers within 8 months of launch

---

## Development

### Requirements

- Node.js 20+

### Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`

- Requires the backend server running at `http://localhost:3001/api`
- To run frontend only, set `NEXT_PUBLIC_API_BASE_URL=https://stellar.zeabur.app/api`

### Commands

```bash
npm run build       # production build
npm start           # start production server
npm run lint        # lint and auto-fix
npm run type-check  # TypeScript type check
```

### Environment variables

Contact zzuhann.
