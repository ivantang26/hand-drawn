import type { Metadata } from "next";
import { Illo } from "@/components/illustrations";
import { PageHeader } from "@/components/PageHeader";
import { Blob, BlobImage, Mark, Note, Wave } from "@/components/shapes";
import { ButtonLink } from "@/components/ui";
import "../../pages.css";

export const metadata: Metadata = { title: "Our story", description: "How Wildroot began with one jar of starter and a secondhand oven." };

const TIMELINE = [
  { year: "2014", illo: "jar", text: "Mira feeds a jar of flour and water on her windowsill and names it Doris. Doris is still going." },
  { year: "2016", illo: "bag", text: "Saturday market stall: forty loaves, sold out by ten. Then eighty. Then a queue." },
  { year: "2018", illo: "oven", text: "A secondhand wood-fired oven, a leaky roof and the lease on 14 Mill Lane." },
  { year: "2022", illo: "cup", text: "Harbour Street opens with a long table, proper coffee and room for everyone's prams." },
  { year: "Today", illo: "wheat", text: "Twelve bakers, two shops, flour from a farm eleven miles away, and still the same starter." },
] as const;

export default function StoryPage() {
  return (
    <>
      <PageHeader
        kicker="Est. 2014, on a windowsill"
        title="Our story"
        intro="Wildroot started with one jar of starter and a stubborn idea: that good bread takes time, and that's exactly what makes it worth getting up for."
        illo="jar"
        blob="c"
      />

      <section className="container story-hero">
        <div className="story-hero__media">
          <Blob shape="a" className="story-hero__blob deco--md" color="var(--butter)" />
          <BlobImage src="/photos/story-oven.webp" alt="The wood-fired brick oven at Mill Lane glowing, with a loaf on the peel and more cooling on the bench" shape="arch" width={1200} height={1000} sizes="(min-width: 1024px) 520px, 92vw" />
        </div>
        <div className="story-hero__text">
          <h2>
            Bread that takes <Mark>two days</Mark>, for mornings that take two minutes
          </h2>
          <p>
            Every loaf we sell was mixed the day before yesterday. It rests in the cool room overnight, twice, while wild yeasts
            and bacteria do the slow work that commercial yeast rushes through. That&apos;s where the flavour comes from, the
            chewy open crumb, and why so many people find it easier to digest.
          </p>
          <p>
            We mill some of our own rye and spelt, buy the rest from Upcott Farm, and bake it all on the stone floor of a
            wood-fired oven that took three of us and a borrowed van to move.
          </p>
          <Note>Doris says hello</Note>
        </div>
      </section>

      <section className="section bg-oat" aria-labelledby="timeline-title">
        <Wave color="var(--oat)" />
        <div className="container">
          <h2 id="timeline-title" className="center">
            From windowsill to two shops
          </h2>
          <ol className="timeline">
            {TIMELINE.map((t) => (
              <li key={t.year} className="timeline__item">
                <Illo name={t.illo} className="timeline__illo" />
                <span className="timeline__year">{t.year}</span>
                <p>{t.text}</p>
              </li>
            ))}
          </ol>
        </div>
        <Wave color="var(--oat)" position="bottom" variant="b" />
      </section>

      <section className="section container values" aria-labelledby="values-title">
        <h2 id="values-title" className="center">
          What we care about
        </h2>
        <ul className="values__grid">
          <li>
            <Illo name="sprig" className="sway" />
            <h3>Local grain</h3>
            <p>Most of our flour comes from within 30 miles. We pay a fair price for it, and it tastes of somewhere.</p>
          </li>
          <li>
            <Illo name="basket" />
            <h3>Nothing wasted</h3>
            <p>Pre-orders mean we bake closer to what you want. Anything left goes to the community fridge by 4pm.</p>
          </li>
          <li>
            <Illo name="rollingPin" />
            <h3>Good jobs</h3>
            <p>Bakers start at a real living wage, get paid training and don&apos;t work nights more than three times a week.</p>
          </li>
        </ul>
        <div className="center">
          <ButtonLink href="/workshops">Come and bake with us</ButtonLink>
        </div>
      </section>
    </>
  );
}
