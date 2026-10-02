import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { BLOBS, BLOB_MORPH, DOODLES, type BlobName } from "./illustrations/paths";

/** A flat organic shape for backgrounds. Always decorative. */
export function Blob({
  shape = "a",
  className,
  style,
  color = "var(--butter)",
}: {
  shape?: BlobName;
  className?: string;
  style?: CSSProperties;
  color?: string;
}) {
  return (
    <svg className={`blob${className ? ` ${className}` : ""}`} viewBox="0 0 1 1" preserveAspectRatio="none" style={style} aria-hidden="true" focusable="false">
      <path d={BLOBS[shape]} fill={color} />
    </svg>
  );
}

/** The hero's background blob, slowly morphing between two outlines (paused for reduced motion). */
export function MorphBlob({ className, color = "var(--butter)" }: { className?: string; color?: string }) {
  return (
    <svg className={`blob blob--morph${className ? ` ${className}` : ""}`} viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true" focusable="false" data-morph>
      <path d={BLOBS.a} fill={color}>
        <animate
          attributeName="d"
          dur="8s"
          repeatCount="indefinite"
          calcMode="spline"
          keyTimes="0;0.5;1"
          keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
          values={`${BLOBS.a};${BLOB_MORPH.a2};${BLOBS.a}`}
        />
      </path>
    </svg>
  );
}

/**
 * A real <img> (with alt text) masked into a blob or arch. The mask is an SVG clipPath in
 * objectBoundingBox units, so it scales with the image at any size.
 */
export function BlobImage({
  src,
  alt,
  shape = "a",
  width,
  height,
  sizes,
  priority,
  className,
}: {
  src: string;
  alt: string;
  shape?: BlobName;
  width: number;
  height: number;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      className={`blob-img blob-img--${shape}${className ? ` ${className}` : ""}`}
    />
  );
}

const WAVE_PATHS = {
  a: "M0 22 C160 4 280 36 440 20 C600 4 700 30 860 22 C1020 14 1120 2 1260 18 C1340 27 1400 24 1440 16 L1440 40 L0 40 Z",
  b: "M0 14 C120 26 260 34 420 22 C560 12 660 4 820 16 C980 28 1100 36 1240 24 C1330 16 1400 10 1440 14 L1440 40 L0 40 Z",
};

/**
 * Wavy section edge. Sits on the top (or bottom) of a coloured section and is filled with that
 * section's colour. Amplitude is 12px on phones, 20px on tablets and 32px on desktop (see CSS).
 */
export function Wave({
  color,
  position = "top",
  variant = "a",
}: {
  color: string;
  position?: "top" | "bottom";
  variant?: keyof typeof WAVE_PATHS;
}) {
  return (
    <svg className={`wave wave--${position}`} viewBox="0 0 1440 40" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d={WAVE_PATHS[variant]} fill={color} />
    </svg>
  );
}

/**
 * Highlights key words with a hand-drawn underline or circle that draws itself (600ms) when it
 * scrolls into view. The words stay real text; the mark is decorative.
 */
export function Mark({ children, kind = "underline" }: { children: ReactNode; kind?: "underline" | "circle" }) {
  const d = DOODLES[kind];
  return (
    <span className={`mark mark--${kind}`}>
      {children}
      <svg className="mark__svg" viewBox={d.viewBox} preserveAspectRatio="none" aria-hidden="true" focusable="false" data-draw>
        {d.s.map((p, i) => (
          <path key={i} d={p} pathLength={1} style={{ transitionDelay: `${i * 180}ms` }} />
        ))}
      </svg>
    </span>
  );
}

/** A handwritten note in Caveat. Only for short, non-essential asides. */
export function Note({ children, className, as: Tag = "p" }: { children: ReactNode; className?: string; as?: "p" | "span" }) {
  return <Tag className={`note${className ? ` ${className}` : ""}`}>{children}</Tag>;
}
