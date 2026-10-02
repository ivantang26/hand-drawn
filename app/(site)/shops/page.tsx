import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Icon } from "@/components/illustrations";
import { PageHeader } from "@/components/PageHeader";
import { BlobImage, Note } from "@/components/shapes";
import { ShopMap } from "@/components/ShopMap";
import { ButtonLink } from "@/components/ui";
import { formatDate, londonNow } from "@/lib/dates";
import { SHOPS, hoursTable, openStatus } from "@/lib/shops";
import { getClosures } from "@/lib/server/store";
import "../../pages.css";

export const metadata: Metadata = { title: "Our shops", description: "Opening hours and directions for Wildroot Mill Lane and Harbour Street." };

export default async function ShopsPage() {
  await connection();
  const now = londonNow();
  const closures = getClosures().filter((c) => c.to >= now.date);

  return (
    <>
      <PageHeader
        kicker="Ten minutes apart"
        title="Our shops"
        intro="Same bread, same oven, two different moods. Mill Lane is the bakery; Harbour Street is where we sit down."
        illo="pin"
        blob="b"
      />
      <div className="container">
        {SHOPS.map((shop, i) => {
          const status = openStatus(shop, now, closures);
          const upcoming = closures.filter((c) => c.shop === shop.id || c.shop === "both").slice(0, 3);
          return (
            <article key={shop.id} className={`shop-feature${i % 2 ? " shop-feature--flip" : ""}`} aria-labelledby={`shop-${shop.id}`}>
              <div className="shop-feature__media">
                <BlobImage src={shop.photo} alt={shop.photoAlt} shape={i ? "c" : "a"} width={1200} height={900} sizes="(min-width: 1024px) 560px, 92vw" />
              </div>
              <div className="shop-feature__text">
                <h2 id={`shop-${shop.id}`}>{shop.short}</h2>
                <p className="lead">{shop.blurb}</p>
                <p className={`shop-card__status ${status.open ? "is-open" : ""}`}>
                  <span className="chip__dot" aria-hidden="true" /> {status.text}
                </p>
                <div className="shop-feature__cols">
                  <div>
                    <h3 className="mini-title">Find us</h3>
                    <address>
                      {shop.address.map((l) => (
                        <span key={l}>{l}</span>
                      ))}
                    </address>
                    <a href={`tel:${shop.phone.replace(/\s/g, "")}`} className="icon-link">
                      <Icon name="phone" /> {shop.phone}
                    </a>
                  </div>
                  <div>
                    <h3 className="mini-title">Opening hours</h3>
                    <dl className="hours-list">
                      {hoursTable(shop).map(([d, t]) => (
                        <div key={d}>
                          <dt>{d}</dt>
                          <dd>{t}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
                {upcoming.length ? (
                  <div className="closures">
                    <h3 className="mini-title">Coming up</h3>
                    <ul>
                      {upcoming.map((c) => (
                        <li key={c.id}>
                          Closed {c.from === c.to ? formatDate(c.from, "long") : `${formatDate(c.from)} – ${formatDate(c.to)}`}: {c.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <ButtonLink href={`/order?shop=${shop.id}`}>Order for collection here</ButtonLink>
              </div>
            </article>
          );
        })}

        <section className="map-feature" aria-labelledby="map-title">
          <h2 id="map-title">Getting between them</h2>
          <ShopMap />
          <Note>Follow the river path. Bring a loaf for the ducks? Please don&apos;t.</Note>
          <p className="small muted">
            Step-free access at both shops. Harbour Street has a baby-changing room and space for prams. <Link href="/contact">Ask us anything</Link>.
          </p>
        </section>
      </div>
    </>
  );
}
