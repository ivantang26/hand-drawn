"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Icon, Illo } from "@/components/illustrations";
import { AvailabilityChip, Button, Stepper } from "@/components/ui";
import { ALLERGENS, describeContains, allergenLabel, passesAllergenFilter, type AllergenId } from "@/lib/allergens";
import { CATEGORIES, PRODUCTS, getProduct, productImage } from "@/lib/catalog";
import { KEYS, load, save } from "@/lib/client/storage";
import { hopToBasket } from "@/lib/client/hop";
import { addDays, formatDate, formatTime, relativeDay } from "@/lib/dates";
import { money, plural } from "@/lib/format";
import { SHOPS, getShop, type ShopId } from "@/lib/shops";
import type { ApiError, BasketLine, Customer, OrderOptions } from "@/lib/types";
import { BasketPanel } from "./BasketPanel";

type SavedBasket = { shop: ShopId; date: string | null; lines: BasketLine[] };

const EMPTY_CUSTOMER: Customer = { name: "", email: "", phone: "" };

export function OrderFlow({ initial, add }: { initial: OrderOptions; add?: string }) {
  const router = useRouter();
  const [options, setOptions] = useState(initial);
  const [shop, setShop] = useState<ShopId>(initial.shop);
  const [date, setDate] = useState<string | null>(initial.date);
  const [slot, setSlot] = useState<string | null>(null);
  const [basket, setBasket] = useState<Record<string, number>>({});
  const [customer, setCustomer] = useState<Customer>(EMPTY_CUSTOMER);
  const [notes, setNotes] = useState("");
  const [excluded, setExcluded] = useState<AllergenId[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const sheetRef = useRef<HTMLDialogElement>(null);
  const requestId = useRef(0);

  const fetchOptions = useCallback(async (nextShop: ShopId, nextDate: string | null) => {
    const id = ++requestId.current;
    setLoading(true);
    try {
      const res = await fetch(`/api/order-options?shop=${nextShop}${nextDate ? `&date=${nextDate}` : ""}`, { cache: "no-store" });
      const data = (await res.json()) as OrderOptions;
      if (id !== requestId.current) return null;
      setOptions(data);
      setDate(data.date);
      return data;
    } catch {
      if (id === requestId.current) setNotice("We couldn't refresh availability. Check your connection and try again.");
      return null;
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  // Restore this device's basket, details and preferences, then apply ?add=.
  useEffect(() => {
    const saved = load<SavedBasket | null>(KEYS.basket, null);
    const savedShop = load<ShopId | null>(KEYS.shop, null);
    const lines: Record<string, number> = {};
    if (saved && saved.shop === initial.shop) for (const l of saved.lines) if (getProduct(l.productId)) lines[l.productId] = l.qty;
    if (add && getProduct(add)) {
      const left = initial.availability[add]?.remaining ?? 0;
      if (left > 0) lines[add] = Math.min(left, Math.max(1, lines[add] ?? 0));
    }
    setBasket(lines);
    setCustomer({ ...EMPTY_CUSTOMER, ...load<Partial<Customer>>(KEYS.customer, {}) });
    setExcluded(load<AllergenId[]>(KEYS.allergens, []));
    const savedSlot = load<string | null>(KEYS.slot, null);
    if (savedSlot && initial.slots.some((s) => s.time === savedSlot && s.available)) setSlot(savedSlot);
    // A regular's usual shop wins unless the link chose one.
    const urlHasShop = new URLSearchParams(window.location.search).has("shop");
    if (!urlHasShop && savedShop && savedShop !== initial.shop) {
      setShop(savedShop);
      void fetchOptions(savedShop, null);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist the basket on this device.
  useEffect(() => {
    if (!hydrated) return;
    const lines = Object.entries(basket)
      .filter(([, q]) => q > 0)
      .map(([productId, qty]) => ({ productId, qty }));
    save(KEYS.basket, { shop, date, lines } satisfies SavedBasket);
  }, [basket, shop, date, hydrated]);

  useEffect(() => {
    if (hydrated) save(KEYS.allergens, excluded);
  }, [excluded, hydrated]);

  // Keep availability live while the page is open.
  useEffect(() => {
    const t = window.setInterval(() => {
      if (document.visibilityState === "visible" && !submitting) void fetchOptions(shop, date);
    }, 30_000);
    return () => window.clearInterval(t);
  }, [shop, date, submitting, fetchOptions]);

  // When availability changes, never hold more than is left.
  useEffect(() => {
    setBasket((b) => {
      const dropped: string[] = [];
      const next: Record<string, number> = {};
      for (const [id, qty] of Object.entries(b)) {
        const left = options.availability[id]?.remaining;
        if (left === undefined) {
          next[id] = qty;
          continue;
        }
        if (left <= 0) dropped.push(getProduct(id)!.name);
        else next[id] = Math.min(qty, left);
      }
      if (dropped.length) setNotice(`${dropped.join(", ")} ${dropped.length === 1 ? "is" : "are"} sold out for that day, so we've taken ${dropped.length === 1 ? "it" : "them"} out of your basket.`);
      return dropped.length || Object.keys(next).some((k) => next[k] !== b[k]) ? next : b;
    });
    // Drop a slot that has filled up.
    setSlot((s) => (s && options.slots.some((o) => o.time === s && o.available) ? s : null));
  }, [options]);

  const chooseShop = (id: ShopId) => {
    if (id === shop) return;
    setShop(id);
    setNotice(null);
    save(KEYS.shop, id);
    void fetchOptions(id, date);
  };

  const chooseDate = (d: string) => {
    if (d === date) return;
    setNotice(null);
    void fetchOptions(shop, d);
  };

  const chooseSlot = (t: string) => {
    setSlot(t);
    save(KEYS.slot, t);
  };

  const setQty = (id: string, qty: number) => {
    if (qty > (basket[id] ?? 0)) hopToBasket(document.querySelector(`[data-illo="${id}"]`));
    setBasket((b) => {
      const next = { ...b };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });
    setError(null);
  };

  const lines = useMemo(
    () =>
      Object.entries(basket)
        .filter(([, q]) => q > 0)
        .map(([productId, qty]) => ({ product: getProduct(productId)!, qty }))
        .filter((l) => l.product),
    [basket],
  );
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const total = lines.reduce((s, l) => s + l.qty * l.product.price, 0);

  const tomorrow = addDays(options.now.date, 1);
  const tomorrowOption = options.dates.find((d) => d.date === tomorrow);
  const shopInfo = getShop(shop)!;

  const visibleProducts = PRODUCTS.filter((p) => passesAllergenFilter(p, excluded));
  const hiddenCount = PRODUCTS.length - visibleProducts.length;

  const openSheet = () => {
    setSheetOpen(true);
    sheetRef.current?.showModal();
  };
  const closeSheet = () => {
    setSheetOpen(false);
    sheetRef.current?.close();
  };

  const missing = !date ? "date" : !slot ? "slot" : count === 0 ? "items" : null;

  const submit = async () => {
    if (missing) {
      setError({ error: missing === "slot" ? "Choose a collection time first." : missing === "date" ? "Choose a collection day first." : "Add something to your basket first.", field: missing });
      if (missing !== "items") {
        closeSheet();
        document.getElementById("step-when")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop,
          date,
          slot,
          lines: lines.map((l) => ({ productId: l.product.id, qty: l.qty })),
          customer,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const err = data as ApiError;
        setError(err);
        if (err.shortages?.length || err.field === "slot" || err.field === "date") void fetchOptions(shop, date);
        setSubmitting(false);
        return;
      }
      save(KEYS.customer, customer);
      save(KEYS.basket, null);
      router.push(`/order/confirmed/${data.order.id}`);
    } catch {
      setError({ error: "We couldn't reach the bakery. Nothing has been charged; please try again." });
      setSubmitting(false);
    }
  };

  const panel = (
    <BasketPanel
      lines={lines}
      count={count}
      total={total}
      summary={date && slot ? `${shopInfo.short} · ${relativeDay(date, options.now.date)} ${formatDate(date)} · ${formatTime(slot)}` : null}
      customer={customer}
      onCustomer={setCustomer}
      notes={notes}
      onNotes={setNotes}
      onQty={(id, q) => setQty(id, q)}
      maxFor={(id) => options.availability[id]?.remaining ?? 0}
      onSubmit={submit}
      submitting={submitting}
      error={error}
      missing={missing}
    />
  );

  return (
    <div className="order">
      <div className="order__layout">
        <div className="order__main">
          {/* Step 1: shop */}
          <section className="order-step" aria-labelledby="step-where">
            <h2 className="order-step__title" id="step-where">
              <span className="order-step__num" aria-hidden="true">1</span> Where will you collect?
            </h2>
            <div className="shop-choice" role="radiogroup" aria-labelledby="step-where">
              {SHOPS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={shop === s.id}
                  className="shop-choice__option"
                  onClick={() => chooseShop(s.id)}
                >
                  <span className="shop-choice__name">{s.short}</span>
                  <span className="shop-choice__addr">{s.address.slice(0, 2).join(", ")}</span>
                  <span className="shop-choice__tick" aria-hidden="true">
                    <Icon name="check" size={18} />
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Step 2: date and slot */}
          <section className="order-step" aria-labelledby="step-when" aria-busy={loading}>
            <h2 className="order-step__title" id="step-when">
              <span className="order-step__num" aria-hidden="true">2</span> When?
            </h2>
            {tomorrowOption && !tomorrowOption.available ? (
              <p className="order-notice" role="status">
                <Icon name="info" />
                <span>
                  <strong>Tomorrow isn&apos;t available.</strong> {tomorrowOption.reason}
                </span>
              </p>
            ) : null}
            <div className="date-choice" role="radiogroup" aria-label="Collection day">
              {options.dates.map((d) => (
                <button
                  key={d.date}
                  type="button"
                  role="radio"
                  aria-checked={date === d.date}
                  disabled={!d.available}
                  className="date-choice__option"
                  onClick={() => chooseDate(d.date)}
                  title={d.reason}
                  aria-describedby={d.reason ? `why-${d.date}` : undefined}
                >
                  <span className="date-choice__day">{d.date === tomorrow ? "Tomorrow" : formatDate(d.date).split(" ")[0]}</span>
                  <span className="date-choice__date">{formatDate(d.date).split(" ").slice(1).join(" ")}</span>
                  {!d.available ? <span className="date-choice__why">{d.reason?.includes("closed at 8pm") ? "Closed 8pm" : "Closed"}</span> : null}
                  {d.reason ? (
                    <span id={`why-${d.date}`} className="visually-hidden">
                      {d.reason}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>

            {date ? (
              <fieldset className="fieldset slot-fieldset">
                <legend className="slot-legend">
                  Collection time at {shopInfo.short}, {formatDate(date, "long")}
                </legend>
                <div className={`slot-choice${error?.field === "slot" ? " has-error" : ""}`}>
                  {options.slots.map((s) => (
                    <label key={s.time} className={`slot-choice__option${!s.available ? " is-full" : ""}`}>
                      <input
                        type="radio"
                        name="slot"
                        value={s.time}
                        checked={slot === s.time}
                        disabled={!s.available}
                        onChange={() => chooseSlot(s.time)}
                      />
                      <span className="slot-choice__time">{formatTime(s.time)}</span>
                      {!s.available ? <span className="slot-choice__full">Full</span> : s.left <= 3 ? <span className="slot-choice__left">{s.left} left</span> : null}
                    </label>
                  ))}
                </div>
                {error?.field === "slot" ? <p className="field__error">{error.error}</p> : null}
              </fieldset>
            ) : (
              <p className="order-notice">No collection days are open at {shopInfo.short} this week. Try the other shop.</p>
            )}
          </section>

          {/* Step 3: products */}
          <section className="order-step" aria-labelledby="step-what">
            <div className="order-step__head">
              <h2 className="order-step__title" id="step-what">
                <span className="order-step__num" aria-hidden="true">3</span> What would you like?
              </h2>
              <nav className="cat-nav" aria-label="Categories">
                {CATEGORIES.map((c) => (
                  <a key={c.id} href={`#cat-${c.id}`} className="cat-nav__link">
                    {c.label}
                  </a>
                ))}
              </nav>
            </div>

            <details className="allergen-filter" open={excluded.length > 0 ? true : undefined}>
              <summary>
                <span>Allergen filter</span>
                {excluded.length ? <span className="allergen-filter__count">{excluded.length} hidden</span> : <span className="muted small">Hide items containing…</span>}
              </summary>
              <div className="allergen-filter__body">
                <p className="small muted">
                  Hides anything that contains, or may contain, what you tick. If you have a severe allergy, please talk to us: our
                  kitchen handles all 14 allergens.
                </p>
                <div className="allergen-grid">
                  {ALLERGENS.map((a) => (
                    <label key={a.id} className="check">
                      <input
                        type="checkbox"
                        checked={excluded.includes(a.id)}
                        onChange={(e) => setExcluded((x) => (e.target.checked ? [...x, a.id] : x.filter((y) => y !== a.id)))}
                      />
                      <span>{a.short}</span>
                    </label>
                  ))}
                </div>
                {excluded.length ? (
                  <button type="button" className="btn btn--ghost btn--small" onClick={() => setExcluded([])}>
                    Clear filter
                  </button>
                ) : null}
              </div>
            </details>
            {hiddenCount > 0 ? (
              <p className="small muted" role="status">
                {plural(hiddenCount, "item")} hidden by your allergen filter.
              </p>
            ) : null}

            {notice ? (
              <p className="order-notice order-notice--warn" role="status">
                <Icon name="info" />
                <span>{notice}</span>
              </p>
            ) : null}

            {CATEGORIES.map((c) => {
              const items = visibleProducts.filter((p) => p.category === c.id);
              if (!items.length) return null;
              return (
                <div key={c.id} className="cat" id={`cat-${c.id}`}>
                  <h3 className="cat__title">{c.label}</h3>
                  <ul className="menu-list">
                    {items.map((p) => {
                      const a = options.availability[p.id];
                      const qty = basket[p.id] ?? 0;
                      const left = a?.remaining ?? 0;
                      const soldOut = !a || a.status === "soldout";
                      return (
                        <li key={p.id} className={`menu-item${soldOut ? " is-soldout" : ""}`}>
                          <div className="menu-item__thumb">
                            <Image src={productImage(p.id)} alt="" width={160} height={160} sizes="80px" className="blob-img blob-img--c" />
                          </div>
                          <div className="menu-item__body">
                            <div className="menu-item__top">
                              <h4 className="menu-item__name">{p.name}</h4>
                              <span className="price">{money(p.price)}</span>
                            </div>
                            <p className="menu-item__desc">{p.description}</p>
                            <p className="menu-item__allergens">
                              <span className="visually-hidden">Allergens: </span>
                              <strong>Contains:</strong> {describeContains(p.contains)}
                              {p.mayContain.length ? (
                                <>
                                  {" "}
                                  · <strong>May contain:</strong> {p.mayContain.map(allergenLabel).join(", ")}
                                </>
                              ) : null}
                            </p>
                            <div className="menu-item__actions">
                              {a ? <AvailabilityChip status={a.status} remaining={left} showCount /> : null}
                              <span className="menu-item__illo" data-illo={p.id} aria-hidden="true">
                                <Illo name={p.illo} />
                              </span>
                              {soldOut ? null : qty === 0 ? (
                                <Button
                                  type="button"
                                  variant="secondary"
                                  className="btn--small menu-item__add"
                                  onClick={() => setQty(p.id, 1)}
                                  aria-label={`Add ${p.name}`}
                                >
                                  <Icon name="plus" size={18} /> Add
                                </Button>
                              ) : (
                                <Stepper
                                  value={qty}
                                  max={left}
                                  label={p.name}
                                  onChange={(v) => setQty(p.id, v)}
                                />
                              )}
                            </div>
                            {qty > 0 && qty >= left ? <p className="menu-item__max">That&apos;s all we have for that day.</p> : null}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </section>
        </div>

        <aside className="order__aside" aria-label="Your basket">
          <div className="order__aside-inner">{panel}</div>
        </aside>
      </div>

      {/* Mobile: sticky bottom bar and a basket sheet */}
      <div className="basket-bar" hidden={count === 0 && !error}>
        <button type="button" className="basket-bar__btn" onClick={openSheet} aria-haspopup="dialog">
          <span className="basket-bar__icon" data-basket-target>
            <Illo name="basket" size={30} />
            <span className="basket-bar__count">{count}</span>
          </span>
          <span className="basket-bar__text">
            {plural(count, "item")} · <span className="price">{money(total)}</span>
          </span>
          <span className="basket-bar__cta">View basket</span>
        </button>
      </div>
      <dialog ref={sheetRef} className="basket-sheet" aria-label="Your basket" onClose={() => setSheetOpen(false)}>
        <div className="basket-sheet__head">
          <span className="basket-sheet__grip" aria-hidden="true" />
          <button type="button" className="basket-sheet__close" onClick={closeSheet}>
            <Icon name="close" />
            <span className="visually-hidden">Close basket</span>
          </button>
        </div>
        {sheetOpen ? panel : null}
      </dialog>
    </div>
  );
}
