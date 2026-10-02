import type { Metadata } from "next";
import { connection } from "next/server";
import { Illo } from "@/components/illustrations";
import { PageHeader } from "@/components/PageHeader";
import { BlobImage, Note, Wave } from "@/components/shapes";
import { SectionHeading } from "@/components/ui";
import { VoucherForm } from "@/components/workshops/VoucherForm";
import { WorkshopBooking } from "@/components/workshops/WorkshopBooking";
import { money } from "@/lib/format";
import { getShop } from "@/lib/shops";
import { listSessions } from "@/lib/server/store";
import { WORKSHOP_TYPES } from "@/lib/workshops";
import "../../pages.css";

export const metadata: Metadata = {
  title: "Workshops & gift vouchers",
  description: "Weekend sourdough, croissant and rye classes in Ashcombe, plus gift vouchers.",
};

export default async function WorkshopsPage() {
  await connection();
  const sessions = listSessions();

  return (
    <>
      <PageHeader
        kicker="Flour on your jumper guaranteed"
        title="Weekend workshops"
        intro="Small classes of six to eight, around the big bench where we bake every morning. Lunch, coffee and your own bread to take home."
        illo="hands"
        blob="c"
        blobColor="var(--sage-tint)"
      />

      <section className="container types" aria-label="Our classes">
        <ul className="type-grid">
          {WORKSHOP_TYPES.map((t, i) => (
            <li key={t.id} className={`type-card type-card--${i}`}>
              <Illo name={t.illo} className="type-card__illo sway" />
              <h2 className="type-card__title">{t.title}</h2>
              <p>{t.summary}</p>
              <ul className="type-card__details">
                {t.details.map((d) => (
                  <li key={d}>{d}</li>
                ))}
                <li>At {getShop(t.shop)!.short}</li>
              </ul>
              <p className="type-card__price">
                <span className="price">{money(t.price)}</span> <span className="muted small">per person, up to {t.seats} per class</span>
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="section" aria-labelledby="dates-title">
        <div className="container">
          <SectionHeading id="dates-title" kicker="Seats update live" title="Upcoming dates" intro="Pick a date to book. You can pay with a gift voucher, or part voucher and part card." />
          <WorkshopBooking initial={sessions} />
        </div>
      </section>

      <section className="section bg-butter section--vouchers" aria-labelledby="gift-title" id="vouchers">
        <Wave color="var(--butter)" />
        <div className="container voucher-grid">
          <div>
            <SectionHeading
              id="gift-title"
              kicker="The present that smells nice"
              title="Gift vouchers"
              intro="Good for classes, loaves and coffee at both shops, for twelve months. We email you a code straight away."
            />
            <div className="voucher-grid__media deco--md">
              <BlobImage src="/photos/insta/coffee.webp" alt="A flat white and a cardamom knot on the counter" shape="a" width={600} height={600} sizes="320px" />
              <Note className="voucher-grid__note">Perfect for the one who&apos;s always talking about starters</Note>
            </div>
          </div>
          <div className="card">
            <VoucherForm />
          </div>
        </div>
        <Wave color="var(--butter)" position="bottom" variant="b" />
      </section>

      <section className="section container--narrow faq" aria-labelledby="faq-title">
        <h2 id="faq-title">Good to know</h2>
        <details>
          <summary>Do I need any experience?</summary>
          <p>Not for Sourdough Basics or Rye &amp; Wild Grains. Croissants at Home moves quickly, so it helps if you&apos;ve baked a bread or two.</p>
        </details>
        <details>
          <summary>What about allergies and dietary needs?</summary>
          <p>Let us know when you book and we&apos;ll plan lunch around you. The classes themselves use wheat, rye, butter and eggs.</p>
        </details>
        <details>
          <summary>Can I cancel or move my place?</summary>
          <p>Move or cancel up to seven days before for a full refund or voucher. After that we&apos;ll happily take a friend in your place.</p>
        </details>
        <details>
          <summary>Private classes?</summary>
          <p>We run private sessions for up to eight on weekday evenings. Drop us a line through the contact page.</p>
        </details>
      </section>
    </>
  );
}
