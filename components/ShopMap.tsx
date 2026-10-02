import { SHOPS } from "@/lib/shops";

/** A simple illustrated map of Ashcombe with both shops pinned. */
export function ShopMap({ className }: { className?: string }) {
  return (
    <svg
      className={`shop-map${className ? ` ${className}` : ""}`}
      viewBox="0 0 400 260"
      role="img"
      aria-label="Illustrated map of Ashcombe. Mill Lane is in the old town near the market square; Harbour Street is on the quay, about a 10-minute walk south-east along the river."
    >
      <rect x="2" y="2" width="396" height="256" rx="22" fill="var(--oat)" />
      {/* river and harbour */}
      <path
        d="M-10 70 C60 60 110 90 150 120 C190 150 230 150 270 170 C310 190 340 215 410 205 L410 270 L-10 270 Z"
        fill="#cfdcd4"
      />
      <path d="M-10 70 C60 60 110 90 150 120 C190 150 230 150 270 170 C310 190 340 215 410 205" fill="none" stroke="var(--rye)" strokeWidth="2" strokeLinecap="round" />
      <g fill="none" stroke="var(--rye)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5">
        <path d="M60 110 c6 -4 12 -4 18 0" />
        <path d="M200 200 c6 -4 12 -4 18 0" />
        <path d="M330 235 c6 -4 12 -4 18 0" />
      </g>
      {/* streets */}
      <g fill="none" stroke="var(--rye)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 30 C80 34 150 28 220 36 C280 42 330 38 385 44" />
        <path d="M120 20 C118 60 122 90 126 108" />
        <path d="M60 36 C70 60 90 80 112 92 C150 110 190 118 230 128 C270 138 300 160 318 190" />
        <path d="M230 36 C236 70 240 100 238 132" />
        <path d="M300 40 C304 80 312 120 330 160 C338 176 345 190 352 206" />
        <path d="M160 128 L158 146 M150 146 L168 150" />
      </g>
      {/* market square and trees */}
      <rect x="104" y="44" width="48" height="36" rx="8" fill="var(--butter)" stroke="var(--rye)" strokeWidth="2" transform="rotate(-4 128 62)" />
      <g fill="var(--sage)" stroke="var(--rye)" strokeWidth="1.5">
        <circle cx="262" cy="80" r="9" />
        <circle cx="276" cy="92" r="7" />
        <circle cx="30" cy="140" r="8" />
        <circle cx="366" cy="110" r="9" />
      </g>
      <text x="128" y="66" textAnchor="middle" className="shop-map__label shop-map__label--small">market</text>
      <text x="360" y="245" textAnchor="middle" className="shop-map__label shop-map__label--small">harbour</text>
      {/* pins */}
      {SHOPS.map((s) => {
        const x = (s.map.x / 100) * 400;
        const y = (s.map.y / 100) * 260;
        return (
          <g key={s.id} transform={`translate(${x} ${y})`}>
            <path d="M0 0 C-6 -8 -12 -14 -12 -22 C-12 -30 -6 -36 0 -36 C6 -36 12 -30 12 -22 C12 -14 6 -8 0 0 Z" fill="var(--terracotta)" stroke="var(--rye)" strokeWidth="2" strokeLinejoin="round" />
            <circle cy="-22" r="4.5" fill="var(--flour)" stroke="var(--rye)" strokeWidth="1.5" />
            <text y="16" textAnchor="middle" className="shop-map__label">
              {s.short}
            </text>
          </g>
        );
      })}
      {/* walking route */}
      <path d="M124 104 C170 120 220 140 280 162" fill="none" stroke="var(--crust)" strokeWidth="2.5" strokeDasharray="2 7" strokeLinecap="round" />
      <text x="206" y="116" textAnchor="middle" className="shop-map__label shop-map__label--note" transform="rotate(14 206 116)">
        10 min walk
      </text>
      {/* compass */}
      <g transform="translate(365 32)" fill="none" stroke="var(--rye)" strokeWidth="1.6" strokeLinecap="round">
        <path d="M0 -14 L4 0 L0 14 L-4 0 Z" fill="var(--flour)" />
        <text y="-18" textAnchor="middle" stroke="none" fill="var(--rye)" className="shop-map__label shop-map__label--small">N</text>
      </g>
    </svg>
  );
}
