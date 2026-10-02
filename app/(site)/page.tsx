import Link from "next/link";
import { connection } from "next/server";
import { Chalkboard } from "@/components/Chalkboard";
import { BakeRow } from "@/components/home/BakeRow";
import { InstagramStrip } from "@/components/home/InstagramStrip";
import { Doodle, Illo } from "@/components/illustrations";
import { Blob, BlobImage, Mark, MorphBlob, Note, Wave } from "@/components/shapes";
import { ShopMap } from "@/components/ShopMap";
import { ButtonLink, SectionHeading } from "@/components/ui";
import { POPULAR } from "@/lib/catalog";
import { addDays, dayName, formatDate, formatTime, londonNow } from "@/lib/dates";
import { money, plural } from "@/lib/format";
import { SHOPS, hoursTable, openStatus } from "@/lib/shops";
import { availability, getClosures, getSpecials, listSessions, nextOrderDate } from "@/lib/server/store";
import { getWorkshopType } from "@/lib/workshops";

export default async function Home() {
  await connection();
  const now = londonNow();
  const tomorrow = addDays(now.date, 1);
  const closures = getClosures();

  const bakes = SHOPS.map((shop) => {
    const date = nextOrderDate(shop.id, now);
    return {
      shop: shop.id,
      name: shop.short,
      date,
      label: date === tomorrow ? "tomorrow" : date ? dayName(date) : "",
      availability: date ? availability(shop.id, date) : null,
    };
  });

  const sessions = listSessions(now)
    .filter((s) => s.seatsLeft > 0)
    .slice(0, 3);

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="container hero__grid">
          <div className="hero__media">
            <MorphBlob className="hero__blob deco--lg" />
            <Blob shape="c" className="hero__blob-sm deco--md" color="var(--sage-tint)" />
            <BlobImage
              src="/photos/hero-loaves.webp"
              alt="Three fresh sourdough loaves and a baguette on a floured wooden bench"
              shape="b"
              width={1400}
              height={1200}
              sizes="(min-width: 1024px) 620px, (min-width: 700px) 46vw, 92vw"
              priority
              className="hero__img"
            />
            <Illo name="wheat" className="hero__wheat deco--lg sway" />
          </div>

          <div className="hero__copy">
            <Note className="hero__kicker">Sourdough bakery &amp; café in Ashcombe</Note>
            <h1 id="hero-title">
              Slow bread for <Mark>busy mornings.</Mark>
            </h1>
            <p className="lead">
              Reserve tomorrow&apos;s loaves, pastries and coffee tonight, then pick them up on your way past either of our
              shops. No queue, no sold-out sign.
            </p>
            <div className="hero__actions">
              <ButtonLink href="/order">Order for tomorrow</ButtonLink>
              <ButtonLink href="/menu" variant="secondary" arrow={false}>
                See the menu
              </ButtonLink>
            </div>
            <div className="hero__note">
              <Doodle name="arrowCurl" className="hero__note-arrow" />
              <Note>Order by 8pm, collect from 7:30am</Note>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Tomorrow's bake ---------- */}
      <section className="section section--bake" aria-labelledby="bake-title">
        <div className="container">
          <div className="bake-head">
            <SectionHeading
              id="bake-title"
              kicker="Fresh out at 5am"
              title={
                <>
                  What&apos;s in the oven <Mark kind="circle">tomorrow</Mark>
                </>
              }
              intro="Our six most-loved bakes. Numbers update live as neighbours order, so if something's nearly gone, it really is."
            />
            <ButtonLink href="/order" variant="ghost" className="bake-head__all">
              Everything we bake
            </ButtonLink>
          </div>
          <BakeRow initial={bakes} products={POPULAR} />
        </div>
      </section>

      {/* ---------- Chalkboard ---------- */}
      <section className="section section--board bg-oat" aria-labelledby="board-title">
        <Wave color="var(--oat)" />
        <div className="container board-grid">
          <div className="board-copy">
            <SectionHeading
              id="board-title"
              kicker="Written up at 6am"
              title="Specials and seasonal bakes"
              intro="Whatever the farm drops off and the bakers feel like making. Specials are in the shops only, and they go fast."
            />
            <Illo name="sprig" className="board-copy__illo deco--md sway" />
          </div>
          <Chalkboard specials={getSpecials()} />
        </div>
        <Wave color="var(--oat)" position="bottom" variant="b" />
      </section>

      {/* ---------- Process ---------- */}
      <section className="section section--process" aria-labelledby="process-title">
        <Blob shape="d" className="process__blob" color="var(--butter)" />
        <div className="container">
          <SectionHeading
            id="process-title"
            kicker="Why it tastes like that"
            title="Two days of patience in every loaf"
            align="center"
          />
          <ol className="process">
            <li className="process__step">
              <Illo name="jar" className="process__illo" />
              <h3>48-hour ferment</h3>
              <p>
                Our starter, Doris, is eleven years old. Every loaf spends two slow days in the cool room, which is where
                the flavour and the easy digestion come from.
              </p>
            </li>
            <li className="process__step">
              <Illo name="oven" className="process__illo" />
              <h3>Stone-baked</h3>
              <p>
                Loaves go straight onto the stone floor of the oven at 250°C. That&apos;s what gives the crust its crackle
                and the deep, blistered colour.
              </p>
            </li>
            <li className="process__step">
              <Illo name="wheat" className="process__illo sway" />
              <h3>Baked daily</h3>
              <p>
                The first tray comes out at 5am, every day we&apos;re open. Anything left at closing goes to the Ashcombe
                community fridge.
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* ---------- Workshops ---------- */}
      <section className="section section--workshops bg-sage" aria-labelledby="workshops-title">
        <Wave color="var(--sage-tint)" variant="b" />
        <div className="container workshops-grid">
          <div className="workshops-copy">
            <SectionHeading
              id="workshops-title"
              kicker="Weekend classes"
              title="Learn to bake it yourself"
              intro="Small classes around the big bench, with lunch, coffee and far too much bread to carry home. Gift vouchers too."
            />
            <div className="workshops-copy__media deco--md">
              <BlobImage
                src="/photos/workshop-hands.webp"
                alt="Floury hands kneading a ball of dough on the bench"
                shape="d"
                width={1200}
                height={900}
                sizes="(min-width: 1024px) 420px, 40vw"
              />
            </div>
          </div>
          <ul className="class-list">
            {sessions.map((s) => {
              const type = getWorkshopType(s.typeId)!;
              return (
                <li key={s.id} className="class-card">
                  <div className="class-card__date" aria-hidden="true">
                    <span className="class-card__day">{dayName(s.date, true)}</span>
                    <span className="class-card__num">{Number(s.date.slice(8))}</span>
                    <span className="class-card__mon">{formatDate(s.date).split(" ")[2]}</span>
                  </div>
                  <div className="class-card__body">
                    <h3>
                      <Link href={`/workshops#${s.id}`} className="class-card__link">
                        {type.title}
                      </Link>
                    </h3>
                    <p className="class-card__when">
                      {formatDate(s.date, "long")}, {formatTime(s.start)} · {type.duration}
                    </p>
                    <p className="class-card__meta">
                      <span className="price">{money(type.price)}</span>
                      <span className={`chip ${s.seatsLeft <= 2 ? "chip--few" : ""}`}>
                        <span className="chip__dot" aria-hidden="true" />
                        {s.seatsLeft === 1 ? "Last seat" : `${plural(s.seatsLeft, "seat")} left`}
                      </span>
                    </p>
                  </div>
                  <Illo name={type.illo} className="class-card__illo" />
                </li>
              );
            })}
            <li className="class-list__more">
              <ButtonLink href="/workshops" variant="secondary">
                All classes &amp; gift vouchers
              </ButtonLink>
            </li>
          </ul>
        </div>
        <Wave color="var(--sage-tint)" position="bottom" />
      </section>

      {/* ---------- Shops ---------- */}
      <section className="section section--shops" aria-labelledby="shops-title">
        <div className="container">
          <SectionHeading id="shops-title" kicker="Come and say hello" title="Two shops, one oven" align="center" />
          <div className="shops-grid">
            {SHOPS.map((shop, i) => {
              const status = openStatus(shop, now, closures);
              return (
                <article key={shop.id} className={`shop-card shop-card--${i}`}>
                  <div className="shop-card__media">
                    <BlobImage src={shop.photo} alt={shop.photoAlt} shape={i === 0 ? "a" : "c"} width={1200} height={900} sizes="(min-width: 1024px) 380px, (min-width: 700px) 44vw, 92vw" />
                  </div>
                  <h3>{shop.short}</h3>
                  <p className={`shop-card__status ${status.open ? "is-open" : ""}`}>
                    <span className="chip__dot" aria-hidden="true" /> {status.text}
                  </p>
                  <address>{shop.address.join(", ")}</address>
                  <dl className="hours-list">
                    {hoursTable(shop).map(([d, t]) => (
                      <div key={d}>
                        <dt>{d}</dt>
                        <dd>{t}</dd>
                      </div>
                    ))}
                  </dl>
                  <Link href={`/order?shop=${shop.id}`} className="shop-card__order">
                    Order for collection here
                  </Link>
                </article>
              );
            })}
            <figure className="shops-map">
              <ShopMap />
              <figcaption className="note">Ten minutes&apos; walk apart, along the river</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ---------- Instagram ---------- */}
      <section className="section section--insta" aria-labelledby="insta-title">
        <div className="container">
          <div className="insta-head">
            <h2 id="insta-title">From the bench</h2>
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="insta-head__handle">
              @wildroot.bakery
            </a>
          </div>
          <InstagramStrip />
        </div>
      </section>
    </>
  );
}

