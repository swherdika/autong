# Roadmap

_Last updated: 2026-07-18_

Milestones roughly in order. Each builds on the last; scope intentionally starts
tiny and grows.

## M0 — Planning & design ✅

- [x] Define the problem, users, scope, non-goals ([planning](planning.md))
- [x] Architecture, domain model, engine spec ([design](design.md))
- [x] Scaffold React + TypeScript + Vite

## M1 — Calc engine ✅

The brain, before any UI.

- [x] Domain types (`Preset`, `Component`, `Item`, `Frequency`)
- [x] `occurrences`, `itemNeed`, `componentTotal`, `monthlyTotal`, `remaining`
- [x] Vitest unit tests (20), incl. month-length and weekly-`ceil` edge cases

## M2 — Minimal planner UI

The first thing you can actually use in a browser.

- [ ] Add / edit / remove components and items
- [ ] Live per-component totals and monthly grand total
- [ ] Income input → remaining (surplus / shortfall) display
- [ ] Rupiah formatting

## M3 — Persistence (local-only) ✅

Stop re-typing your budget every payday. No backend, no database.

- [x] Auto-save to `localStorage` on every change; reload on refresh
- [x] JSON export / import — a portable "memory file" the user owns
- [x] Sensible default (sample) budget on first run
- [x] Choose a doodle icon per pocket (14-icon picker)
- [ ] Named presets / multiple profiles (later)

## M4 — Polish & cross-platform reach

- [ ] Responsive layout / mobile-friendly UI
- [ ] PWA (installable) — the cheapest path to "it's on my phone"
- [ ] Later: React Native or desktop (Tauri) shell over the same engine

## M5 — Reporting

- [ ] Log finalized monthly plans
- [ ] Yearly report / trends

## Someday — the dream 🌅

- [ ] Bank / open-banking integration to *execute* the allocation automatically
      (regulated, hard; explicitly out of scope until much later)
