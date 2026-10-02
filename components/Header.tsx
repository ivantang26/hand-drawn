"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Doodle, Icon, Illo } from "./illustrations";
import { Wordmark } from "./Wordmark";

const PRIMARY = [
  { href: "/menu", label: "Menu" },
  { href: "/workshops", label: "Workshops" },
  { href: "/shops", label: "Our shops" },
  { href: "/story", label: "Our story" },
];

const SECONDARY = [
  { href: "/wholesale", label: "Wholesale" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    firstLinkRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const onOrderPage = pathname.startsWith("/order");

  return (
    <header className="site-header">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="site-header__inner container">
        <Link href="/" className="site-header__brand" aria-label="Wildroot home">
          <Wordmark />
        </Link>

        <nav className="site-nav" aria-label="Main">
          <ul>
            {PRIMARY.map((l) => (
              <li key={l.href}>
                <Link href={l.href} aria-current={isActive(l.href) ? "page" : undefined}>
                  {l.label}
                  {isActive(l.href) ? <Doodle name="underline" className="site-nav__mark" /> : null}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-header__actions">
          {!onOrderPage ? (
            <Link href="/order" className="btn btn--primary btn--small site-header__cta">
              <span>
                Order <span className="hide-sm">for tomorrow</span>
              </span>
              <Doodle name="arrow" className="btn__arrow" />
            </Link>
          ) : null}
          <button
            ref={toggleRef}
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((o) => !o)}
          >
            <Icon name={open ? "close" : "menu"} size={24} />
            <span className="visually-hidden">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </div>

      <nav id="mobile-nav" className="mobile-nav" aria-label="Main" hidden={!open}>
        <ul className="container">
          {[{ href: "/order", label: "Order for collection" }, ...PRIMARY, ...SECONDARY].map((l, i) => (
            <li key={l.href}>
              <Link href={l.href} ref={i === 0 ? firstLinkRef : undefined} aria-current={isActive(l.href) ? "page" : undefined}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mobile-nav__foot container">
          <Illo name="wheat" className="sway" size={40} />
          <p className="note">Order by 8pm, collect from 7:30am</p>
        </div>
      </nav>
    </header>
  );
}
