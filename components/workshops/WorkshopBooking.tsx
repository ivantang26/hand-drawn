"use client";

import { useEffect, useId, useState } from "react";
import { Illo } from "@/components/illustrations";
import { Button, Stepper } from "@/components/ui";
import { formatDate, formatTime } from "@/lib/dates";
import { money, plural } from "@/lib/format";
import { getShop } from "@/lib/shops";
import type { ApiError, Booking, WorkshopSession } from "@/lib/types";
import { WORKSHOP_TYPES, getWorkshopType } from "@/lib/workshops";

/** Upcoming class dates with live seats, and an inline booking form (FR-6). */
export function WorkshopBooking({ initial }: { initial: WorkshopSession[] }) {
  const [sessions, setSessions] = useState(initial);
  const [type, setType] = useState<string>("all");
  const [open, setOpen] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && initial.some((s) => s.id === hash)) {
      setOpen(hash);
      setShowAll(true);
      requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView({ block: "center" }));
    }
  }, [initial]);

  const matching = sessions.filter((s) => type === "all" || s.typeId === type);
  const shown = showAll ? matching : matching.slice(0, 6);

  return (
    <div className="sessions">
      <div className="segmented segmented--wrap" role="radiogroup" aria-label="Show classes">
        {[{ id: "all", title: "All classes" }, ...WORKSHOP_TYPES].map((t) => (
          <button key={t.id} type="button" role="radio" aria-checked={type === t.id} className="segmented__option" onClick={() => setType(t.id)}>
            {t.title}
          </button>
        ))}
      </div>
      <ul className="session-list">
        {shown.map((s) => {
          const t = getWorkshopType(s.typeId)!;
          const full = s.seatsLeft === 0;
          return (
            <li key={s.id} id={s.id} className={`session${open === s.id ? " is-open" : ""}`}>
              <div className="session__row">
                <div className="class-card__date" aria-hidden="true">
                  <span className="class-card__day">{formatDate(s.date).split(" ")[0]}</span>
                  <span className="class-card__num">{Number(s.date.slice(8))}</span>
                  <span className="class-card__mon">{formatDate(s.date).split(" ")[2]}</span>
                </div>
                <div className="session__info">
                  <h3 className="session__title">{t.title}</h3>
                  <p className="session__when">
                    {formatDate(s.date, "long")}, {formatTime(s.start)} · {getShop(t.shop)!.short}
                  </p>
                </div>
                <div className="session__meta">
                  <span className="price">{money(t.price)}</span>
                  <span className={`chip ${full ? "chip--soldout" : s.seatsLeft <= 2 ? "chip--few" : ""}`}>
                    <span className="chip__dot" aria-hidden="true" />
                    {full ? "Full" : s.seatsLeft === 1 ? "Last seat" : `${plural(s.seatsLeft, "seat")} left`}
                  </span>
                </div>
                <Button
                  type="button"
                  variant={open === s.id ? "secondary" : "primary"}
                  className="btn--small session__book"
                  disabled={full}
                  aria-expanded={open === s.id}
                  aria-controls={`book-${s.id}`}
                  onClick={() => setOpen(open === s.id ? null : s.id)}
                >
                  {full ? "Full" : open === s.id ? "Close" : "Book"}
                  <span className="visually-hidden">
                    {" "}
                    {t.title} on {formatDate(s.date, "long")}
                  </span>
                </Button>
              </div>
              {open === s.id ? (
                <BookingForm
                  session={s}
                  onBooked={(seatsLeft) => setSessions((list) => list.map((x) => (x.id === s.id ? { ...x, seatsLeft } : x)))}
                />
              ) : null}
            </li>
          );
        })}
      </ul>
      {matching.length > shown.length ? (
        <button type="button" className="btn btn--secondary sessions__more" onClick={() => setShowAll(true)}>
          Show {matching.length - shown.length} more dates
        </button>
      ) : null}
    </div>
  );
}

