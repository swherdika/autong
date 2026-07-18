import { useMemo, useState } from 'react';
import type { Component, Frequency, Preset, TargetMonth } from './types/budget';
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
import './App.css';

const rp = (n: number) => 'Rp' + Math.round(n).toLocaleString('id-ID');

const compIcon: Record<string, string> = {
  'Daily meals': mealIcon,
  Transport: transportIcon,
  Bills: billsIcon,
  Rent: houseIcon,
  Gym: dumbbellIcon,
};

const samplePreset: Preset = {
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
      items: [
        { id: 'i9', name: 'Membership', amount: 200_000, frequency: 'monthly' },
      ],
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

function Pill({ frequency }: { frequency: Frequency }) {
  return <span className={`pill ${frequency}`}>{frequency}</span>;
}

function ComponentCard({ c, month }: { c: Component; month: TargetMonth }) {
  const icon = compIcon[c.name];

  // One item → collapse to a single one-liner row instead of a list.
  if (c.items.length === 1) {
    const it = c.items[0];
    return (
      <div className="card solo">
        <div className="solo-row">
          <div className="comp-title">
            {icon && <img src={icon} alt="" />}
            <span className="name">{c.name}</span>
            <Pill frequency={it.frequency} />
          </div>
          <div className="item-right">
            <span className="solo-calc">
              {rp(it.amount)} × {occurrences(it.frequency, month)}
            </span>
            <span className="comp-total">{rp(itemNeed(it, month))}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="comp-head">
        <div className="comp-title">
          {icon && <img src={icon} alt="" />}
          <span className="name">{c.name}</span>
        </div>
        <div className="comp-total">{rp(componentTotal(c, month))}</div>
      </div>
      <div className="items">
        {c.items.map((it) => (
          <div className="item" key={it.id}>
            <div className="item-left">
              <span className="item-name">{it.name}</span>
              <Pill frequency={it.frequency} />
            </div>
            <div className="item-right">
              <span className="item-calc">
                {rp(it.amount)} × {occurrences(it.frequency, month)}
              </span>
              <span className="item-need">{rp(itemNeed(it, month))}</span>
            </div>
          </div>
        ))}
      </div>
      <button className="add-item">+ add item</button>
    </div>
  );
}

function App() {
  const [month, setMonth] = useState<TargetMonth>({ year: 2026, month: 8 });
  const [income, setIncome] = useState(7_000_000);

  const total = useMemo(() => monthlyTotal(samplePreset, month), [month]);
  const rem = remaining(total, income);
  const positive = rem >= 0;

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

      {samplePreset.components.map((c) => (
        <ComponentCard key={c.id} c={c} month={month} />
      ))}

      <button className="add-comp">+ add component</button>

      <div className="summary">
        <div className="summary-row">
          <div className="income">
            <label htmlFor="income">income</label>
            <input
              id="income"
              type="text"
              inputMode="numeric"
              value={income.toLocaleString('id-ID')}
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
              <div className={`stat-value ${positive ? 'pos' : 'neg'}`}>
                {rp(rem)}
              </div>
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
