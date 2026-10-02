/**
 * In-memory store standing in for the Supabase back end (see supabase/schema.sql).
 *
 * Stock, collection slots and workshop seats are all changed inside `withLock`, keyed per
 * shop-and-day (or per class). That mirrors the row-level locking the database does with
 * `select … for update`, so two customers can never both buy the last loaf.
 */
import { PRODUCTS, getProduct } from "../catalog";
import { addDays, londonNow, toMinutes, weekday, type ISODate, type LondonNow } from "../dates";
import {
  SHOPS,
  SLOT_CAPACITY,
  collectionSlots,
  getShop,
  isShopId,
  unavailableReason,
  type Closure,
  type ShopId,
} from "../shops";
import { WORKSHOP_TYPES, getWorkshopType } from "../workshops";
import type {
  AvailabilityMap,
  AvailabilityStatus,
  BakeRow,
  Booking,
  Enquiry,
  Order,
  OutboxMessage,
  PlaceOrderInput,
  Shortage,
  SlotOption,
  Special,
  Voucher,
  WorkshopSession,
} from "../types";

export const FEW_LEFT = 5;

type StockCell = { planned: number; sold: number; soldOut: boolean };

type DB = {
  stock: Map<string, StockCell>;
  orders: Order[];
  specials: Special[];
  closures: Closure[];
  sessions: WorkshopSession[];
  bookings: Booking[];
  vouchers: Voucher[];
  enquiries: Enquiry[];
  outbox: OutboxMessage[];
};

export class StoreError extends Error {
  constructor(
    message: string,
    public status = 400,
    public field?: string,
    public shortages?: Shortage[],
  ) {
    super(message);
  }
}

/* ---------- locking ---------- */

const locks = new Map<string, Promise<void>>();

/** Run `fn` with exclusive access to `key`. Callers queue in arrival order. */
export async function withLock<T>(key: string, fn: () => T | Promise<T>): Promise<T> {
  const previous = locks.get(key) ?? Promise.resolve();
  let release!: () => void;
  const mine = new Promise<void>((r) => (release = r));
  const tail = previous.then(() => mine);
  locks.set(key, tail);
  await previous;
  try {
    return await fn();
  } finally {
    release();
    if (locks.get(key) === tail) locks.delete(key);
  }
}

/* ---------- seeding ---------- */

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // murmur3 finaliser, so strings that differ by one character land far apart.
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

function rng(seed: string) {
  let n = 0;
  return () => hash(`${seed}:${n++}`);
}

const SHOP_FACTOR: Record<ShopId, number> = { "mill-lane": 1, "harbour-street": 0.75 };
const DAY_FACTOR = [0.9, 1, 0.85, 0.9, 1, 1.1, 1.3];

export function parFor(productId: string, shop: ShopId, date: ISODate): number {
  const p = getProduct(productId);
  if (!p) return 0;
  return Math.max(2, Math.round(p.par * SHOP_FACTOR[shop] * DAY_FACTOR[weekday(date)]));
}

/** How much of each bake has already been reserved in the seeded demo data. Some items are nearly gone. */
const DEMO_DEMAND: Record<string, number> = {
  croissant: 0.93,
  "cardamom-bun": 1.1,
  "almond-croissant": 0.9,
  "seeded-rye": 0.82,
  "country-loaf": 0.55,
  "pain-au-chocolat": 0.6,
};

const NAMES = [
  "Aisha K", "Ben T", "Carys M", "Dev P", "Elin R", "Femi A", "Grace L", "Hamid S", "Isla W", "Jonah B",
  "Kemi O", "Luca F", "Maya D", "Niall C", "Orla H", "Priya N", "Quinn E", "Rosa G", "Sam J", "Tomasz Z",
  "Una V", "Vik R", "Wen L", "Xander P", "Yusuf M", "Zara Q", "Alfie N", "Bea S", "Cal D", "Dora F",
];

