# Planning

_Last updated: 2026-07-18_

## Problem

Digital banking apps (e.g. Jago) offer "pockets" and auto-debit to split
incoming money automatically. That works when your allocation is **static** —
the same amounts every month. But a real budget isn't static: meals, transport,
bills, and one-off plans change every payroll. Auto-debit can't express "this
month is different," so the calculation falls back to being done by hand each
payday. That's tedious and error-prone.

## Solution

A **dynamic budget planner**. Instead of a fixed split, the user describes their
spending as recurring line items, and the app computes how much each category
needs for the coming month, then compares that to income.

The app **plans**; it does not move money. (Bank integration is an explicit
long-term goal, not part of the initial product — see [roadmap](roadmap.md).)

## Target users

- **Primary:** the author — someone who budgets bottom-up from concrete spending
  items and whose monthly split varies.
- **Secondary:** anyone who wants a fast "what do I need this month, and what's
  left to save?" tool without linking a bank account.

The preset system (see design) means one install can hold multiple independent
budgets, so a second person's budget is just another saved preset.

## Goals

- Turn a set of recurring spending items into a per-category monthly total.
- Show the grand total and the surplus/shortfall against income.
- Make monthly re-planning fast: reuse last month's setup, tweak amounts, done.
- Keep the core logic portable so the app can later reach mobile & desktop.

## Non-goals (for v1)

- **No bank / open-banking integration.** No moving of real money.
- **No multi-currency.** Rupiah (Rp) only for now.
- **No reporting / analytics.** Yearly reports are a later milestone.
- **No accounts / cloud sync.** Local-only to start.

## Success criteria

The author uses it on an actual payday and it's genuinely faster than doing the
math by hand — enough to replace the manual calculation entirely.

## Key product decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Scope of v1 | Planner only (no money movement) | Solves the real pain without regulated bank APIs |
| Budget model | Bottom-up recurring line items | Matches how the user actually budgets |
| Income | Included, to show surplus/shortfall | Turns a calculator into an *allocator* |
| Currency | Rupiah only | Single user, single market for now |
