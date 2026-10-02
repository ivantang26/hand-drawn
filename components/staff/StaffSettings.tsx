"use client";

import { useState } from "react";
import { Chalkboard } from "@/components/Chalkboard";
import { Icon } from "@/components/illustrations";
import { Button } from "@/components/ui";
import { formatDate } from "@/lib/dates";
import { SHOPS, getShop, type Closure, type ShopId } from "@/lib/shops";
import type { Special } from "@/lib/types";

/** Chalkboard specials and holiday closures (FR-4 specials, FR-9 closures). */
export function StaffSettings({ today, specials: initialSpecials, closures: initialClosures }: { today: string; specials: Special[]; closures: Closure[] }) {
  return (
    <div className="settings">
      <div className="staff-head">
        <div>
          <h1>Specials &amp; hours</h1>
          <p className="muted">What goes on the chalkboard, and days the shops are shut.</p>
        </div>
      </div>
      <div className="settings__grid">
        <SpecialsEditor initial={initialSpecials} />
        <ClosuresEditor today={today} initial={initialClosures} />
      </div>
    </div>
  );
}

function SpecialsEditor({ initial }: { initial: Special[] }) {
  const [list, setList] = useState(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const update = (i: number, change: Partial<Special>) => {
    setList((l) => l.map((s, j) => (j === i ? { ...s, ...change } : s)));
    setState("idle");
  };

  const saveAll = async () => {
    setState("saving");
    const res = await fetch("/api/staff/specials", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ specials: list }) });
    if (!res.ok) return setState("error");
    const data = await res.json();
    setList(data.specials);
    setState("saved");
  };

  return (
    <section className="card settings__card" aria-labelledby="specials-title">
      <h2 id="specials-title">Chalkboard specials</h2>
      <ul className="specials-edit">
        {list.map((s, i) => (
          <li key={s.id} className="specials-edit__row">
            <div className="field">
              <label htmlFor={`sp-title-${i}`}>Special</label>
              <input id={`sp-title-${i}`} value={s.title} maxLength={60} onChange={(e) => update(i, { title: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor={`sp-detail-${i}`}>Detail</label>
              <input id={`sp-detail-${i}`} value={s.detail ?? ""} maxLength={90} onChange={(e) => update(i, { detail: e.target.value })} />
            </div>
            <div className="specials-edit__small">
              <div className="field">
                <label htmlFor={`sp-price-${i}`}>Price</label>
                <input id={`sp-price-${i}`} value={s.price ?? ""} maxLength={12} placeholder="£0.00" onChange={(e) => update(i, { price: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor={`sp-kind-${i}`}>Board</label>
                <select id={`sp-kind-${i}`} value={s.kind} onChange={(e) => update(i, { kind: e.target.value as Special["kind"] })}>
                  <option value="today">Today</option>
                  <option value="seasonal">Seasonal</option>
                </select>
              </div>
              <button type="button" className="icon-btn" onClick={() => setList((l) => l.filter((_, j) => j !== i))} aria-label={`Remove ${s.title || "this special"}`}>
                <Icon name="close" />
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="settings__actions">
        <button
          type="button"
          className="btn btn--secondary btn--small"
          onClick={() => setList((l) => [...l, { id: `new-${Date.now()}`, kind: "today", title: "" }])}
          disabled={list.length >= 12}
        >
          <span>
            <Icon name="plus" size={18} /> Add a special
          </span>
        </button>
        <Button type="button" onClick={saveAll} busy={state === "saving"}>
          {state === "saving" ? "Saving…" : "Save the board"}
        </Button>
        <span role="status" className="small muted">
          {state === "saved" ? "Saved. It's on the home page now." : state === "error" ? "Couldn't save. Try again." : ""}
        </span>
      </div>
      <details className="settings__preview">
        <summary>Preview the board</summary>
        <Chalkboard specials={list.filter((s) => s.title.trim())} />
      </details>
    </section>
  );
}

function ClosuresEditor({ today, initial }: { today: string; initial: Closure[] }) {
  const [list, setList] = useState(initial);
  const [shop, setShop] = useState<ShopId | "both">("both");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [affected, setAffected] = useState<{ id: string; name: string; date: string }[] | null>(null);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/staff/closures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shop, from, to: to || from, reason }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error);
    setList((l) => [...l, data.closure].sort((a, b) => a.from.localeCompare(b.from)));
    setAffected(data.affected);
    setFrom("");
    setTo("");
    setReason("");
  };

  const remove = async (id: string) => {
    await fetch(`/api/staff/closures?id=${id}`, { method: "DELETE" });
    setList((l) => l.filter((c) => c.id !== id));
  };

  const upcoming = list.filter((c) => c.to >= today);

  return (
    <section className="card settings__card" aria-labelledby="closures-title">
      <h2 id="closures-title">Holidays &amp; closures</h2>
      <p className="small muted">Closed days disappear from the order page straight away, with the reason shown to customers.</p>
      <ul className="closure-list">
        {upcoming.map((c) => (
          <li key={c.id}>
            <div>
              <strong>{c.from === c.to ? formatDate(c.from) : `${formatDate(c.from)} – ${formatDate(c.to)}`}</strong>
              <span className="muted">
                {" "}
                · {c.shop === "both" ? "Both shops" : getShop(c.shop)!.short} · {c.reason}
              </span>
            </div>
            <button type="button" className="icon-btn" onClick={() => remove(c.id)} aria-label={`Remove closure on ${formatDate(c.from)}`}>
              <Icon name="close" />
            </button>
          </li>
        ))}
        {upcoming.length === 0 ? <li className="muted">No closures planned.</li> : null}
      </ul>

      <form className="closure-form" onSubmit={add} noValidate>
        <h3>Add a closure</h3>
        <div className="form-grid form-grid--2">
          <div className="field">
            <label htmlFor="cl-shop">Shop</label>
            <select id="cl-shop" value={shop} onChange={(e) => setShop(e.target.value as ShopId | "both")}>
              <option value="both">Both shops</option>
              {SHOPS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.short}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="cl-reason">Reason customers will see</label>
            <input id="cl-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="staff training day" maxLength={60} />
          </div>
          <div className="field">
            <label htmlFor="cl-from">From</label>
            <input id="cl-from" type="date" min={today} value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="cl-to">
              To <span className="muted">(optional)</span>
            </label>
            <input id="cl-to" type="date" min={from || today} value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" className="closure-form__btn">
          Add closure
        </Button>
        {affected ? (
          <p className={affected.length ? "form-error" : "small muted"} role="status">
            {affected.length
              ? `${affected.length} paid order${affected.length === 1 ? " is" : "s are"} booked for those days (${affected
                  .slice(0, 4)
                  .map((a) => `${a.name}, ${a.id}`)
                  .join("; ")}${affected.length > 4 ? "…" : ""}). Please contact them to move or refund.`
              : "Added. No existing orders are affected."}
          </p>
        ) : null}
      </form>
    </section>
  );
}