function seed(db: DB, now: LondonNow) {
  db.specials = [
    { id: "s1", kind: "today", title: "Pumpkin & sage focaccia", detail: "Roast pumpkin, brown butter, crispy sage", price: "£4.20" },
    { id: "s2", kind: "today", title: "Soup & a slab", detail: "Roast tomato soup with country loaf", price: "£6.50" },
    { id: "s3", kind: "today", title: "Blackberry & bay buns", detail: "While the hedgerows last", price: "£3.40" },
    { id: "s4", kind: "seasonal", title: "Apple & cider cake", detail: "Whole cakes to order, two days' notice" },
    { id: "s5", kind: "seasonal", title: "Plum & custard danish", detail: "Victoria plums, until the end of October" },
  ];

  // A closure a few days out so the date picker's "closed" reasons are visible in the demo.
  db.closures = [
    { id: "c1", shop: "mill-lane", from: addDays(now.date, 3), to: addDays(now.date, 3), reason: "oven service day" },
    { id: "c2", shop: "both", from: "2026-12-25", to: "2026-12-27", reason: "Christmas" },
    { id: "c3", shop: "both", from: "2027-01-01", to: "2027-01-01", reason: "New Year's Day" },
  ];

  // Seed today's and the next two days' pre-orders so availability and the collection list look lived-in.
  for (const shop of SHOPS) {
    for (let offset = 0; offset <= 2; offset++) {
      const date = addDays(now.date, offset);
      if (!shop.hours[weekday(date)] || db.closures.some((c) => (c.shop === shop.id || c.shop === "both") && date >= c.from && date <= c.to)) continue;
      const slots = collectionSlots(shop, date);
      const rand = rng(`${shop.id}|${date}`);
      const pressure = offset === 2 ? 0.45 : 1;
      const demand = new Map<string, number>();
      for (const p of PRODUCTS) {
        const planned = parFor(p.id, shop.id, date);
        const base = DEMO_DEMAND[p.id] ?? 0.15 + rand() * 0.4;
        const frac = Math.min(1, base * pressure * (0.92 + rand() * 0.1));
        demand.set(p.id, Math.round(planned * frac));
      }
      const slotLoad = new Map<string, number>();
      const pickSlot = () => {
        for (let tries = 0; tries < 20; tries++) {
          // Early slots are the busiest.
          const i = Math.min(slots.length - 1, Math.floor(Math.pow(rand(), 1.6) * slots.length));
          if ((slotLoad.get(slots[i]) ?? 0) < SLOT_CAPACITY) return slots[i];
        }
        return undefined;
      };
      let n = 0;
      while ([...demand.values()].some((v) => v > 0)) {
        const slot = pickSlot();
        if (!slot) break;
        const wanted = [...demand.entries()].filter(([, v]) => v > 0);
        const lines: Order["lines"] = [];
        const count = 1 + Math.floor(rand() * 3);
        for (let k = 0; k < count && wanted.length; k++) {
          const [id, left] = wanted.splice(Math.floor(rand() * wanted.length), 1)[0];
          const product = getProduct(id)!;
          const qty = Math.min(left, 1 + Math.floor(rand() * (product.category === "pastries" ? 4 : 2)));
          demand.set(id, left - qty);
          lines.push({ productId: id, name: product.name, qty, price: product.price });
        }
        slotLoad.set(slot, (slotLoad.get(slot) ?? 0) + 1);
        const name = NAMES[Math.floor(rand() * NAMES.length)];
        const phoneTail = String(Math.floor(rand() * 1000)).padStart(3, "0");
        const past = offset === 0 && toMinutes(slot) + 30 <= now.minutes;
        const order: Order = {
          id: seededOrderId(`${shop.id}|${date}|${n++}`),
          shop: shop.id,
          date,
          slot,
          lines,
          total: lines.reduce((s, l) => s + l.qty * l.price, 0),
          customer: {
            name,
            email: `${name.split(" ")[0].toLowerCase()}@example.com`,
            phone: `07700 900${phoneTail}`,
          },
          status: past && rand() > 0.06 ? "collected" : "paid",
          createdAt: new Date(Date.now() - (offset + 1) * 86_400_000 * rand()).toISOString(),
        };
        db.orders.push(order);
        for (const l of lines) {
          const cell = cellFor(db, shop.id, date, l.productId);
          cell.sold += l.qty;
        }
      }
    }
  }

  // Workshop sessions for the next eight weekends.
  let saturday = now.date;
  while (weekday(saturday) !== 6) saturday = addDays(saturday, 1);
  for (let w = 0; w < 8; w++) {
    const sat = addDays(saturday, w * 7);
    const sun = addDays(sat, 1);
    const plan: [string, ISODate, string][] = [["sourdough-basics", sat, "10:00"]];
    if (w % 2 === 0) plan.push(["rye-and-wild-grains", sat, "14:00"]);
    if (w % 2 === 1 || w === 0) plan.push(["croissants-at-home", sun, "09:30"]);
    for (const [typeId, date, start] of plan) {
      const type = getWorkshopType(typeId)!;
      const r = hash(`${typeId}|${date}`);
      const taken = w === 0 ? type.seats - 1 - Math.floor(r * 4) : Math.floor(r * (type.seats + 2) * (w < 3 ? 1 : 0.6));
      db.sessions.push({
        id: `${typeId}-${date}`,
        typeId,
        date,
        start,
        seats: type.seats,
        seatsLeft: Math.max(0, type.seats - Math.min(type.seats, taken)),
      });
    }
  }
  db.sessions.sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));

  db.vouchers.push({
    code: "WILD-GIFT-2026",
    amount: 5000,
    balance: 5000,
    recipient: "Demo recipient",
    from: "Wildroot",
    buyerEmail: "hello@wildroot.example",
    createdAt: new Date().toISOString(),
  });
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function seededOrderId(seedStr: string): string {
  let out = "";
  for (let i = 0; i < 5; i++) out += CODE_ALPHABET[Math.floor(hash(`${seedStr}#${i}`) * CODE_ALPHABET.length) % CODE_ALPHABET.length];
  return `WR-${out}`;
}

