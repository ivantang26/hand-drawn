import Link from "next/link";
import { SHOPS, hoursTable } from "@/lib/shops";
import { Illo } from "./illustrations";
import { Wave } from "./shapes";
import { Wordmark } from "./Wordmark";

export function Footer() {
  return (
    <footer className="site-footer">
      <Wave color="var(--crust)" variant="b" />
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <Wordmark tone="flour" />
          <p>Slow bread for busy mornings. Two small shops in Ashcombe, baking every day from 4am.</p>
          <p className="note">Order by 8pm, collect from 7:30am</p>
        </div>

        {SHOPS.map((shop) => (
          <div key={shop.id} className="site-footer__shop">
            <h2 className="site-footer__title">{shop.short}</h2>
            <address>
              {shop.address.map((line) => (
                <span key={line}>{line}</span>
              ))}
              <a href={`tel:${shop.phone.replace(/\s/g, "")}`}>{shop.phone}</a>
            </address>
            <dl className="hours-list hours-list--compact">
              {hoursTable(shop).map(([days, time]) => (
                <div key={days}>
                  <dt>{days}</dt>
                  <dd>{time}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}

        <nav className="site-footer__links" aria-label="Footer">
          <h2 className="site-footer__title">Around the bakery</h2>
          <ul>
            <li><Link href="/order">Order for collection</Link></li>
            <li><Link href="/menu">Menu &amp; allergens</Link></li>
            <li><Link href="/workshops">Workshops &amp; gift vouchers</Link></li>
            <li><Link href="/wholesale">Wholesale</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/staff">Staff: bake planner</Link></li>
            <li><Link href="/style-guide">Style guide</Link></li>
          </ul>
        </nav>
      </div>
      <div className="container site-footer__base">
        <Illo name="loaf" size={28} />
        <p>
          Wildroot is a fictional bakery, designed as a portfolio piece. Orders, payments, texts and emails are simulated.
        </p>
      </div>
    </footer>
  );
}
