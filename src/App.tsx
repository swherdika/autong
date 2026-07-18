import { useMemo, useState } from 'react';
import type { Component, Frequency, Item, Preset, TargetMonth } from './types/budget';
import {
  componentTotal,
  itemNeed,
  monthlyTotal,
  occurrences,
  remaining,
} from './engine';
import mealIcon from './assets/icons/meal.svg';
import transportIcon from './assets/icons/transport.svg';
import billsIcon from './assets/icons/bills.svg';
import houseIcon from './assets/icons/house.svg';
import dumbbellIcon from './assets/icons/dumbbell.svg';
import pocketIcon from './assets/icons/pocket.svg';
import './App.css';

const rp = (n: number) => 'Rp' + Math.round(n).toLocaleString('id-ID');

const FREQUENCIES: Frequency[] = ['daily', 'weekly', 'monthly'];
const nextFrequency = (f: Frequency): Frequency =>
  FREQUENCIES[(FREQUENCIES.indexOf(f) + 1) % FREQUENCIES.length];

// Icons are keyed by component id so a renamed pocket keeps its icon.
// New (user-created) pockets fall back to the coin-pouch doodle.
const iconById: Record<string, string> = {
  c1: mealIcon,
  c2: transportIcon,
  c3: billsIcon,
  c4: houseIcon,
  c5: dumbbellIcon,
};
const iconFor = (id: string) => iconById[id] ?? pocketIcon;

const newId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : String(Math.random()).slice(2);

const initialPreset: Preset = {
  id: 'sample',
  name: 'My Budget',
  components: [
    {
      id: 'c1',
      name: 'Daily meals',
      items: [
        { id: 'i1', name: 'Lunch & dinner', amount: 60_000, frequency: 'daily' },
        { id: 'i2', name: 'Coffee', amount: 30_000, frequency: 'weekly' },
      ],
    },
    {
      id: 'c2',
      name: 'Transport',
      items: [
        { id: 'i3', name: 'Fuel', amount: 50_000, frequency: 'weekly' },
        { id: 'i4', name: 'Ride-hailing', amount: 35_000, frequency: 'weekly' },
      ],
    },
    {
      id: 'c3',
      name: 'Bills',
      items: [
        { id: 'i5', name: 'Electricity', amount: 300_000, frequency: 'monthly' },
        { id: 'i6', name: 'Internet', amount: 350_000, frequency: 'monthly' },
        { id: 'i7', name: 'Phone', amount: 100_000, frequency: 'monthly' },
      ],
    },
    {
      id: 'c4',
      name: 'Rent',
      items: [
        { id: 'i8', name: 'Boarding house', amount: 2_000_000, frequency: 'monthly' },
      ],
    },
    {
      id: 'c5',
      name: 'Gym',
      items: [{ id: 'i9', name: 'Membership', amount: 200_000, frequency: 'monthly' }],
    },
  ],
};

