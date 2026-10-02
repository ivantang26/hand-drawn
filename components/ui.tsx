import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import type { AvailabilityStatus } from "@/lib/types";
import { Doodle, Icon } from "./illustrations";

type Variant = "primary" | "secondary" | "ghost";

/** Crust pill with a slightly irregular outline and a hand-drawn arrow. */
export function ButtonLink({
  href,
  children,
  variant = "primary",
  arrow = true,
  className,
  ...rest
}: { href: string; children: ReactNode; variant?: Variant; arrow?: boolean } & Omit<ComponentProps<typeof Link>, "href">) {
  return (
    <Link href={href} className={`btn btn--${variant}${className ? ` ${className}` : ""}`} {...rest}>
      <span>{children}</span>
      {arrow ? <Doodle name="arrow" className="btn__arrow" /> : null}
    </Link>
  );
}

export function Button({
  children,
  variant = "primary",
  arrow = false,
  className,
  busy,
  ...rest
}: { variant?: Variant; arrow?: boolean; busy?: boolean } & ComponentProps<"button">) {
  return (
    <button className={`btn btn--${variant}${className ? ` ${className}` : ""}`} aria-busy={busy || undefined} {...rest}>
      <span>{children}</span>
      {arrow ? <Doodle name="arrow" className="btn__arrow" /> : null}
    </button>
  );
}

const CHIP_TEXT: Record<AvailabilityStatus, string> = { plenty: "Plenty", few: "Few left", soldout: "Sold out" };

/** Availability always shown as words, with colour as a second cue. */
export function AvailabilityChip({ status, remaining, showCount }: { status: AvailabilityStatus; remaining?: number; showCount?: boolean }) {
  const text = status === "few" && showCount && remaining !== undefined ? `Only ${remaining} left` : CHIP_TEXT[status];
  return (
    <span className={`chip chip--${status}`}>
      <span className="chip__dot" aria-hidden="true" />
      {text}
    </span>
  );
}

/** Quantity stepper. Large tap targets; the value is announced via the group label. */
export function Stepper({
  value,
  min = 0,
  max,
  onChange,
  label,
  size = "md",
  disabled,
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
  label: string;
  size?: "md" | "lg";
  disabled?: boolean;
}) {
  const atMax = max !== undefined && value >= max;
  return (
    <div className={`stepper stepper--${size}`} role="group" aria-label={label}>
      <button type="button" className="stepper__btn" onClick={() => onChange(Math.max(min, value - 1))} disabled={disabled || value <= min} aria-label={`Remove one ${label}`}>
        <Icon name="minus" />
      </button>
      <output className="stepper__value" aria-live="polite" aria-label={`${label} quantity`}>
        {value}
      </output>
      <button type="button" className="stepper__btn" onClick={() => onChange(value + 1)} disabled={disabled || atMax} aria-label={`Add one ${label}`}>
        <Icon name="plus" />
      </button>
    </div>
  );
}

export function SectionHeading({
  kicker,
  title,
  intro,
  align = "left",
  id,
}: {
  kicker?: ReactNode;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  id?: string;
}) {
  return (
    <header className={`section-heading section-heading--${align}`}>
      {kicker ? <p className="note section-heading__kicker">{kicker}</p> : null}
      <h2 id={id}>{title}</h2>
      {intro ? <p className="section-heading__intro">{intro}</p> : null}
    </header>
  );
}