/** Unambiguous random code (no 0/O, 1/I). 256 is a multiple of 32, so there is no modulo bias. */
function randomCode(length: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}

function newId(prefix: string): string {
  return `${prefix}-${randomCode(5)}`;
}

/* ---------- the singleton ---------- */

const globalForStore = globalThis as unknown as { __wildroot?: DB };

function emptyDB(): DB {
  return {
    stock: new Map(),
    orders: [],
    specials: [],
    closures: [],
    sessions: [],
    bookings: [],
    vouchers: [],
    enquiries: [],
    outbox: [],
  };
}

export function db(): DB {
  if (!globalForStore.__wildroot) resetStore();
  return globalForStore.__wildroot!;
}

/** Start again from the seeded demo data. Tests pass a fixed "now". */
export function resetStore(now: LondonNow = londonNow()) {
  const fresh = emptyDB();
  seed(fresh, now);
  globalForStore.__wildroot = fresh;
}

function key(shop: ShopId, date: ISODate, productId: string) {
  return `${shop}|${date}|${productId}`;
}

function cellFor(d: DB, shop: ShopId, date: ISODate, productId: string): StockCell {
  const k = key(shop, date, productId);
  let cell = d.stock.get(k);
  if (!cell) {
    cell = { planned: parFor(productId, shop, date), sold: 0, soldOut: false };
    d.stock.set(k, cell);
  }
  return cell;
}

function remainingOf(cell: StockCell): number {
  return cell.soldOut ? 0 : Math.max(0, cell.planned - cell.sold);
}

export function statusFor(remaining: number): AvailabilityStatus {
  if (remaining <= 0) return "soldout";
  if (remaining <= FEW_LEFT) return "few";
  return "plenty";
}

/* ---------- reads ---------- */

export function getClosures(): Closure[] {
  return db().closures;
}

export function availability(shop: ShopId, date: ISODate): AvailabilityMap {
  const d = db();
  const out: AvailabilityMap = {};
  for (const p of PRODUCTS) {
    const remaining = remainingOf(cellFor(d, shop, date, p.id));
    out[p.id] = { remaining, status: statusFor(remaining) };
  }
  return out;
}

export function slotOptions(shop: ShopId, date: ISODate): SlotOption[] {
  const s = getShop(shop)!;
  const d = db();
  return collectionSlots(s, date).map((time) => {
    const taken = d.orders.filter((o) => o.shop === shop && o.date === date && o.slot === time && o.status !== "cancelled").length;
    const left = Math.max(0, SLOT_CAPACITY - taken);
    return { time, available: left > 0, left };
  });
}

/** The next date this shop is taking orders for: normally tomorrow. */
export function nextOrderDate(shop: ShopId, now: LondonNow = londonNow()): ISODate | null {
  const s = getShop(shop)!;
  for (let i = 1; i <= 6; i++) {
    const date = addDays(now.date, i);
    if (!unavailableReason(s, date, now, db().closures)) return date;
  }
  return null;
}

export function getSpecials(): Special[] {
  return db().specials;
}

export function getOrder(id: string): Order | undefined {
  return db().orders.find((o) => o.id === id);
}

/* ---------- ordering ---------- */

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export type PlaceOrderOptions = {
  now?: LondonNow;
  /** Pretend the card was declined, to exercise the stock release path. */
  failPayment?: boolean;
  paymentDelayMs?: number;
};

