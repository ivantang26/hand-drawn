import { londonNow, type LondonNow } from "../dates";
import { dateOptions, getShop, type ShopId } from "../shops";
import type { OrderOptions } from "../types";
import { availability, getClosures, slotOptions } from "./store";

/** Everything the order page needs for one shop and (optionally) a requested date. */
export function orderOptions(shop: ShopId, requested?: string | null, now: LondonNow = londonNow()): OrderOptions {
  const dates = dateOptions(getShop(shop)!, now, getClosures());
  const pick = dates.find((d) => d.date === requested && d.available) ?? dates.find((d) => d.available);
  const date = pick?.date ?? null;
  return {
    shop,
    dates,
    date,
    slots: date ? slotOptions(shop, date) : [],
    availability: date ? availability(shop, date) : {},
    now,
  };
}
