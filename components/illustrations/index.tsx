import type { CSSProperties } from "react";
import {
  BLOBS,
  DOODLES,
  ICONS,
  ILLUSTRATIONS,
  type BlobName,
  type DoodleName,
  type IconName,
  type IllustrationName,
} from "./paths";

export type { IllustrationName, DoodleName, IconName, BlobName };

const INK = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/**
 * One inline sprite for the whole site: 30 illustrations, doodles, icons and the blob clip paths.
 * Rendered once in the root layout; everything else references it with <use> or clip-path.
 */
export function IllustrationSprite() {
  return (
    <svg className="sprite" aria-hidden="true" focusable="false" width="0" height="0">
      <defs>
        {Object.entries(ILLUSTRATIONS).map(([name, d]) => {
          const drawing = d as { s: string[]; f?: string[]; t?: string };
          return (
            <symbol key={name} id={`i-${name}`} viewBox="0 0 64 64" overflow="visible">
              <g transform={drawing.t} {...INK}>
                {drawing.s.map((p, i) => (
                  <path key={i} d={p} vectorEffect="non-scaling-stroke" />
                ))}
                {drawing.f?.map((p, i) => (
                  <path key={`f${i}`} d={p} fill="currentColor" stroke="none" />
                ))}
              </g>
            </symbol>
          );
        })}
        {Object.entries(DOODLES).map(([name, d]) => (
          <symbol key={name} id={`d-${name}`} viewBox={d.viewBox} overflow="visible">
            <g {...INK}>
              {d.s.map((p, i) => (
                <path key={i} d={p} vectorEffect="non-scaling-stroke" />
              ))}
            </g>
          </symbol>
        ))}
        {Object.entries(ICONS).map(([name, paths]) => (
          <symbol key={name} id={`ic-${name}`} viewBox="0 0 24 24" overflow="visible">
            <g {...INK}>
              {paths.map((p, i) => (
                <path key={i} d={p} vectorEffect="non-scaling-stroke" />
              ))}
            </g>
          </symbol>
        ))}
        {Object.entries(BLOBS).map(([name, d]) => (
          <clipPath key={name} id={`clip-${name}`} clipPathUnits="objectBoundingBox">
            <path d={d} />
          </clipPath>
        ))}
      </defs>
    </svg>
  );
}

type SizeProps = { size?: number | string; className?: string; style?: CSSProperties };

function sizeStyle(size: number | string | undefined, style?: CSSProperties): CSSProperties | undefined {
  if (size === undefined) return style;
  const v = typeof size === "number" ? `${size}px` : size;
  return { width: v, height: v, ...style };
}

/** A line illustration. Decorative (aria-hidden) unless given a `title`. */
export function Illo({ name, size, className, style, title }: SizeProps & { name: IllustrationName; title?: string }) {
  return (
    <svg
      className={`illo illo--${name}${className ? ` ${className}` : ""}`}
      viewBox="0 0 64 64"
      style={sizeStyle(size, style)}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <use href={`#i-${name}`} />
    </svg>
  );
}

export function Icon({ name, size = 20, className, style }: SizeProps & { name: IconName }) {
  return (
    <svg className={`icon${className ? ` ${className}` : ""}`} viewBox="0 0 24 24" style={sizeStyle(size, style)} aria-hidden="true" focusable="false">
      <use href={`#ic-${name}`} />
    </svg>
  );
}

export function Doodle({ name, className, style }: { name: DoodleName; className?: string; style?: CSSProperties }) {
  return (
    <svg className={`doodle doodle--${name}${className ? ` ${className}` : ""}`} viewBox={DOODLES[name].viewBox} style={style} aria-hidden="true" focusable="false">
      <use href={`#d-${name}`} />
    </svg>
  );
}
