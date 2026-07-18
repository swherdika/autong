import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  Component,
  Frequency,
  IconKey,
  Item,
  Preset,
  TargetMonth,
} from './types/budget';
import {
  componentTotal,
  itemNeed,
  monthlyTotal,
  occurrences,
  remaining,
} from './engine';
import { ICONS, iconSrc } from './icons';
import {
  exportToFile,
  loadState,
  parseImportedFile,
  saveState,
} from './storage';
import './App.css';

const rp = (n: number) => 'Rp' + Math.round(n).toLocaleString('id-ID');

const FREQUENCIES: Frequency[] = ['daily', 'weekly', 'monthly'];
const nextFrequency = (f: Frequency): Frequency =>
  FREQUENCIES[(FREQUENCIES.indexOf(f) + 1) % FREQUENCIES.length];

const newId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : String(Math.random()).slice(2);

const DEFAULT_INCOME = 7_000_000;

const initialPreset: Preset = {
  id: 'sample',
  name: 'My Budget',
  components: [
    {
      id: 'c1',
      name: 'Daily meals',
      icon: 'meal',
      items: [
        { id: 'i1', name: 'Lunch & dinner', amount: 60_000, frequency: 'daily' },
        { id: 'i2', name: 'Coffee', amount: 30_000, frequency: 'weekly' },
      ],
    },
    {
      id: 'c2',
      name: 'Transport',
      icon: 'transport',
      items: [
        { id: 'i3', name: 'Fuel', amount: 50_000, frequency: 'weekly' },
        { id: 'i4', name: 'Ride-hailing', amount: 35_000, frequency: 'weekly' },
      ],
    },
    {
      id: 'c3',
      name: 'Bills',
      icon: 'bills',
      items: [
        { id: 'i5', name: 'Electricity', amount: 300_000, frequency: 'monthly' },
        { id: 'i6', name: 'Internet', amount: 350_000, frequency: 'monthly' },
        { id: 'i7', name: 'Phone', amount: 100_000, frequency: 'monthly' },
      ],
    },
    {
      id: 'c4',
      name: 'Rent',
      icon: 'house',
      items: [
        { id: 'i8', name: 'Boarding house', amount: 2_000_000, frequency: 'monthly' },
      ],
    },
    {
      id: 'c5',
      name: 'Gym',
      icon: 'dumbbell',
      items: [{ id: 'i9', name: 'Membership', amount: 200_000, frequency: 'monthly' }],
    },
  ],
};

function currentMonth(): TargetMonth {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

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

function IconPicker({
  current,
  open,
  onToggle,
  onSelect,
}: {
  current: IconKey | undefined;
  open: boolean;
  onToggle: () => void;
  onSelect: (key: IconKey) => void;
}) {
  return (
    <div className="icon-wrap">
      <button
        type="button"
        className="icon-btn"
        onClick={onToggle}
        aria-label="change icon"
        title="change icon"
      >
        <img src={iconSrc(current)} alt="" />
      </button>
      {open && (
        <>
          <div className="backdrop" onClick={onToggle} />
          <div className="icon-pop" role="menu">
            {ICONS.map((i) => (
              <button
                key={i.key}
                type="button"
                className={`icon-choice ${i.key === current ? 'sel' : ''}`}
                onClick={() => onSelect(i.key)}
                aria-label={i.key}
              >
                <img src={i.src} alt={i.key} />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface CardProps {
  component: Component;
  month: TargetMonth;
  pickerOpen: boolean;
  onTogglePicker: () => void;
  onSelectIcon: (key: IconKey) => void;
  onPatchComponent: (patch: Partial<Component>) => void;
  onPatchItem: (itemId: string, patch: Partial<Item>) => void;
  onAddItem: () => void;
  onDeleteItem: (itemId: string) => void;
  onDeleteComponent: () => void;
}

function ComponentCard({
  component,
  month,
  pickerOpen,
  onTogglePicker,
  onSelectIcon,
  onPatchComponent,
  onPatchItem,
  onAddItem,
  onDeleteItem,
  onDeleteComponent,
}: CardProps) {
  const picker = (
    <IconPicker
      current={component.icon}
      open={pickerOpen}
      onToggle={onTogglePicker}
      onSelect={onSelectIcon}
    />
  );
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
          {picker}
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
          {picker}
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
  const [month, setMonth] = useState<TargetMonth>(currentMonth);
  const [preset, setPreset] = useState<Preset>(
    () => loadState()?.preset ?? initialPreset,
  );
  const [income, setIncome] = useState<number>(
    () => loadState()?.income ?? DEFAULT_INCOME,
  );
  const [openPicker, setOpenPicker] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  // Auto-save to localStorage on every change — no button, no server.
  useEffect(() => {
    saveState({ preset, income });
  }, [preset, income]);

  // Show the pinned-header shadow only once the list scrolls under it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const total = useMemo(() => monthlyTotal(preset, month), [preset, month]);
  const rem = remaining(total, income);
  const status = rem > 0 ? 'pos' : rem < 0 ? 'neg' : 'zero';
  const note =
    rem > 0
      ? 'surplus — free to save!'
      : rem < 0
        ? 'shortfall — trim something!'
        : 'bullseye — every rupiah allocated!';

  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: 'smooth' });

  const mapComponents = (fn: (c: Component) => Component) =>
    setPreset((p) => ({ ...p, components: p.components.map(fn) }));

  const patchComponent = (id: string, patch: Partial<Component>) =>
    mapComponents((c) => (c.id === id ? { ...c, ...patch } : c));

  const patchItem = (compId: string, itemId: string, patch: Partial<Item>) =>
    mapComponents((c) =>
      c.id === compId
        ? { ...c, items: c.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)) }
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
      c.id === compId ? { ...c, items: c.items.filter((it) => it.id !== itemId) } : c,
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

  const handleImport = async (file: File) => {
    try {
      const state = parseImportedFile(await file.text());
      setPreset(state.preset);
      setIncome(state.income);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not read that file.');
    }
  };

  return (
    <div className="app">
      <div className={`frozen${scrolled ? ' scrolled' : ''}`}>
        <header className="header">
          <button className="wordmark" onClick={scrollToTop} title="back to top">
            Autong<span className="dot">.</span>
          </button>
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
                <div className={`stat-value ${status}`}>{rp(rem)}</div>
              </div>
            </div>
          </div>
          <div className={`note ${status}`}>{note}</div>
        </div>
      </div>

      <div className="list">
      {preset.components.length === 0 ? (
        <div className="empty">
          <img src={iconSrc('pocket')} alt="" />
          <p>no pockets yet — add your first one!</p>
        </div>
      ) : (
        preset.components.map((c) => (
          <ComponentCard
            key={c.id}
            component={c}
            month={month}
            pickerOpen={openPicker === c.id}
            onTogglePicker={() => setOpenPicker((cur) => (cur === c.id ? null : c.id))}
            onSelectIcon={(key) => {
              patchComponent(c.id, { icon: key });
              setOpenPicker(null);
            }}
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

      <div className="toolbar">
        <span className="save-note">saved on this device</span>
        <div className="tools">
          <button className="tool-btn" onClick={() => exportToFile({ preset, income })}>
            ⬇ export
          </button>
          <button className="tool-btn" onClick={() => fileInput.current?.click()}>
            ⬆ import
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImport(f);
              e.target.value = '';
            }}
          />
        </div>
      </div>
      </div>
    </div>
  );
}

export default App;
