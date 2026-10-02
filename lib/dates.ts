/** Date helpers. Every business rule runs on UK time, whatever the server or phone thinks. */
export const TZ = "Europe/London";

/** A calendar date, "YYYY-MM-DD". */
export type ISODate = string;

export type LondonNow = { date: ISODate; minutes: number };

export function londonNow(at: Date = new Date()): LondonNow {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(at);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

function toUTC(date: ISODate): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function addDays(date: ISODate, n: number): ISODate {
  const t = toUTC(date);
  t.setUTCDate(t.getUTCDate() + n);
  return t.toISOString().slice(0, 10);
}

/** 0 = Sunday … 6 = Saturday. */
export function weekday(date: ISODate): number {
  return toUTC(date).getUTCDay();
}

export function daysBetween(from: ISODate, to: ISODate): number {
  return Math.round((toUTC(to).getTime() - toUTC(from).getTime()) / 86_400_000);
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function dayName(date: ISODate, short = false): string {
  const name = DAY_NAMES[weekday(date)];
  return short ? name.slice(0, 3) : name;
}

/** "Wed 30 Sep" or "Wednesday 30 September". */
export function formatDate(date: ISODate, style: "short" | "long" = "short"): string {
  const t = toUTC(date);
  const d = t.getUTCDate();
  return style === "long"
    ? `${dayName(date)} ${d} ${MONTHS_LONG[t.getUTCMonth()]}`
    : `${dayName(date, true)} ${d} ${MONTHS[t.getUTCMonth()]}`;
}

/** "Tomorrow", "Today" or the short date. */
export function relativeDay(date: ISODate, today: ISODate): string {
  const diff = daysBetween(today, date);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return formatDate(date);
}

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function fromMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** "07:30" → "7:30am", "12:00" → "12pm". */
export function formatTime(hhmm: string): string {
  const mins = toMinutes(hhmm);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12}${suffix}` : `${h12}:${String(m).padStart(2, "0")}${suffix}`;
}
