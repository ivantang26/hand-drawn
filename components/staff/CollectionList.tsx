"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/illustrations";
import { KEYS, load, save } from "@/lib/client/storage";
import { formatDate, formatTime } from "@/lib/dates";
import { money } from "@/lib/format";
import { getShop, type ShopId } from "@/lib/shops";
import type { Order } from "@/lib/types";
import { StaffPickers } from "./StaffPickers";

/** Orders by time slot with a "collected" tick, plus a pick list; prints cleanly (FR-5). */
export function CollectionList({ today, initial }: { today: string; initial: Order[] }) {
  const [shop, setShop] = useState<ShopId>("mill-lane");
  const [date, setDate] = useState(today);
  const [orders, setOrders] = useState(initial);
  const [query, setQuery] = useState("");
  const [hideCollected, setHideCollected] = useState(false);

  useEffect(() => {
    const saved = load<ShopId | null>(KEYS.shop, null);
    if (saved && saved !== "mill-lane") setShop(saved);
  }, []);

  const refresh = useCallback(async (s: ShopId, d: string) => {
    const res = await fetch(`/api/staff/orders?shop=${s}&date=${d}`, { cache: "no-store" });
    const data = await res.json();
    setOrders(data.orders);
  }, []);

  useEffect(() => {
    void refresh(shop, date);
    const t = window.setInterval(() => void refresh(shop, date), 30_000);
    return () => window.clearInterval(t);
  }, [shop, date, refresh]);

  const toggle = async (o: Order) => {
    const collected = o.status !== "collected";
    setOrders((list) => list.map((x) => (x.id === o.id ? { ...x, status: collected ? "collected" : "paid" } : x)));
    const res = await fetch("/api/staff/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: o.id, collected }) });
    if (!res.ok) void refresh(shop, date);
  };

  const q = query.trim().toLowerCase();
  const filtered = orders.filter(
    (o) => (!hideCollected || o.status !== "collected") && (!q || o.id.toLowerCase().includes(q) || o.customer.name.toLowerCase().includes(q)),
  );
  const slots = useMemo(() => [...new Set(filtered.map((o) => o.slot))].sort(), [filtered]);
  const collected = orders.filter((o) => o.status === "collected").length;

  const pickList = useMemo(() => {
    const m = new Map<string, number>();
    for (const o of orders) for (const l of o.lines) m.set(l.name, (m.get(l.name) ?? 0) + l.qty);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [orders]);

  return (
    <div className="collections">
      <div className="staff-head">
        <div>
          <h1>Collections</h1>
          <p className="muted">
            {getShop(shop)!.short} · {formatDate(date, "long")} · {collected} of {orders.length} collected
          </p>
        </div>
        <button type="button" className="btn btn--secondary btn--small no-print" onClick={() => window.print()}>
          Print list
        </button>
      </div>

      <div className="no-print">
        <StaffPickers
          shop={shop}
          date={date}
          today={today}
          onShop={(s) => {
            setShop(s);
            save(KEYS.shop, s);
          }}
          onDate={setDate}
          from={-1}
          days={4}
        />
        <div className="collections__tools">
          <div className="field">
            <label htmlFor="find-order" className="visually-hidden">
              Find an order
            </label>
            <input id="find-order" type="search" placeholder="Find by name or order number" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <label className="check">
            <input type="checkbox" checked={hideCollected} onChange={(e) => setHideCollected(e.target.checked)} />
            <span>Hide collected</span>
          </label>
        </div>
        <div className="progress" aria-hidden="true">
          <span style={{ width: `${orders.length ? (collected / orders.length) * 100 : 0}%` }} />
        </div>
      </div>

      {orders.length === 0 ? <p className="muted">No orders for this day yet.</p> : null}

      {slots.map((slot) => {
        const inSlot = filtered.filter((o) => o.slot === slot);
        return (
          <section key={slot} className="slot-group" aria-labelledby={`slot-${slot}`}>
            <h2 id={`slot-${slot}`} className="slot-group__title">
              {formatTime(slot)} <span className="muted">· {inSlot.length}</span>
            </h2>
            <ul className="order-cards">
              {inSlot.map((o) => {
                const done = o.status === "collected";
                return (
                  <li key={o.id} className={`order-card${done ? " is-done" : ""}`}>
                    <label className="order-card__tick">
                      <input type="checkbox" checked={done} onChange={() => toggle(o)} />
                      <span className="order-card__box" aria-hidden="true">
                        <Icon name="check" size={26} />
                      </span>
                      <span className="visually-hidden">
                        Collected: {o.customer.name}, {o.id}
                      </span>
                    </label>
                    <div className="order-card__body">
                      <div className="order-card__top">
                        <strong className="order-card__name">{o.customer.name}</strong>
                        <span className="order-card__id">{o.id}</span>
                      </div>
                      <p className="order-card__items">{o.lines.map((l) => `${l.qty}× ${l.name}`).join(", ")}</p>
                      {o.notes ? <p className="order-card__notes">Note: {o.notes}</p> : null}
                    </div>
                    <span className="price order-card__total">{money(o.total)}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      {pickList.length ? (
        <section className="pick-list" aria-labelledby="pick-title">
          <h2 id="pick-title">Pick list for the day</h2>
          <table>
            <thead>
              <tr>
                <th scope="col">Item</th>
                <th scope="col">Pre-ordered</th>
              </tr>
            </thead>
            <tbody>
              {pickList.map(([name, qty]) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td>{qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}
    </div>
  );
}
