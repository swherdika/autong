# Payroll Allocator

A dynamic budget planner. Every payday, describe your recurring spending as
line items and the app tells you exactly how much each spending category needs
for the coming month — and what's left over to save.

Unlike the fixed "pockets" / auto-debit in banking apps, this is built for a
budget that **changes every month**.

## Why

Banking auto-debit assumes a *static* split. In practice, allocation differs
every payroll — meals, bills, transport and one-off plans shift month to month.
Doing that math by hand each payday gets tedious. This app automates it.

## How it works

You build the monthly total **bottom-up**:

1. Create **components** (spending categories, e.g. *Daily Meals*, *Bills*).
2. Add **items** to each — an amount and a frequency (daily / weekly / monthly).
3. The app expands each item across the month and sums everything.
4. Enter your income → see the **remaining** surplus (or shortfall).

```
need(item)       = amount × occurrences(frequency, month)
component.total  = Σ item.need
monthly.total    = Σ component.total
remaining        = income − monthly.total
```

## Tech stack

- **React + TypeScript + Vite** — web-first, cross-platform later.
- **Framework-agnostic calc engine** (pure TS, no React) so the core logic can
  move to React Native / desktop untouched.

## Project status

Early development. See the [roadmap](docs/roadmap.md).

- [x] Product planning & technical design
- [ ] Calc engine + tests
- [ ] Minimal planner UI
- [ ] Presets & persistence

## Documentation

- [Planning](docs/planning.md) — problem, goals, scope, users.
- [Design](docs/design.md) — architecture, data model, engine spec, decisions.
- [Roadmap](docs/roadmap.md) — milestones from v1 to the far-future dream.

## Getting started

```bash
npm install
npm run dev
```
