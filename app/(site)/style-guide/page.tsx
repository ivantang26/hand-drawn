import type { Metadata } from "next";
import { Chalkboard } from "@/components/Chalkboard";
import { Doodle, Illo } from "@/components/illustrations";
import { BLOBS, DOODLES, ILLUSTRATION_NAMES, type BlobName, type DoodleName } from "@/components/illustrations/paths";
import { PageHeader } from "@/components/PageHeader";
import { Blob, Mark, Note, Wave } from "@/components/shapes";
import { StepperDemo } from "@/components/StepperDemo";
import { AvailabilityChip, Button, ButtonLink } from "@/components/ui";
import { contrastRatio, formatRatio } from "@/lib/contrast";
import { colours } from "@/lib/tokens";
import "../../pages.css";

export const metadata: Metadata = { title: "Style guide", description: "Wildroot's organic, hand-drawn design system." };

const SWATCHES: { token: keyof typeof colours; css: string; use: string; text: keyof typeof colours }[] = [
  { token: "flour", css: "--flour", use: "Page background, paper grain", text: "rye" },
  { token: "crust", css: "--crust", use: "Primary, buttons, footer", text: "flour" },
  { token: "rye", css: "--rye", use: "Text and ink lines", text: "flour" },
  { token: "sage", css: "--sage", use: "Accents, “available”", text: "rye" },
  { token: "terracotta", css: "--terracotta", use: "Highlights, “few left”", text: "rye" },
  { token: "butter", css: "--butter", use: "Blobs, specials", text: "rye" },
  { token: "oat", css: "--oat", use: "Card fills, sections", text: "rye" },
  { token: "chalkboard", css: "--chalkboard", use: "Specials board", text: "chalk" },
];

const PAIRS: [keyof typeof colours, keyof typeof colours, string][] = [
  ["rye", "flour", "Body text"],
  ["flour", "crust", "Button text"],
  ["rye", "oat", "Text on cards"],
  ["rye", "butter", "Text on blobs"],
  ["rye", "sageTint", "“Plenty” chip"],
  ["rye", "terracottaTint", "“Few left” chip"],
  ["ryeSoft", "soldOutTint", "“Sold out” chip"],
  ["ryeSoft", "flour", "Secondary text"],
  ["chalk", "chalkboard", "Chalkboard"],
];

export default function StyleGuide() {
  return (
    <>
      <PageHeader
        kicker="As handmade as the bread"
        title="Style guide"
        intro="The organic system behind Wildroot: earthy tokens, soft serif headings, handwriting used sparingly, blobs instead of boxes and a single 2px ink line for every drawing."
        illo="rollingPin"
        blob="b"
      />

      <div className="container sg">
        <section aria-labelledby="sg-colour">
          <h2 id="sg-colour">Colour</h2>
          <ul className="sg-swatches">
            {SWATCHES.map((s) => (
              <li key={s.token}>
                <span className="sg-swatch" style={{ background: colours[s.token], color: colours[s.text] }}>
                  Aa
                </span>
                <strong>{s.css}</strong>
                <code>{colours[s.token]}</code>
                <span className="small muted">{s.use}</span>
              </li>
            ))}
          </ul>
          <h3>Contrast, checked at build time</h3>
          <table className="sg-table">
            <thead>
              <tr>
                <th scope="col">Pairing</th>
                <th scope="col">Use</th>
                <th scope="col">Ratio</th>
              </tr>
            </thead>
            <tbody>
              {PAIRS.map(([fg, bg, use]) => {
                const r = contrastRatio(colours[fg], colours[bg]);
                return (
                  <tr key={`${fg}-${bg}`}>
                    <td>
                      <span className="sg-pair" style={{ color: colours[fg], background: colours[bg] }}>
                        {fg} on {bg}
                      </span>
                    </td>
                    <td>{use}</td>
                    <td className="price">
                      {formatRatio(r)} {r >= 4.5 ? "AA" : "fail"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section aria-labelledby="sg-type">
          <h2 id="sg-type">Type</h2>
          <div className="sg-type">
            <p className="sg-type__display">Slow bread for busy mornings.</p>
            <p className="small muted">Display: Fraunces, soft axis at 100, 38px → 80px</p>
            <Note>Baked at 5am!</Note>
            <p className="small muted">Handwritten accents: Caveat, 22px → 32px. Short, non-essential notes only; never prices, allergens or instructions.</p>
            <p>
              Body: DM Sans, 16px → 18px, clean and legible. Prices use DM Sans 600 with tabular figures: <span className="price">£5.20</span>{" "}
              <span className="price">£12.40</span>
            </p>
          </div>
        </section>

        <section aria-labelledby="sg-illo">
          <h2 id="sg-illo">Illustrations</h2>
          <p className="muted">
            {ILLUSTRATION_NAMES.length} drawings in one inline SVG sprite, a consistent 2px ink line in <code>currentColor</code>. Decorative, so
            hidden from screen readers unless they carry meaning.
          </p>
          <ul className="sg-illos">
            {ILLUSTRATION_NAMES.map((n, i) => (
              <li key={n}>
                <Illo name={n} className={n === "wheat" ? "sway" : undefined} style={{ color: ["var(--rye)", "var(--crust)", "#5f7550", "var(--terracotta)"][i % 4] }} />
                <code>{n}</code>
              </li>
            ))}
          </ul>
          <ul className="sg-doodles">
            {(Object.keys(DOODLES) as DoodleName[]).map((d) => (
              <li key={d}>
                <Doodle name={d} />
                <code>{d}</code>
              </li>
            ))}
          </ul>
          <p className="sg-marks">
            Hand-drawn marks draw themselves on scroll: <Mark>an underline</Mark> and a <Mark kind="circle">circle</Mark>.
          </p>
        </section>

        <section aria-labelledby="sg-shapes">
          <h2 id="sg-shapes">Shapes</h2>
          <ul className="sg-blobs">
            {(Object.keys(BLOBS) as BlobName[]).map((b, i) => (
              <li key={b}>
                <div className="sg-blob">
                  <Blob shape={b} color={["var(--butter)", "var(--sage-tint)", "var(--oat)", "var(--terracotta-tint)", "var(--butter)"][i]} />
                </div>
                <code>blob {b}</code>
              </li>
            ))}
          </ul>
          <div className="sg-wave">
            <Wave color="var(--crust)" />
            <p className="small">Wavy section edges: 12px amplitude on phones, 20px on tablets, 32px on desktop.</p>
          </div>
        </section>

        <section aria-labelledby="sg-components">
          <h2 id="sg-components">Components</h2>
          <div className="sg-row">
            <ButtonLink href="/order">Order for tomorrow</ButtonLink>
            <ButtonLink href="/menu" variant="secondary" arrow={false}>
              Secondary
            </ButtonLink>
            <Button variant="ghost">Ghost</Button>
          </div>
          <div className="sg-row">
            <AvailabilityChip status="plenty" />
            <AvailabilityChip status="few" />
            <AvailabilityChip status="few" remaining={3} showCount />
            <AvailabilityChip status="soldout" />
          </div>
          <div className="sg-row">
            <StepperDemo />
            <StepperDemo size="lg" />
          </div>
          <div className="sg-board">
            <Chalkboard
              title="Chalkboard panel"
              specials={[
                { id: "a", kind: "today", title: "Real text in Caveat", detail: "Selectable, translatable, readable", price: "£0.00" },
                { id: "b", kind: "seasonal", title: "Prices stay in DM Sans" },
              ]}
            />
          </div>
        </section>
      </div>
    </>
  );
}
