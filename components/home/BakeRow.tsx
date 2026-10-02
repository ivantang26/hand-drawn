"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AvailabilityChip } from "@/components/ui";
import { Doodle } from "@/components/illustrations";
import { getProduct, productImage } from "@/lib/catalog";
import { KEYS, load, save } from "@/lib/client/storage";
import { formatDate } from "@/lib/dates";
import { money } from "@/lib/format";
import type { ShopId } from "@/lib/shops";
import type { AvailabilityMap, OrderOptions } from "@/lib/types";

type ShopBake = { shop: ShopId; name: string; date: string | null; label: string; availability: AvailabilityMap | null };

const SHAPES = ["a", "b", "c", "d", "b", "a"] as const;

/**
 * "Tomorrow's bake": the six favourites with live availability for either shop.
 * Refreshes every minute so the chips stay honest.
 */
export function BakeRow({ initial, products }: { initial: ShopBake[]; products: string[] }) {
  const [bakes, setBakes] = useState(initial);
  const [active, setActive] = useState<ShopId>(initial[0].shop);

  useEffect(() => {
    const saved = load<ShopId | null>(KEYS.shop, null);
    if (saved === "mill-lane" || saved === "harbour-street") setActive(saved);
  }, []);

  useEffect(() => {
    const refresh = async () => {
      const next = await Promise.all(
        bakes.map(async (b) => {
          if (!b.date) return b;
          try {
            const res = await fetch(`/api/order-options?shop=${b.shop}&date=${b.date}`, { cache: "no-store" });
            if (!res.ok) return b;
            const data: OrderOptions = await res.json();
            return data.date === b.date ? { ...b, availability: data.availability } : b;
          } catch {
            return b;
          }
        }),
      );
      setBakes(next);
    };
    const t = window.setInterval(refresh, 60_000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = bakes.find((b) => b.shop === active) ?? bakes[0];

  const choose = (shop: ShopId) => {
    setActive(shop);
    save(KEYS.shop, shop);
  };

  return (
    <div className="bake">
      <div className="bake__bar">
        <div className="segmented" role="radiogroup" aria-label="Show availability for">
          {bakes.map((b) => (
            <button
              key={b.shop}
              type="button"
              role="radio"
              aria-checked={b.shop === active}
              className="segmented__option"
              onClick={() => choose(b.shop)}
            >
              {b.name}
            </button>
          ))}
        </div>
        <p className="bake__for" aria-live="polite">
          {current.date ? (
            <>
              Availability for <strong>{current.label}</strong>
              {current.label !== "tomorrow" ? ` (${formatDate(current.date)})` : ""}
            </>
          ) : (
            "No collection dates available this week."
          )}
        </p>
      </div>

      <ul className="bake-row" aria-label={`Tomorrow's bake at ${current.name}`}>
        {products.map((id, i) => {
          const p = getProduct(id)!;
          const a = current.availability?.[id];
          const soldOut = !a || a.status === "soldout";
          const href = current.date ? `/order?shop=${current.shop}&date=${current.date}&add=${id}` : "/order";
          return (
            <li key={id} className="product-card">
              <div className="product-card__media">
                <Image
                  src={productImage(id)}
                  alt=""
                  width={400}
                  height={400}
                  sizes="(min-width: 1024px) 190px, (min-width: 700px) 30vw, 70vw"
                  className={`blob-img blob-img--${SHAPES[i % SHAPES.length]}`}
                />
                {p.note ? <span className="product-card__note note" aria-hidden="true">{p.note}</span> : null}
              </div>
              <div className="product-card__body">
                <h3 className="product-card__name">{p.name}</h3>
                <div className="product-card__meta">
                  <span className="price">{money(p.price)}</span>
                  {a ? <AvailabilityChip status={a.status} /> : null}
                </div>
                {soldOut ? (
                  <span className="btn btn--secondary btn--small btn--block" aria-disabled="true">
                    Sold out
                  </span>
                ) : (
                  <Link href={href} className="btn btn--secondary btn--small btn--block" aria-label={`Reserve ${p.name}`}>
                    <span>Reserve</span>
                    <Doodle name="arrow" className="btn__arrow" />
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
