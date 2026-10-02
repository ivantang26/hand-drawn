"use client";

import { useId } from "react";
import { Illo } from "@/components/illustrations";
import { Note } from "@/components/shapes";
import { Button, Stepper } from "@/components/ui";
import type { Product } from "@/lib/catalog";
import { money, plural } from "@/lib/format";
import type { ApiError, Customer } from "@/lib/types";

type Props = {
  lines: { product: Product; qty: number }[];
  count: number;
  total: number;
  summary: string | null;
  customer: Customer;
  onCustomer: (c: Customer) => void;
  notes: string;
  onNotes: (n: string) => void;
  onQty: (id: string, qty: number) => void;
  maxFor: (id: string) => number;
  onSubmit: () => void;
  submitting: boolean;
  error: ApiError | null;
  missing: "date" | "slot" | "items" | null;
};

/** Basket and checkout in one panel: the desktop sidebar and the mobile sheet both render this. */
export function BasketPanel(p: Props) {
  const uid = useId();
  const fieldError = (f: string) => (p.error?.field === f ? p.error.error : null);
  const set = (k: keyof Customer) => (e: React.ChangeEvent<HTMLInputElement>) => p.onCustomer({ ...p.customer, [k]: e.target.value });

  return (
    <div className="basket">
      <div className="basket__head">
        <span className="basket__icon" data-basket-target>
          <Illo name="basket" size={34} />
          {p.count ? <span className="basket__count">{p.count}</span> : null}
        </span>
        <h2 className="basket__title">Your basket</h2>
      </div>

      {p.count === 0 ? (
        <div className="basket__empty">
          <Illo name="bag" size={72} />
          <p>Nothing in here yet.</p>
          <Note>Tap “Add” on anything you fancy</Note>
        </div>
      ) : (
        <>
          <ul className="basket__lines">
            {p.lines.map(({ product, qty }) => (
              <li key={product.id} className="basket-line">
                <div className="basket-line__info">
                  <span className="basket-line__name">{product.name}</span>
                  <span className="price basket-line__price">{money(product.price * qty)}</span>
                </div>
                <Stepper value={qty} max={p.maxFor(product.id)} label={product.name} onChange={(v) => p.onQty(product.id, v)} />
              </li>
            ))}
          </ul>
          <div className="basket__total">
            <span>
              Total <span className="muted small">({plural(p.count, "item")})</span>
            </span>
            <span className="price">{money(p.total)}</span>
          </div>
        </>
      )}

      <div className={`basket__collect${p.summary ? "" : " is-missing"}`}>
        <Illo name="clock" size={28} />
        <p>
          {p.summary ?? (p.missing === "date" ? "Choose a collection day" : "Choose a collection time")}
          {!p.summary ? <span className="visually-hidden"> (step 2)</span> : null}
        </p>
      </div>

      {p.count > 0 ? (
        <form
          className="checkout"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            p.onSubmit();
          }}
        >
          <h3 className="checkout__title">Your details</h3>
          <div className="field">
            <label htmlFor={`${uid}-name`}>Name for the order</label>
            <input id={`${uid}-name`} name="name" autoComplete="name" required value={p.customer.name} onChange={set("name")} aria-invalid={!!fieldError("name")} aria-describedby={fieldError("name") ? `${uid}-name-err` : undefined} />
            {fieldError("name") ? <p className="field__error" id={`${uid}-name-err`}>{fieldError("name")}</p> : null}
          </div>
          <div className="field">
            <label htmlFor={`${uid}-email`}>Email</label>
            <input id={`${uid}-email`} name="email" type="email" inputMode="email" autoComplete="email" required value={p.customer.email} onChange={set("email")} aria-invalid={!!fieldError("email")} aria-describedby={`${uid}-email-hint${fieldError("email") ? ` ${uid}-email-err` : ""}`} />
            <p className="field__hint" id={`${uid}-email-hint`}>For your receipt and confirmation.</p>
            {fieldError("email") ? <p className="field__error" id={`${uid}-email-err`}>{fieldError("email")}</p> : null}
          </div>
          <div className="field">
            <label htmlFor={`${uid}-phone`}>Mobile</label>
            <input id={`${uid}-phone`} name="phone" type="tel" inputMode="tel" autoComplete="tel" required value={p.customer.phone} onChange={set("phone")} aria-invalid={!!fieldError("phone")} aria-describedby={`${uid}-phone-hint${fieldError("phone") ? ` ${uid}-phone-err` : ""}`} />
            <p className="field__hint" id={`${uid}-phone-hint`}>We text your order number. Show it at the counter.</p>
            {fieldError("phone") ? <p className="field__error" id={`${uid}-phone-err`}>{fieldError("phone")}</p> : null}
          </div>
          <details className="checkout__notes">
            <summary>Add a note (optional)</summary>
            <div className="field">
              <label htmlFor={`${uid}-notes`} className="visually-hidden">
                Note for the bakers
              </label>
              <textarea id={`${uid}-notes`} value={p.notes} maxLength={280} onChange={(e) => p.onNotes(e.target.value)} placeholder="Sliced please, or a birthday candle for the cake…" />
            </div>
          </details>

          {p.error && !["name", "email", "phone"].includes(p.error.field ?? "") ? (
            <div className="form-error" role="alert">
              <span>
                {p.error.error}
                {p.error.shortages?.length ? " We've updated your basket to what's left." : ""}
              </span>
            </div>
          ) : null}

          <Button type="submit" className="btn--block checkout__pay" busy={p.submitting} disabled={p.submitting} arrow>
            {p.submitting ? "Placing your order…" : `Pay ${money(p.total)}`}
          </Button>
          <p className="checkout__small small muted">
            Card payment by Stripe in production. In this demo, payment is simulated and nothing is charged.
          </p>
        </form>
      ) : null}
    </div>
  );
}