export async function placeOrder(input: PlaceOrderInput, opts: PlaceOrderOptions = {}): Promise<Order> {
  const d = db();
  const now = opts.now ?? londonNow();
  if (!isShopId(input.shop)) throw new StoreError("Choose a shop to collect from.", 400, "shop");
  const shop = getShop(input.shop)!;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date ?? "")) throw new StoreError("Choose a collection date.", 400, "date");
  const reason = unavailableReason(shop, input.date, now, d.closures);
  if (reason) throw new StoreError(reason, 409, "date");
  if (!collectionSlots(shop, input.date).includes(input.slot)) throw new StoreError("Choose a collection time.", 400, "slot");

  const merged = new Map<string, number>();
  for (const l of input.lines ?? []) {
    if (!getProduct(l.productId)) throw new StoreError("One of those items isn't on the menu any more.", 400, "lines");
    const qty = Math.floor(Number(l.qty));
    if (!Number.isFinite(qty) || qty < 1 || qty > 30) throw new StoreError("Quantities must be between 1 and 30.", 400, "lines");
    merged.set(l.productId, (merged.get(l.productId) ?? 0) + qty);
  }
  if (merged.size === 0) throw new StoreError("Your basket is empty.", 400, "lines");

  const c = input.customer ?? { name: "", email: "", phone: "" };
  const name = String(c.name ?? "").trim();
  const email = String(c.email ?? "").trim();
  const phone = String(c.phone ?? "").trim();
  if (!name) throw new StoreError("Add the name for the order.", 400, "name");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new StoreError("Check the email address.", 400, "email");
  if (phone.replace(/[^\d]/g, "").length < 10) throw new StoreError("Add a mobile number for the text confirmation.", 400, "phone");

  // Reserve stock and the slot atomically.
  const order = await withLock(`${shop.id}|${input.date}`, () => {
    const taken = d.orders.filter((o) => o.shop === shop.id && o.date === input.date && o.slot === input.slot && o.status !== "cancelled").length;
    if (taken >= SLOT_CAPACITY) throw new StoreError("That collection time has just filled up. Please pick another.", 409, "slot");

    const shortages: Shortage[] = [];
    for (const [productId, qty] of merged) {
      const remaining = remainingOf(cellFor(d, shop.id, input.date, productId));
      if (remaining < qty) shortages.push({ productId, name: getProduct(productId)!.name, requested: qty, remaining });
    }
    if (shortages.length) {
      const first = shortages[0];
      const msg =
        first.remaining === 0
          ? `Sorry, ${first.name} has just sold out.`
          : `Sorry, there ${first.remaining === 1 ? "is" : "are"} only ${first.remaining} ${first.name} left.`;
      throw new StoreError(msg, 409, "lines", shortages);
    }
    for (const [productId, qty] of merged) cellFor(d, shop.id, input.date, productId).sold += qty;

    const lines = [...merged].map(([productId, qty]) => {
      const p = getProduct(productId)!;
      return { productId, name: p.name, qty, price: p.price };
    });
    const created: Order = {
      id: newId("WR"),
      shop: shop.id,
      date: input.date,
      slot: input.slot,
      lines,
      total: lines.reduce((s, l) => s + l.qty * l.price, 0),
      customer: { name, email, phone },
      notes: input.notes?.trim().slice(0, 280) || undefined,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    d.orders.push(created);
    return created;
  });

  // Take payment outside the lock (Stripe in production). A failure releases the stock.
  await sleep(opts.paymentDelayMs ?? 250);
  if (opts.failPayment) {
    await withLock(`${shop.id}|${input.date}`, () => {
      for (const l of order.lines) cellFor(d, shop.id, input.date, l.productId).sold -= l.qty;
      order.status = "cancelled";
    });
    throw new StoreError("Your card was declined. Nothing has been charged.", 402);
  }
  order.status = "paid";
  notifyOrder(order);
  return order;
}

function money(p: number) {
  return `£${(p / 100).toFixed(2)}`;
}

function notifyOrder(o: Order) {
  const shop = getShop(o.shop)!;
  const items = o.lines.map((l) => `${l.qty} × ${l.name}`).join(", ");
  send({
    channel: "email",
    to: o.customer.email,
    subject: `Your Wildroot order ${o.id}`,
    body: `Hi ${o.customer.name}, thanks for your order. Collect from ${shop.name}, ${o.date} at ${o.slot}. ${items}. Paid ${money(o.total)}.`,
  });
  send({
    channel: "sms",
    to: o.customer.phone,
    body: `Wildroot: order ${o.id} is confirmed. Collect ${o.date} ${o.slot} at ${shop.short}. Show this text at the counter.`,
  });
}