function monthLabel(m: TargetMonth): string {
  return new Date(m.year, m.month - 1, 1).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

function shiftMonth(m: TargetMonth, delta: number): TargetMonth {
  const d = new Date(m.year, m.month - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

function AmountInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <input
      className="amount-input"
      inputMode="numeric"
      value={value.toLocaleString('id-ID')}
      onFocus={(e) => e.target.select()}
      onChange={(e) => onChange(Number(e.target.value.replace(/[^\d]/g, '')) || 0)}
    />
  );
}

function FreqPill({
  frequency,
  onCycle,
}: {
  frequency: Frequency;
  onCycle: () => void;
}) {
  return (
    <button
      type="button"
      className={`pill ${frequency}`}
      onClick={onCycle}
      title="tap to change frequency"
    >
      {frequency}
    </button>
  );
}

interface CardProps {
  component: Component;
  month: TargetMonth;
  onPatchComponent: (patch: Partial<Component>) => void;
  onPatchItem: (itemId: string, patch: Partial<Item>) => void;
  onAddItem: () => void;
  onDeleteItem: (itemId: string) => void;
  onDeleteComponent: () => void;
}

function ComponentCard({
  component,
  month,
  onPatchComponent,
  onPatchItem,
  onAddItem,
  onDeleteItem,
  onDeleteComponent,
}: CardProps) {
  const icon = iconFor(component.id);
  const nameField = (
    <input
      className="name-input"
      value={component.name}
      placeholder="pocket name"
      onChange={(e) => onPatchComponent({ name: e.target.value })}
    />
  );

  // Single item → compact one-liner. The pocket name stands in for the item.
  if (component.items.length === 1) {
    const it = component.items[0];
    return (
      <div className="card solo">
        <div className="solo-row">
          <img src={icon} alt="" style={{ width: 34, height: 34, flex: 'none' }} />
          {nameField}
          <FreqPill
            frequency={it.frequency}
            onCycle={() => onPatchItem(it.id, { frequency: nextFrequency(it.frequency) })}
          />
          <AmountInput
            value={it.amount}
            onChange={(amount) => onPatchItem(it.id, { amount })}
          />
          <span className="item-calc">× {occurrences(it.frequency, month)}</span>
          <span className="comp-total">{rp(itemNeed(it, month))}</span>
          <button className="del" aria-label="delete pocket" onClick={onDeleteComponent}>
            ✕
          </button>
        </div>
        <button className="add-item" onClick={onAddItem}>
          + add item
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="comp-head">
        <div className="comp-title">
          <img src={icon} alt="" />
          {nameField}
        </div>
        <span className="comp-total">{rp(componentTotal(component, month))}</span>
        <button className="del" aria-label="delete pocket" onClick={onDeleteComponent}>
          ✕
        </button>
      </div>
      <div className="items">
        {component.items.map((it) => (
          <div className="item" key={it.id}>
            <div className="item-left">
              <input
                className="item-name-input"
                value={it.name}
                placeholder="item name"
                onChange={(e) => onPatchItem(it.id, { name: e.target.value })}
              />
              <FreqPill
                frequency={it.frequency}
                onCycle={() =>
                  onPatchItem(it.id, { frequency: nextFrequency(it.frequency) })
                }
              />
            </div>
            <div className="item-right">
              <AmountInput
                value={it.amount}
                onChange={(amount) => onPatchItem(it.id, { amount })}
              />
              <span className="item-calc">× {occurrences(it.frequency, month)}</span>
              <span className="item-need">{rp(itemNeed(it, month))}</span>
              <button
                className="del"
                aria-label="delete item"
                onClick={() => onDeleteItem(it.id)}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
      <button className="add-item" onClick={onAddItem}>
        + add item
      </button>
    </div>
  );
}

function App() {
  const [month, setMonth] = useState<TargetMonth>({ year: 2026, month: 8 });
  const [income, setIncome] = useState(7_000_000);
  const [preset, setPreset] = useState<Preset>(initialPreset);

  const total = useMemo(() => monthlyTotal(preset, month), [preset, month]);
  const rem = remaining(total, income);
  const positive = rem >= 0;

  const mapComponents = (fn: (c: Component) => Component) =>
    setPreset((p) => ({ ...p, components: p.components.map(fn) }));

  const patchComponent = (id: string, patch: Partial<Component>) =>
    mapComponents((c) => (c.id === id ? { ...c, ...patch } : c));

  const patchItem = (compId: string, itemId: string, patch: Partial<Item>) =>
    mapComponents((c) =>
      c.id === compId
        ? {
            ...c,
            items: c.items.map((it) =>
              it.id === itemId ? { ...it, ...patch } : it,
            ),
          }
        : c,
    );

  const addItem = (compId: string) =>
    mapComponents((c) =>
      c.id === compId
        ? {
            ...c,
            items: [
              ...c.items,
              { id: newId(), name: '', amount: 0, frequency: 'monthly' },
            ],
          }
        : c,
    );

  const deleteItem = (compId: string, itemId: string) =>
    mapComponents((c) =>
      c.id === compId
        ? { ...c, items: c.items.filter((it) => it.id !== itemId) }
        : c,
    );

  const deleteComponent = (compId: string) =>
    setPreset((p) => ({
      ...p,
      components: p.components.filter((c) => c.id !== compId),
    }));

  const addComponent = () =>
    setPreset((p) => ({
      ...p,
      components: [
        ...p.components,
        {
          id: newId(),
          name: '',
          items: [{ id: newId(), name: '', amount: 0, frequency: 'monthly' }],
        },
      ],
    }));

  return (
    <div className="app">
      <header className="header">
        <h1 className="wordmark">
          Autong<span className="dot">.</span>
        </h1>
        <p className="tagline">auto-allocator for your kantong(s)</p>
        <div className="month">
          <button
            className="nub"
            aria-label="previous month"
            onClick={() => setMonth((m) => shiftMonth(m, -1))}
          >
            ‹
          </button>
          <span>{monthLabel(month)}</span>
          <button
            className="nub"
            aria-label="next month"
            onClick={() => setMonth((m) => shiftMonth(m, 1))}
          >
            ›
          </button>
        </div>
      </header>

      {preset.components.length === 0 ? (
        <div className="empty">
          <img src={pocketIcon} alt="" />
          <p>no pockets yet — add your first one!</p>
        </div>
      ) : (
        preset.components.map((c) => (
          <ComponentCard
            key={c.id}
            component={c}
            month={month}
            onPatchComponent={(patch) => patchComponent(c.id, patch)}
            onPatchItem={(itemId, patch) => patchItem(c.id, itemId, patch)}
            onAddItem={() => addItem(c.id)}
            onDeleteItem={(itemId) => deleteItem(c.id, itemId)}
            onDeleteComponent={() => deleteComponent(c.id)}
          />
        ))
      )}

      <button className="add-comp" onClick={addComponent}>
        + add pocket
      </button>

      <div className="summary">
        <div className="summary-row">
          <div className="income">
            <label htmlFor="income">income</label>
            <input
              id="income"
              type="text"
              inputMode="numeric"
              value={income.toLocaleString('id-ID')}
              onFocus={(e) => e.target.select()}
              onChange={(e) =>
                setIncome(Number(e.target.value.replace(/[^\d]/g, '')) || 0)
              }
            />
          </div>
          <div className="stats">
            <div className="stat">
              <div className="stat-label">total need</div>
              <div className="stat-value">{rp(total)}</div>
            </div>
            <div className="stat">
              <div className="stat-label">remaining</div>
              <div className={`stat-value ${positive ? 'pos' : 'neg'}`}>{rp(rem)}</div>
            </div>
          </div>
        </div>
        <div className={`note ${positive ? 'pos' : 'neg'}`}>
          {positive ? 'surplus — free to save!' : 'shortfall — trim something!'}
        </div>
      </div>
    </div>
  );
}

export default App;
