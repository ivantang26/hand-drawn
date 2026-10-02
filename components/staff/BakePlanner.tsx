"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/illustrations";
import { CATEGORIES, PRODUCTS, getProduct } from "@/lib/catalog";
import { KEYS, load, save } from "@/lib/client/storage";
import { formatDate } from "@/lib/dates";
import type { ShopId } from "@/lib/shops";
import type { BakeRow } from "@/lib/types";
import { StaffPickers } from "./StaffPickers";

type SaveState = "idle" | "saving" | "saved" | "error";

/**
 * Tomorrow's bake, phone-first (FR-4). Every change autosaves, so there's no "Save" to forget.
 * Quantities can't drop below what customers have already paid for.
 */
export function BakePlanner({ today, tomorrow, initial }: { today: string; tomorrow: string; initial: BakeRow[] }) {
  const [shop, setShop] = useState<ShopId>("mill-lane");
  const [date, setDate] = useState(tomorrow);
  const [rows, setRows] = useState<Record<string, BakeRow>>(() => Object.fromEntries(initial.map((r) => [r.productId, r])));
  const [state, setState] = useState<SaveState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const timers = useRef<Record<string, number>>({});
  const pending = useRef(0);

  useEffect(() => {
    const saved = load<ShopId | null>(KEYS.shop, null);
    if (saved && saved !== "mill-lane") setShop(saved);
  }, []);

  const loadPlan = useCallback(async (s: ShopId, d: string) => {
    const res = await fetch(`/api/staff/bake?shop=${s}&date=${d}`, { cache: "no-store" });
    const data = await res.json();
    setRows(Object.fromEntries((data.rows as BakeRow[]).map((r) => [r.productId, r])));
  }, []);

  useEffect(() => {
    void loadPlan(shop, date);
  }, [shop, date, loadPlan]);

  const send = async (productId: string, change: { planned?: number; soldOut?: boolean }) => {
    pending.current += 1;
    setState("saving");
    try {
      const res = await fetch("/api/staff/bake", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shop, date, productId, ...change }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRows((r) => ({ ...r, [productId]: data.row }));
      pending.current -= 1;
      if (pending.current === 0) setState("saved");
    } catch (e) {
      pending.current -= 1;
      setState("error");
      setMessage(e instanceof Error ? e.message : "Couldn't save");
    }
  };

  const setPlanned = (id: string, value: number) => {
    const row = rows[id];
    const planned = Math.max(row.sold, Math.min(999, Math.round(value)));
    setRows((r) => ({ ...r, [id]: { ...row, planned, remaining: row.soldOut ? 0 : planned - row.sold } }));
    window.clearTimeout(timers.current[id]);
    timers.current[id] = window.setTimeout(() => void send(id, { planned }), 450);
  };

  const toggleSoldOut = (id: string) => {
    const row = rows[id];
    setRows((r) => ({ ...r, [id]: { ...row, soldOut: !row.soldOut } }));
    void send(id, { soldOut: !row.soldOut });
  };

  const fillUsual = async () => {
    setState("saving");
    const res = await fetch("/api/staff/bake", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ shop, date }) });
    const data = await res.json();
    setRows(Object.fromEntries((data.rows as BakeRow[]).map((r) => [r.productId, r])));
    setState("saved");
  };

  const chooseShop = (s: ShopId) => {
    setShop(s);
    save(KEYS.shop, s);
  };

  const all = Object.values(rows);
  const totalPlanned = all.reduce((s, r) => s + r.planned, 0);
  const totalSold = all.reduce((s, r) => s + r.sold, 0);

  return (
    <div className="planner">
      <div className="staff-head">
        <div>
          <h1>Bake plan</h1>
          <p className="muted">
            {formatDate(date, "long")} · {totalPlanned} items planned · {totalSold} already ordered
          </p>
        </div>
        <p className={`save-state save-state--${state}`} role="status" aria-live="polite">
          {state === "saving" ? "Saving…" : state === "saved" ? "All changes saved" : state === "error" ? `Not saved: ${message}` : "Changes save automatically"}
        </p>
      </div>

      <StaffPickers shop={shop} date={date} today={today} onShop={chooseShop} onDate={setDate} />

      <div className="planner__tools">
        <button type="button" className="btn btn--secondary btn--small" onClick={fillUsual}>
          Reset to usual quantities
        </button>
      </div>

      {CATEGORIES.map((c) => (
        <section key={c.id} className="planner__cat" aria-labelledby={`plan-${c.id}`}>
          <h2 id={`plan-${c.id}`}>{c.label}</h2>
          <ul className="plan-list">
            {PRODUCTS.filter((p) => p.category === c.id).map((p) => {
              const r = rows[p.id];
              if (!r) return null;
              const left = r.soldOut ? 0 : r.planned - r.sold;
              return (
                <li key={p.id} className={`plan-row${r.soldOut ? " is-soldout" : ""}`}>
                  <div className="plan-row__info">
                    <span className="plan-row__name">{getProduct(p.id)!.name}</span>
                    <span className="plan-row__meta">
                      <strong>{r.sold}</strong> ordered · {r.soldOut ? "marked sold out" : `${left} left to sell`}
                      {r.planned !== r.par ? <span className="plan-row__par"> · usual {r.par}</span> : null}
                    </span>
                  </div>
                  <div className="plan-row__controls">
                    <div className="big-stepper" role="group" aria-label={`${p.name} quantity to bake`}>
                      <button type="button" onClick={() => setPlanned(p.id, r.planned - 1)} disabled={r.planned <= r.sold} aria-label={`One fewer ${p.name}`}>
                        <Icon name="minus" size={24} />
                      </button>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={r.sold}
                        max={999}
                        value={r.planned}
                        aria-label={`${p.name}: quantity to bake`}
                        onChange={(e) => setPlanned(p.id, Number(e.target.value || 0))}
                        onFocus={(e) => e.target.select()}
                      />
                      <button type="button" onClick={() => setPlanned(p.id, r.planned + 1)} aria-label={`One more ${p.name}`}>
                        <Icon name="plus" size={24} />
                      </button>
                    </div>
                    <label className="switch">
                      <input type="checkbox" checked={r.soldOut} onChange={() => toggleSoldOut(p.id)} />
                      <span className="switch__track" aria-hidden="true" />
                      <span>Sold out</span>
                    </label>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
