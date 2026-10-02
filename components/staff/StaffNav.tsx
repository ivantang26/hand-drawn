"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Illo } from "@/components/illustrations";

const LINKS = [
  { href: "/staff", label: "Bake plan", illo: "oven" },
  { href: "/staff/collections", label: "Collections", illo: "bag" },
  { href: "/staff/settings", label: "Specials & hours", illo: "calendar" },
] as const;

export function StaffNav() {
  const path = usePathname();
  return (
    <header className="staff-nav">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="staff-nav__inner">
        <Link href="/staff" className="staff-nav__brand">
          <Illo name="wheat" size={26} />
          Wildroot <span>kitchen</span>
        </Link>
        <nav aria-label="Staff">
          <ul>
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} aria-current={path === l.href ? "page" : undefined}>
                  <Illo name={l.illo} size={22} />
                  <span>{l.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link href="/" className="staff-nav__site">
          View site
        </Link>
      </div>
    </header>
  );
}
