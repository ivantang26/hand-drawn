"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ALLERGENS, allergenLabel, describeContains, passesAllergenFilter, type AllergenId } from "@/lib/allergens";
import { CATEGORIES, PRODUCTS, productImage } from "@/lib/catalog";
import { KEYS, load, save } from "@/lib/client/storage";
import { money, plural } from "@/lib/format";
import { ButtonLink } from "@/components/ui";

const SHAPES = ["a", "b", "c", "d"] as const;

/** The full menu with an allergen filter and the 14-allergen matrix (FR-7). */
export function MenuBrowser() {
  const [excluded, setExcluded] = useState<AllergenId[]>([]);
  const [veganOnly, setVeganOnly] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setExcluded(load<AllergenId[]>(KEYS.allergens, []));
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) save(KEYS.allergens, excluded);
  }, [excluded, ready]);

  const visible = PRODUCTS.filter((p) => passesAllergenFilter(p, excluded) && (!veganOnly || p.vegan));
  const toggle = (id: AllergenId, on: boolean) => setExcluded((x) => (on ? [...x, id] : x.filter((y) => y !== id)));

  return (
    <div className="menu">
      <aside className="menu__filter" aria-labelledby="filter-title">
        <h2 id="filter-title" className="menu__filter-title">
          Filter by allergen
        </h2>
        <p className="small muted">Tick anything you need to avoid. We hide items that contain it or may contain it.</p>
        <div className="allergen-grid allergen-grid--stack">
          {ALLERGENS.map((a) => (
            <label key={a.id} className="check">
              <input type="checkbox" checked={excluded.includes(a.id)} onChange={(e) => toggle(a.id, e.target.checked)} />
              <span>{a.label}</span>
            </label>
          ))}
        </div>
        <label className="check check--vegan">
          <input type="checkbox" checked={veganOnly} onChange={(e) => setVeganOnly(e.target.checked)} />
          <span>Vegan only</span>
        </label>
        {excluded.length || veganOnly ? (
          <button
            type="button"
            className="btn btn--ghost btn--small"
            onClick={() => {
              setExcluded([]);
              setVeganOnly(false);
            }}
          >
            Clear filters
          </button>
        ) : null}
      </aside>

      <div className="menu__list">
        <p className="menu__count" role="status">
          Showing {plural(visible.length, "item")}
          {excluded.length ? (
            <>
              {" "}
              without <strong>{excluded.map(allergenLabel).join(", ").toLowerCase()}</strong>
            </>
          ) : null}
          {veganOnly ? ", vegan only" : ""}.
        </p>
        {CATEGORIES.map((c) => {
          const items = visible.filter((p) => p.category === c.id);
          return (
            <section key={c.id} className="menu-cat" aria-labelledby={`menu-${c.id}`}>
              <h2 id={`menu-${c.id}`} className="menu-cat__title">
                {c.label}
              </h2>
              {items.length === 0 ? (
                <p className="muted">Nothing in this section matches your filter.</p>
              ) : (
                <ul className="menu-grid">
                  {items.map((p, i) => (
                    <li key={p.id} className="menu-card">
                      <div className="menu-card__media">
                        <Image src={productImage(p.id)} alt="" width={320} height={320} sizes="(min-width: 700px) 140px, 96px" className={`blob-img blob-img--${SHAPES[i % 4]}`} />
                      </div>
                      <div className="menu-card__body">
                        <div className="menu-item__top">
                          <h3 className="menu-card__name">{p.name}</h3>
                          <span className="price">{money(p.price)}</span>
                        </div>
                        <p className="menu-card__desc">{p.description}</p>
                        {p.vegan ? <span className="tag">Vegan</span> : null}
                        <dl className="allergen-dl">
                          <div>
                            <dt>Contains</dt>
                            <dd>{describeContains(p.contains)}</dd>
                          </div>
                          <div>
                            <dt>May contain</dt>
                            <dd>{p.mayContain.length ? p.mayContain.map(allergenLabel).join(", ") : "None declared"}</dd>
                          </div>
                        </dl>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}

        <details className="matrix">
          <summary>
            <span>Full allergen table</span>
            <span className="small muted">All products against all 14 allergens</span>
          </summary>
          <div className="matrix__scroll" tabIndex={0} role="region" aria-label="Allergen table, scrolls sideways">
            <table>
              <caption className="visually-hidden">Allergens in each product. C means contains, M means may contain.</caption>
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  {ALLERGENS.map((a) => (
                    <th key={a.id} scope="col">
                      <span>{a.short}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PRODUCTS.map((p) => (
                  <tr key={p.id}>
                    <th scope="row">{p.name}</th>
                    {ALLERGENS.map((a) => {
                      const c = p.contains.some((x) => x.id === a.id);
                      const m = p.mayContain.includes(a.id);
                      return (
                        <td key={a.id} className={c ? "is-c" : m ? "is-m" : ""}>
                          {c ? "C" : m ? "M" : <span aria-label="No">·</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small muted">C = contains, M = may contain (made in a kitchen that handles it).</p>
        </details>

        <div className="menu__cta">
          <ButtonLink href="/order">Order for collection</ButtonLink>
        </div>
      </div>
    </div>
  );
}
