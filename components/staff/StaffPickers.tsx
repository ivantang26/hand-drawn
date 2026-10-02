"use client";

import { addDays, formatDate, relativeDay } from "@/lib/dates";
import { SHOPS, type ShopId } from "@/lib/shops";

/** Shop and date pickers shared by the staff pages. Big targets for floury thumbs. */
export function StaffPickers({
  shop,
  date,
  today,
  onShop,
  onDate,
  from = 0,
  days = 7,
}: {
  shop: ShopId;
  date: string;
  today: string;
  onShop: (s: ShopId) => void;
  onDate: (d: string) => void;
  from?: number;
  days?: number;
}) {
  return (
    <div className="staff-pickers">
      <div className="segmented" role="radiogroup" aria-label="Shop">
        {SHOPS.map((s) => (
          <button key={s.id} type="button" role="radio" aria-checked={shop === s.id} className="segmented__option" onClick={() => onShop(s.id)}>
            {s.short}
          </button>
        ))}
      </div>
      <div className="staff-dates" role="radiogroup" aria-label="Day">
        {Array.from({ length: days }, (_, i) => addDays(today, from + i)).map((d) => (
          <button key={d} type="button" role="radio" aria-checked={date === d} className="staff-dates__option" onClick={() => onDate(d)}>
            <strong>{relativeDay(d, today) === formatDate(d) ? formatDate(d).split(" ")[0] : relativeDay(d, today)}</strong>
            <span>{formatDate(d).split(" ").slice(1).join(" ")}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
