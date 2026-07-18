# Technical Design

_Last updated: 2026-07-18_

## Overview

The app has two clearly separated halves:

- **Engine** — pure TypeScript. Given a budget and a target month, it computes
  every total. No React, no DOM, no I/O. Deterministic and unit-testable.
- **UI** — React components that read/write the budget and render engine output.

This separation is deliberate: the engine is the "brain" and must survive a
future move to React Native / desktop with **zero changes**. Only the UI shell
gets rewritten per platform.

```
src/
  engine/      pure calc functions (occurrences, item/component/plan totals)
  types/       domain types (Preset, Component, Item, Frequency)
  ui/          React components
  main.tsx     app entry
```

## Domain model

```
Preset                      a named, saved budget (e.g. "My Budget")
 ├─ id, name
 └─ components: Component[]

Component                   a spending category (e.g. "Daily Meals")
 ├─ id, name
 └─ items: Item[]

Item                        one recurring purchase
 ├─ id, name
 ├─ amount: number         (Rupiah, per single occurrence)
 └─ frequency: Frequency   'daily' | 'weekly' | 'monthly'
```

Income is a single number the user enters per plan (not stored on the preset,
since it changes every payday).

## The calculation

For a given **target month** (year + month → known day count):

```
occurrences(frequency, month):
  daily   → daysInMonth(month)          // 28–31
  weekly  → ceil(daysInMonth(month) / 7) // round up: covers partial weeks
  monthly → 1

need(item)        = item.amount × occurrences(item.frequency, month)
componentTotal(c) = Σ need(item) for item in c.items
monthlyTotal(p)   = Σ componentTotal(c) for c in p.components
remaining(income) = income − monthlyTotal
```

### Occurrence rules — worked examples (August 2026, 31 days)

| Item | Amount | Frequency | Occurrences | Need |
|------|--------|-----------|-------------|------|
| Daily meals | Rp60,000 | daily | 31 | Rp1,860,000 |
| Laundry | Rp50,000 | weekly | `ceil(31/7)` = 5 | Rp250,000 |
| Electricity | Rp300,000 | monthly | 1 | Rp300,000 |

**Weekly uses `ceil`** so a partial week is still fully funded — better to
over-provision a budget line than come up short.

## Engine API (planned)

```ts
type Frequency = 'daily' | 'weekly' | 'monthly';

interface Item      { id: string; name: string; amount: number; frequency: Frequency; }
interface Component { id: string; name: string; items: Item[]; }
interface Preset    { id: string; name: string; components: Component[]; }

interface TargetMonth { year: number; month: number; } // month: 1–12

function occurrences(freq: Frequency, month: TargetMonth): number;
function itemNeed(item: Item, month: TargetMonth): number;
function componentTotal(c: Component, month: TargetMonth): number;
function monthlyTotal(p: Preset, month: TargetMonth): number;
function remaining(monthlyTotal: number, income: number): number;
```

Money is held as integer Rupiah (no cents/decimals in IDR), sidestepping
floating-point rounding issues.

## Persistence (later)

Presets saved to `localStorage` first (zero backend). A `PresetStore` interface
will wrap it so a cloud/DB backend can be swapped in later without touching the
UI or engine.

## Testing strategy

- **Engine:** unit tests with Vitest. Cover occurrence edge cases (28/29/30/31-day
  months, leap year Feb, weekly `ceil` boundaries) and total aggregation.
- **UI:** deferred until the flow stabilizes; kept thin so most logic is testable
  in the engine.

## Design decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Language | TypeScript | Type-safe money/domain model; matches modern React work |
| Build tool | Vite | Fast dev server, instant HMR |
| Engine ↔ UI | Hard separation, engine is pure | Portability to RN/desktop; easy testing |
| Money type | Integer Rupiah | No decimal rounding errors |
| Weekly count | `ceil(daysInMonth / 7)` | Fully fund partial weeks |
| Storage (v1) | `localStorage` behind an interface | No backend; swappable later |