function send(m: Omit<OutboxMessage, "at">) {
  const msg = { ...m, at: new Date().toISOString() };
  db().outbox.push(msg);
  if (process.env.NODE_ENV !== "test") console.log(`[outbox:${m.channel}] → ${m.to}: ${m.subject ?? m.body.slice(0, 60)}`);
}

/* ---------- staff ---------- */

export function bakePlan(shop: ShopId, date: ISODate): BakeRow[] {
  const d = db();
  return PRODUCTS.map((p) => {
    const cell = cellFor(d, shop, date, p.id);
    return {
      productId: p.id,
      planned: cell.planned,
      sold: cell.sold,
      remaining: remainingOf(cell),
      soldOut: cell.soldOut,
      par: parFor(p.id, shop, date),
    };
  });
}

export async function updateBake(
  shop: ShopId,
  date: ISODate,
  productId: string,
  change: { planned?: number; soldOut?: boolean },
): Promise<BakeRow> {
  if (!getProduct(productId)) throw new StoreError("Unknown product", 404);
  return withLock(`${shop}|${date}`, () => {
    const d = db();
    const cell = cellFor(d, shop, date, productId);
    if (change.planned !== undefined) {
      const planned = Math.floor(Number(change.planned));
      if (!Number.isFinite(planned) || planned < 0 || planned > 999) throw new StoreError("Quantity must be 0–999");
      // Never plan fewer than customers have already paid for.
      cell.planned = Math.max(planned, cell.sold);
    }
    if (change.soldOut !== undefined) cell.soldOut = Boolean(change.soldOut);
    return bakePlan(shop, date).find((r) => r.productId === productId)!;
  });
}

export async function resetBakeToPar(shop: ShopId, date: ISODate): Promise<BakeRow[]> {
  return withLock(`${shop}|${date}`, () => {
    const d = db();
    for (const p of PRODUCTS) {
      const cell = cellFor(d, shop, date, p.id);
      cell.planned = Math.max(parFor(p.id, shop, date), cell.sold);
      cell.soldOut = false;
    }
    return bakePlan(shop, date);
  });
}

export function ordersFor(shop: ShopId, date: ISODate): Order[] {
  return db()
    .orders.filter((o) => o.shop === shop && o.date === date && (o.status === "paid" || o.status === "collected"))
    .sort((a, b) => a.slot.localeCompare(b.slot) || a.customer.name.localeCompare(b.customer.name));
}

export function setCollected(id: string, collected: boolean): Order {
  const o = getOrder(id);
  if (!o || (o.status !== "paid" && o.status !== "collected")) throw new StoreError("Order not found", 404);
  o.status = collected ? "collected" : "paid";
  o.collectedAt = collected ? new Date().toISOString() : undefined;
  return o;
}

export function saveSpecials(list: Special[]): Special[] {
  const clean = list
    .filter((s) => s && typeof s.title === "string" && s.title.trim())
    .slice(0, 12)
    .map((s, i) => ({
      id: s.id || `s${Date.now()}${i}`,
      kind: s.kind === "seasonal" ? ("seasonal" as const) : ("today" as const),
      title: s.title.trim().slice(0, 60),
      detail: s.detail?.trim().slice(0, 90) || undefined,
      price: s.price?.trim().slice(0, 12) || undefined,
    }));
  db().specials = clean;
  return clean;
}

export function addClosure(c: Omit<Closure, "id">): Closure {
  if (c.shop !== "both" && !isShopId(c.shop)) throw new StoreError("Choose a shop", 400, "shop");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(c.from) || !/^\d{4}-\d{2}-\d{2}$/.test(c.to || c.from)) throw new StoreError("Choose the dates", 400, "from");
  const to = c.to && c.to >= c.from ? c.to : c.from;
  const reason = String(c.reason ?? "").trim().slice(0, 60) || "holiday";
  const closure: Closure = { id: `c${Date.now()}`, shop: c.shop, from: c.from, to, reason };
  db().closures.push(closure);
  db().closures.sort((a, b) => a.from.localeCompare(b.from));
  return closure;
}

export function removeClosure(id: string) {
  const d = db();
  d.closures = d.closures.filter((c) => c.id !== id);
}

