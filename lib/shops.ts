import { addDays, dayName, fromMinutes, toMinutes, weekday, type ISODate, type LondonNow } from "./dates";

export type ShopId = "mill-lane" | "harbour-street";

type Hours = { open: string; close: string } | null;

export type Shop = {
  id: ShopId;
  name: string;
  short: string;
  address: string[];
  phone: string;
  blurb: string;
  /** Index 0 = Sunday. null = closed all day. */
  hours: [Hours, Hours, Hours, Hours, Hours, Hours, Hours];
  /** Last collection slot starts 30 minutes before this. */
  collectUntil: string;
  /** Position on the illustrated map, 0–100. */
  map: { x: number; y: number };
  photo: string;
  photoAlt: string;
};

export const SHOPS: Shop[] = [
  {
    id: "mill-lane",
    name: "Wildroot Mill Lane",
    short: "Mill Lane",
    address: ["14 Mill Lane", "Ashcombe", "AS3 4MG"],
    phone: "0117 496 0412",
    blurb: "Where it started: the bakery, the big oven and six seats by the window.",
    hours: [
      { open: "08:00", close: "13:00" },
      null,
      { open: "07:30", close: "15:00" },
      { open: "07:30", close: "15:00" },
      { open: "07:30", close: "15:00" },
      { open: "07:30", close: "15:00" },
      { open: "07:30", close: "15:00" },
    ],
    collectUntil: "12:00",
    map: { x: 30, y: 42 },
    photo: "/photos/shop-mill-lane.webp",
    photoAlt: "The green shopfront at Mill Lane with bread stacked in the window and a chalkboard on the pavement",
  },
  {
    id: "harbour-street",
    name: "Wildroot Harbour Street",
    short: "Harbour Street",
    address: ["3 Harbour Street", "Ashcombe", "AS1 7HB"],
    phone: "0117 496 0785",
    blurb: "Our café by the water, with the long table, proper coffee and room for prams.",
    hours: [
      null,
      { open: "07:30", close: "16:00" },
      { open: "07:30", close: "16:00" },
      { open: "07:30", close: "16:00" },
      { open: "07:30", close: "16:00" },
      { open: "07:30", close: "16:00" },
      { open: "08:00", close: "16:00" },
    ],
    collectUntil: "12:30",
    map: { x: 72, y: 64 },
    photo: "/photos/shop-harbour-street.webp",
    photoAlt: "Inside the Harbour Street café: a long wooden table, pendant lights and loaves on shelves behind the counter",
  },
];

export function getShop(id: string): Shop | undefined {
  return SHOPS.find((s) => s.id === id);
}

export function isShopId(id: unknown): id is ShopId {
  return id === "mill-lane" || id === "harbour-street";
}

export type Closure = { id: string; shop: ShopId | "both"; from: ISODate; to: ISODate; reason: string };

/** Orders for a date close at 8pm the evening before (UK time). */
export const CUTOFF = "20:00";
/** Customers can order from tomorrow up to this many days ahead. */
export const MAX_DAYS_AHEAD = 6;
export const SLOT_MINUTES = 30;
export const SLOT_CAPACITY = 12;

export function closureFor(shop: ShopId, date: ISODate, closures: Closure[]): Closure | undefined {
  return closures.find((c) => (c.shop === shop || c.shop === "both") && date >= c.from && date <= c.to);
}

export type DateOption = { date: ISODate; available: boolean; reason?: string };

/** Why a shop can't take collection orders on a date, or undefined if it can. */
export function unavailableReason(shop: Shop, date: ISODate, now: LondonNow, closures: Closure[]): string | undefined {
  const tomorrow = addDays(now.date, 1);
  if (date <= now.date) return "Same-day orders aren't possible. Pop in and see what's left.";
  if (date > addDays(now.date, MAX_DAYS_AHEAD)) return `We take orders up to ${MAX_DAYS_AHEAD} days ahead.`;
  if (date === tomorrow && now.minutes >= toMinutes(CUTOFF)) {
    return "Orders for tomorrow closed at 8pm. The shop opens with plenty on the shelves, first come first served.";
  }
  const closure = closureFor(shop.id, date, closures);
  if (closure) return `${shop.short} is closed: ${closure.reason}.`;
  if (!shop.hours[weekday(date)]) return `${shop.short} is closed on ${dayName(date)}s.`;
  return undefined;
}

export function dateOptions(shop: Shop, now: LondonNow, closures: Closure[]): DateOption[] {
  return Array.from({ length: MAX_DAYS_AHEAD }, (_, i) => {
    const date = addDays(now.date, i + 1);
    const reason = unavailableReason(shop, date, now, closures);
    return { date, available: !reason, reason };
  });
}

/** 30-minute collection slots from opening until the collection cut-off. */
export function collectionSlots(shop: Shop, date: ISODate): string[] {
  const hours = shop.hours[weekday(date)];
  if (!hours) return [];
  const start = toMinutes(hours.open);
  const end = Math.min(toMinutes(shop.collectUntil), toMinutes(hours.close));
  const slots: string[] = [];
  for (let t = start; t + SLOT_MINUTES <= end; t += SLOT_MINUTES) slots.push(fromMinutes(t));
  return slots;
}

/** "Open now until 3pm", "Closed today, opens Tue 7:30am" and so on, for a shop card. */
export function openStatus(shop: Shop, now: LondonNow, closures: Closure[]): { open: boolean; text: string } {
  const today = shop.hours[weekday(now.date)];
  const closedToday = closureFor(shop.id, now.date, closures);
  if (today && !closedToday) {
    const o = toMinutes(today.open);
    const c = toMinutes(today.close);
    if (now.minutes >= o && now.minutes < c) return { open: true, text: `Open now until ${fmt(today.close)}` };
    if (now.minutes < o) return { open: false, text: `Opens today at ${fmt(today.open)}` };
  }
  for (let i = 1; i <= 14; i++) {
    const d = addDays(now.date, i);
    const h = shop.hours[weekday(d)];
    if (h && !closureFor(shop.id, d, closures)) {
      return { open: false, text: `Closed now. Opens ${i === 1 ? "tomorrow" : dayName(d)} at ${fmt(h.open)}` };
    }
  }
  return { open: false, text: "Closed" };
}

function fmt(hhmm: string) {
  const m = toMinutes(hhmm);
  const h = Math.floor(m / 60);
  const mm = m % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}${mm ? `:${String(mm).padStart(2, "0")}` : ""}${h >= 12 ? "pm" : "am"}`;
}

/** Opening hours grouped for display: [["Tue–Sat", "7:30am–3pm"], ["Sun", "8am–1pm"], ["Mon", "Closed"]]. */
export function hoursTable(shop: Shop): [string, string][] {
  const order = [1, 2, 3, 4, 5, 6, 0];
  const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const label = (h: Hours) => (h ? `${fmt(h.open)}–${fmt(h.close)}` : "Closed");
  const rows: { days: number[]; text: string }[] = [];
  for (const d of order) {
    const text = label(shop.hours[d]);
    const last = rows[rows.length - 1];
    if (last && last.text === text) last.days.push(d);
    else rows.push({ days: [d], text });
  }
  return rows.map((r) => [
    r.days.length > 1 ? `${names[r.days[0]]}–${names[r.days[r.days.length - 1]]}` : names[r.days[0]],
    r.text,
  ]);
}