function BookingForm({ session, onBooked }: { session: WorkshopSession; onBooked: (seatsLeft: number) => void }) {
  const uid = useId();
  const t = getWorkshopType(session.typeId)!;
  const [seats, setSeats] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [voucher, setVoucher] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [voucherMsg, setVoucherMsg] = useState<string | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Booking | null>(null);

  const total = t.price * seats;
  const covered = balance ? Math.min(balance, total) : 0;

  const checkVoucher = async () => {
    setVoucherMsg(null);
    setBalance(null);
    if (!voucher.trim()) return;
    const res = await fetch(`/api/vouchers?code=${encodeURIComponent(voucher.trim())}`);
    const data = await res.json();
    if (!res.ok) setVoucherMsg(data.error);
    else if (data.balance <= 0) setVoucherMsg("That voucher has already been used.");
    else {
      setBalance(data.balance);
      setVoucherMsg(`${money(data.balance)} available on this voucher.`);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/workshops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id, seats, name, email, voucher: balance ? voucher : "" }),
      });
      const data = await res.json();
      if (!res.ok) setError(data);
      else {
        setDone(data.booking);
        onBooked(data.seatsLeft);
      }
    } catch {
      setError({ error: "We couldn't reach the bakery. Nothing has been charged; please try again." });
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="booking-done" id={`book-${session.id}`} role="status">
        <Illo name="wheat" size={56} className="sway" />
        <div>
          <h4>You&apos;re booked in!</h4>
          <p>
            {plural(done.seats, "seat")} for {t.title} on {formatDate(session.date, "long")} at {formatTime(session.start)}. Booking reference{" "}
            <strong>{done.id}</strong>. We&apos;ve emailed the details to {done.email}.
          </p>
          <p className="small muted">
            {done.voucherApplied ? `${money(done.voucherApplied)} paid by voucher, ${money(done.paid)} by card.` : `Paid ${money(done.paid)}.`} Wear
            closed shoes and bring an apron if you have one.
          </p>
        </div>
      </div>
    );
  }

  const err = (f: string) => (error?.field === f ? error.error : null);

  return (
    <form className="booking-form" id={`book-${session.id}`} onSubmit={submit} noValidate>
      <div className="form-grid form-grid--2">
        <div className="field">
          <span className="field__label" id={`${uid}-seats`}>
            Seats
          </span>
          <Stepper value={seats} min={1} max={Math.min(4, session.seatsLeft)} onChange={setSeats} label="seats" />
          <p className="field__hint">Up to {Math.min(4, session.seatsLeft)} for this date.</p>
          {err("seats") ? <p className="field__error">{err("seats")}</p> : null}
        </div>
        <div className="field">
          <label htmlFor={`${uid}-voucher`}>Gift voucher code (optional)</label>
          <div className="inline-field">
            <input id={`${uid}-voucher`} value={voucher} onChange={(e) => setVoucher(e.target.value.toUpperCase())} placeholder="WILD-XXXX-XXXX" autoComplete="off" />
            <button type="button" className="btn btn--secondary btn--small" onClick={checkVoucher}>
              Apply
            </button>
          </div>
          {voucherMsg ? <p className={balance ? "field__hint" : "field__error"}>{voucherMsg}</p> : <p className="field__hint">Try WILD-GIFT-2026 in this demo.</p>}
        </div>
        <div className="field">
          <label htmlFor={`${uid}-name`}>Your name</label>
          <input id={`${uid}-name`} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!err("name")} />
          {err("name") ? <p className="field__error">{err("name")}</p> : null}
        </div>
        <div className="field">
          <label htmlFor={`${uid}-email`}>Email</label>
          <input id={`${uid}-email`} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!err("email")} />
          {err("email") ? <p className="field__error">{err("email")}</p> : null}
        </div>
      </div>
      {error && !["name", "email", "seats"].includes(error.field ?? "") ? (
        <p className="form-error" role="alert">
          {error.error}
        </p>
      ) : null}
      <div className="booking-form__foot">
        <p className="booking-form__total">
          {covered ? (
            <>
              <span className="muted">
                {money(total)} − {money(covered)} voucher ={" "}
              </span>
              <span className="price">{money(total - covered)}</span>
            </>
          ) : (
            <span className="price">{money(total)}</span>
          )}
        </p>
        <Button type="submit" busy={busy} disabled={busy} arrow>
          {busy ? "Booking…" : total - covered > 0 ? `Pay ${money(total - covered)}` : "Confirm booking"}
        </Button>
      </div>
    </form>
  );
}
