"use client";

import { useId, useState } from "react";
import { Illo } from "@/components/illustrations";
import { Button } from "@/components/ui";
import { money } from "@/lib/format";
import type { ApiError } from "@/lib/types";
import { VOUCHER_AMOUNTS } from "@/lib/workshops";

type Bought = { code: string; amount: number; recipient: string; from: string; message?: string };

const LABELS: Record<number, string> = {
  2500: "Coffee & cake for a month",
  5000: "Anything, any time",
  8500: "A place on Sourdough Basics",
  11000: "A place on Croissants at Home",
};

/** Gift vouchers with a code, redeemable against classes (FR-6). */
export function VoucherForm() {
  const uid = useId();
  const [amount, setAmount] = useState(8500);
  const [recipient, setRecipient] = useState("");
  const [from, setFrom] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [bought, setBought] = useState<Bought | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, recipient, from, message, email }),
      });
      const data = await res.json();
      if (!res.ok) setError(data);
      else setBought(data);
    } catch {
      setError({ error: "We couldn't reach the bakery. Nothing has been charged; please try again." });
    } finally {
      setBusy(false);
    }
  };

  if (bought) {
    return (
      <div className="gift-tag" role="status">
        <span className="gift-tag__hole" aria-hidden="true" />
        <Illo name="wheat" className="gift-tag__illo" />
        <p className="note">For {bought.recipient}</p>
        <p className="gift-tag__amount">{money(bought.amount)}</p>
        {bought.message ? <p className="gift-tag__msg">“{bought.message}”</p> : null}
        <p className="gift-tag__from">Love from {bought.from}</p>
        <p className="gift-tag__code">
          <span className="small">Voucher code</span>
          <strong>{bought.code}</strong>
        </p>
        <p className="small muted">We&apos;ve emailed a printable version to you. Valid for 12 months at both shops and on any class.</p>
        <button type="button" className="btn btn--ghost btn--small" onClick={() => setBought(null)}>
          Buy another
        </button>
      </div>
    );
  }

  const err = (f: string) => (error?.field === f ? error.error : null);

  return (
    <form className="voucher-form" onSubmit={submit} noValidate>
      <fieldset className="fieldset">
        <legend>Choose an amount</legend>
        <div className="amount-choice">
          {VOUCHER_AMOUNTS.map((a) => (
            <label key={a} className="amount-choice__option">
              <input type="radio" name={`${uid}-amount`} value={a} checked={amount === a} onChange={() => setAmount(a)} />
              <span className="amount-choice__value">{money(a).replace(".00", "")}</span>
              <span className="amount-choice__label">{LABELS[a]}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="form-grid form-grid--2">
        <div className="field">
          <label htmlFor={`${uid}-to`}>Who is it for?</label>
          <input id={`${uid}-to`} value={recipient} onChange={(e) => setRecipient(e.target.value)} aria-invalid={!!err("recipient")} />
          {err("recipient") ? <p className="field__error">{err("recipient")}</p> : null}
        </div>
        <div className="field">
          <label htmlFor={`${uid}-from`}>From</label>
          <input id={`${uid}-from`} value={from} onChange={(e) => setFrom(e.target.value)} aria-invalid={!!err("from")} />
          {err("from") ? <p className="field__error">{err("from")}</p> : null}
        </div>
        <div className="field span-2">
          <label htmlFor={`${uid}-msg`}>Message (optional)</label>
          <textarea id={`${uid}-msg`} maxLength={200} value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
        <div className="field span-2">
          <label htmlFor={`${uid}-email`}>Your email</label>
          <input id={`${uid}-email`} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!err("email")} />
          <p className="field__hint">We send the voucher to you, so you can print it or pass it on.</p>
          {err("email") ? <p className="field__error">{err("email")}</p> : null}
        </div>
      </div>
      {error && !["recipient", "from", "email"].includes(error.field ?? "") ? (
        <p className="form-error" role="alert">
          {error.error}
        </p>
      ) : null}
      <Button type="submit" busy={busy} disabled={busy} arrow>
        {busy ? "Wrapping it up…" : `Buy a ${money(amount).replace(".00", "")} voucher`}
      </Button>
    </form>
  );
}
