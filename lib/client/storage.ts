/** localStorage helpers that never throw (private mode, blocked storage). Per-device conveniences only. */
export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown) {
  try {
    if (value === undefined || value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: the page still works, it just won't remember */
  }
}

export const KEYS = {
  shop: "wildroot:shop",
  basket: "wildroot:basket",
  customer: "wildroot:customer",
  slot: "wildroot:slot",
  allergens: "wildroot:allergens",
} as const;