/** Paid orders already booked into a closed period, so staff can contact those customers. */
export function ordersAffectedBy(c: Closure): Order[] {
  return db().orders.filter(
    (o) => (c.shop === "both" || o.shop === c.shop) && o.date >= c.from && o.date <= c.to && o.status === "paid",
  );
}

/* ---------- workshops and vouchers ---------- */

export function listSessions(now: LondonNow = londonNow()): WorkshopSession[] {
  return db().sessions.filter((s) => s.date > now.date);
}

export function checkVoucher(code: string): Voucher | undefined {
  const c = code.trim().toUpperCase();
  return db().vouchers.find((v) => v.code === c);
}

export async function bookWorkshop(input: {
  sessionId: string;
  seats: number;
  name: string;
  email: string;
  voucher?: string;
}): Promise<{ booking: Booking; session: WorkshopSession }> {
  const d = db();
  const session = d.sessions.find((s) => s.id === input.sessionId);
  if (!session) throw new StoreError("That class date isn't available.", 404, "sessionId");
  const type = getWorkshopType(session.typeId)!;
  const seats = Math.floor(Number(input.seats));
  if (!Number.isFinite(seats) || seats < 1 || seats > 4) throw new StoreError("Book between 1 and 4 seats.", 400, "seats");
  const name = String(input.name ?? "").trim();
  const email = String(input.email ?? "").trim();
  if (!name) throw new StoreError("Add your name.", 400, "name");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new StoreError("Check the email address.", 400, "email");

  return withLock(`workshop|${session.id}`, async () => {
    if (session.seatsLeft < seats) {
      throw new StoreError(
        session.seatsLeft === 0 ? "Sorry, that class is now full." : `Only ${session.seatsLeft} seat${session.seatsLeft === 1 ? "" : "s"} left.`,
        409,
        "seats",
      );
    }
    const total = type.price * seats;
    let voucherApplied = 0;
    if (input.voucher?.trim()) {
      const v = checkVoucher(input.voucher);
      if (!v) throw new StoreError("We don't recognise that voucher code.", 400, "voucher");
      if (v.balance <= 0) throw new StoreError("That voucher has already been used.", 400, "voucher");
      voucherApplied = Math.min(v.balance, total);
      v.balance -= voucherApplied;
    }
    session.seatsLeft -= seats;
    const booking: Booking = {
      id: newId("WK"),
      sessionId: session.id,
      seats,
      name,
      email,
      total,
      voucherApplied,
      paid: total - voucherApplied,
      createdAt: new Date().toISOString(),
    };
    d.bookings.push(booking);
    send({
      channel: "email",
      to: email,
      subject: `You're booked: ${type.title}`,
      body: `See you on ${session.date} at ${session.start}. Booking ${booking.id}, ${seats} seat(s).`,
    });
    return { booking, session };
  });
}

export function buyVoucher(input: { amount: number; recipient: string; from: string; message?: string; email: string }): Voucher {
  const amount = Math.floor(Number(input.amount));
  if (!Number.isFinite(amount) || amount < 1000 || amount > 50000) throw new StoreError("Choose a voucher amount.", 400, "amount");
  const recipient = String(input.recipient ?? "").trim();
  const from = String(input.from ?? "").trim();
  const email = String(input.email ?? "").trim();
  if (!recipient) throw new StoreError("Who is the voucher for?", 400, "recipient");
  if (!from) throw new StoreError("Add who it's from.", 400, "from");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new StoreError("Check the email address.", 400, "email");
  const d = db();
  const code = `WILD-${randomCode(4)}-${randomCode(4)}`;
  const v: Voucher = {
    code,
    amount,
    balance: amount,
    recipient: recipient.slice(0, 60),
    from: from.slice(0, 60),
    message: input.message?.trim().slice(0, 200) || undefined,
    buyerEmail: email,
    createdAt: new Date().toISOString(),
  };
  d.vouchers.push(v);
  send({ channel: "email", to: email, subject: "Your Wildroot gift voucher", body: `Code ${code} for ${money(amount)}.` });
  return v;
}

/* ---------- enquiries ---------- */

export function addEnquiry(kind: Enquiry["kind"], fields: Record<string, string>): Enquiry {
  const d = db();
  const e: Enquiry = { id: newId(kind === "wholesale" ? "TR" : "CT"), kind, fields, createdAt: new Date().toISOString() };
  d.enquiries.push(e);
  send({ channel: "email", to: "hello@wildroot.example", subject: `New ${kind} enquiry ${e.id}`, body: JSON.stringify(fields) });
  return e;
}

export { WORKSHOP_TYPES };
