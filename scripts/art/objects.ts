/**
 * Painted bakery objects. Each returns SVG (defs + body) drawn in local coordinates around 0,0
 * and placed with translate/scale/rotate. `id` prefixes keep gradient ids unique per document.
 */
import { between, linear, radial, scatter, shadow, type Rand } from "./lib";

export type Placed = { x: number; y: number; s?: number; rot?: number; id: string; r: Rand };

type Art = { defs: string; body: string };

const place = (p: Placed, inner: string) =>
  `<g transform="translate(${p.x} ${p.y}) rotate(${p.rot ?? 0}) scale(${p.s ?? 1})">${inner}</g>`;

export const CRUST = {
  golden: ["#e2ad63", "#b8773a", "#7a451b"],
  dark: ["#c98c4a", "#955624", "#5a3212"],
  rye: ["#8a5a36", "#5e3a20", "#3a2413"],
  spelt: ["#d9a867", "#a86f37", "#6d4119"],
  pale: ["#ecc68a", "#cf9a55", "#9a6128"],
} as const;

type CrustName = keyof typeof CRUST;

/** Round country loaf, three-quarter view, with an ear and flour dusting. */
export function boule(p: Placed, crust: CrustName = "golden", opts: { flour?: boolean; blisters?: boolean } = {}): Art {
  const [l, m, d] = CRUST[crust];
  const id = p.id;
  const body = "M-220 40 C-222 -70 -120 -150 0 -150 C120 -150 222 -70 220 40 C218 95 120 118 0 118 C-120 118 -218 95 -220 40 Z";
  const defs = `
    ${radial(`${id}-g`, [[0, l], [0.55, m], [1, d]], 0.42, 0.28, 0.75)}
    ${linear(`${id}-base`, [[0, d, 0], [0.7, d, 0.55], [1, "#3b200b", 0.85]])}
    ${linear(`${id}-cut`, [[0, "#f1d7a4"], [1, "#d8a869"]])}
    <clipPath id="${id}-clip"><path d="${body}"/></clipPath>`;
  let inner = shadow(10, 110, 230, 40, 0.5) + shadow(0, 116, 200, 18, 0.45, true);
  inner += `<g filter="url(#wobbleSoft)"><path d="${body}" fill="url(#${id}-g)"/>`;
  inner += `<g clip-path="url(#${id}-clip)">`;
  inner += `<rect x="-240" y="-20" width="480" height="150" fill="url(#${id}-base)"/>`;
  // The ear: an opened cut with pale crumb and a dark lifted lip.
  inner += `<path d="M-160 -30 C-90 -112 70 -122 160 -58 C80 -80 -60 -76 -160 -30 Z" fill="url(#${id}-cut)"/>`;
  inner += `<path d="M-160 -30 C-90 -112 70 -122 160 -58" stroke="${d}" stroke-width="9" fill="none" stroke-linecap="round" opacity="0.85"/>`;
  inner += `<path d="M-150 -38 C-80 -104 60 -113 150 -62" stroke="#f6e4bd" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.6"/>`;
  if (opts.blisters !== false) inner += scatter(p.r, 40, -180, -120, 360, 180, d, [1.5, 4], [0.25, 0.55]);
  if (opts.flour !== false) {
    inner += `<ellipse cx="-30" cy="-40" rx="200" ry="110" fill="#fff" filter="url(#flour)" opacity="0.9"/>`;
    inner += `<ellipse cx="-60" cy="-95" rx="120" ry="45" fill="#fbf6ea" opacity="0.28" filter="url(#blur8)"/>`;
  }
  inner += `<ellipse cx="-80" cy="-100" rx="70" ry="26" fill="#fff" opacity="0.18" filter="url(#blur8)"/>`;
  inner += `</g></g>`;
  return { defs, body: place(p, inner) };
}

/** Oval batard with three slashes. */
export function batard(p: Placed, crust: CrustName = "spelt", opts: { fruit?: boolean } = {}): Art {
  const [l, m, d] = CRUST[crust];
  const id = p.id;
  const body = "M-250 20 C-252 -62 -135 -112 0 -112 C135 -112 252 -62 250 20 C248 72 135 96 0 96 C-135 96 -248 72 -250 20 Z";
  const defs = `
    ${radial(`${id}-g`, [[0, l], [0.6, m], [1, d]], 0.45, 0.3, 0.72)}
    ${linear(`${id}-base`, [[0, d, 0], [0.75, d, 0.5], [1, "#3b200b", 0.85]])}
    ${linear(`${id}-cut`, [[0, "#f3dcad"], [1, "#d5a266"]])}
    <clipPath id="${id}-clip"><path d="${body}"/></clipPath>`;
  let inner = shadow(10, 90, 260, 36, 0.5) + shadow(0, 94, 230, 14, 0.4, true);
  inner += `<g filter="url(#wobbleSoft)"><path d="${body}" fill="url(#${id}-g)"/><g clip-path="url(#${id}-clip)">`;
  inner += `<rect x="-260" y="-10" width="520" height="120" fill="url(#${id}-base)"/>`;
  for (const [x, w] of [[-120, 1], [0, 1.08], [120, 1]] as const) {
    inner += `<g transform="translate(${x} -40) rotate(-28) scale(${w} 1)">
      <path d="M-70 0 C-35 -26 35 -26 70 0 C35 12 -35 12 -70 0 Z" fill="url(#${id}-cut)"/>
      <path d="M-70 0 C-35 -26 35 -26 70 0" stroke="${d}" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.8"/>
    </g>`;
  }
  if (opts.fruit) {
    inner += scatter(p.r, 16, -200, -70, 400, 130, "#4a2438", [5, 9], [0.7, 0.95]);
    inner += scatter(p.r, 12, -200, -70, 400, 130, "#c9a476", [5, 10], [0.7, 0.95]);
  }
  inner += scatter(p.r, 30, -220, -90, 440, 150, d, [1.5, 3.5], [0.25, 0.5]);
  inner += `<ellipse cx="0" cy="-30" rx="220" ry="80" fill="#fff" filter="url(#flour)" opacity="0.55"/>`;
  inner += `<ellipse cx="-90" cy="-80" rx="90" ry="22" fill="#fff" opacity="0.2" filter="url(#blur8)"/>`;
  inner += `</g></g>`;
  return { defs, body: place(p, inner) };
}

/** A long baguette with five grignes. */
export function baguette(p: Placed): Art {
  const id = p.id;
  const body = "M-450 0 C-450 -46 -420 -66 -370 -66 L370 -66 C420 -66 450 -46 450 0 C450 46 420 66 370 66 L-370 66 C-420 66 -450 46 -450 0 Z";
  const defs = `
    ${linear(`${id}-g`, [[0, "#e7b46a"], [0.45, "#c07f3e"], [1, "#6e3e16"]])}
    ${linear(`${id}-cut`, [[0, "#f4dcaa"], [1, "#d8a468"]])}
    <clipPath id="${id}-clip"><path d="${body}"/></clipPath>`;
  let inner = shadow(10, 55, 450, 30, 0.45) + shadow(0, 60, 420, 12, 0.4, true);
  inner += `<g filter="url(#wobbleSoft)"><path d="${body}" fill="url(#${id}-g)"/><g clip-path="url(#${id}-clip)">`;
  for (let i = -2; i <= 2; i++) {
    inner += `<g transform="translate(${i * 150} -8) rotate(-8)">
      <path d="M-92 4 C-50 -24 50 -26 92 -4 C50 8 -50 12 -92 4 Z" fill="url(#${id}-cut)"/>
      <path d="M-92 4 C-50 -24 50 -26 92 -4" stroke="#7a441a" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.8"/>
    </g>`;
  }
  inner += scatter(p.r, 40, -430, -50, 860, 90, "#6e3e16", [1.2, 3], [0.2, 0.5]);
  inner += `<rect x="-440" y="-60" width="880" height="36" fill="#fff" opacity="0.14" filter="url(#blur8)"/>`;
  inner += `</g></g>`;
  return { defs, body: place(p, inner) };
}

/** Seeded rye in a tin shape, three-quarter view. */
export function ryeTin(p: Placed): Art {
  const id = p.id;
  const top = "M-210 -30 C-212 -96 -150 -122 0 -122 C150 -122 212 -96 210 -30 C150 -8 -150 -8 -210 -30 Z";
  const front = "M-210 -30 C-150 -8 150 -8 210 -30 L200 112 C140 128 -140 128 -200 112 Z";
  const defs = `
    ${radial(`${id}-top`, [[0, "#7c5233"], [1, "#4a2d18"]], 0.45, 0.35, 0.7)}
    ${linear(`${id}-front`, [[0, "#5b3a22"], [1, "#2e1b0d"]])}
    <clipPath id="${id}-clip"><path d="${top}"/></clipPath>`;
  let inner = shadow(10, 118, 225, 30, 0.5) + shadow(0, 120, 205, 12, 0.45, true);
  inner += `<g filter="url(#wobbleSoft)"><path d="${front}" fill="url(#${id}-front)"/>`;
  inner += `<path d="M-205 20 C-140 36 140 36 205 20" stroke="#1e1108" stroke-width="3" opacity="0.4" fill="none"/>`;
  inner += `<path d="${top}" fill="url(#${id}-top)"/><g clip-path="url(#${id}-clip)">`;
  const seeds: [string, [number, number]][] = [
    ["#b5ad86", [4, 8]],
    ["#56682f", [4, 9]],
    ["#ecdcb5", [2.5, 4.5]],
    ["#2a1a0d", [2, 4]],
  ];
  for (const [c, sz] of seeds) inner += scatter(p.r, 70, -200, -120, 400, 110, c, sz, [0.7, 1]);
  inner += `<path d="M-120 -80 C-60 -95 20 -70 90 -92" stroke="#2a180b" stroke-width="4" fill="none" opacity="0.5"/>`;
  inner += `</g></g>`;
  return { defs, body: place(p, inner) };
}

/** Focaccia slab, top-down, with dimples, potato, rosemary and salt. */
export function focaccia(p: Placed): Art {
  const id = p.id;
  const defs = `${radial(`${id}-g`, [[0, "#f0c46e"], [0.7, "#d9a04e"], [1, "#a8672a"]], 0.5, 0.45, 0.7)}`;
  let inner = shadow(12, 20, 290, 210, 0.4);
  inner += `<g filter="url(#wobbleSoft)"><rect x="-280" y="-200" width="560" height="400" rx="46" fill="url(#${id}-g)"/>`;
  for (let i = 0; i < 26; i++) {
    const x = between(p.r, -240, 240);
    const y = between(p.r, -165, 165);
    inner += `<ellipse cx="${x}" cy="${y}" rx="11" ry="9" fill="#9d5e22" opacity="0.55"/><ellipse cx="${x - 2}" cy="${y - 3}" rx="7" ry="5" fill="#f7d98f" opacity="0.5"/>`;
  }
  for (let i = 0; i < 7; i++) {
    const x = between(p.r, -210, 210);
    const y = between(p.r, -140, 140);
    inner += `<circle cx="${x}" cy="${y}" r="${between(p.r, 30, 40)}" fill="#f4e1b0" stroke="#b77a3a" stroke-width="5" opacity="0.95"/>`;
  }
  for (let i = 0; i < 6; i++) {
    const x = between(p.r, -220, 200);
    const y = between(p.r, -150, 150);
    const a = between(p.r, -40, 40);
    let sprig = `<path d="M0 0 L90 0" stroke="#4d5b2c" stroke-width="3"/>`;
    for (let k = 8; k < 90; k += 10) sprig += `<path d="M${k} 0 l8 -12 M${k} 0 l8 12" stroke="#5f7038" stroke-width="4" stroke-linecap="round"/>`;
    inner += `<g transform="translate(${x} ${y}) rotate(${a})">${sprig}</g>`;
  }
  inner += scatter(p.r, 60, -250, -180, 500, 360, "#ffffff", [1.5, 3.5], [0.7, 1]);
  inner += `<ellipse cx="-80" cy="-100" rx="180" ry="60" fill="#fff" opacity="0.22" filter="url(#blur8)"/>`;
  inner += `</g>`;
  return { defs, body: place(p, inner) };
}

/** Croissant, three-quarter view: tapered segments fanned along a crescent. */
export function croissant(p: Placed, opts: { almond?: boolean } = {}): Art {
  const id = p.id;
  const defs = `
    ${radial(`${id}-seg`, [[0, "#f3c577"], [0.5, "#d6913f"], [1, "#8a4b19"]], 0.5, 0.3, 0.7)}
    ${radial(`${id}-tip`, [[0, "#e7a95a"], [1, "#7f4315"]], 0.5, 0.35, 0.65)}`;
  // [angle along the arc, half-width, half-height, gradient]; drawn tips first, centre last.
  const segs: [number, number, number, string][] = [
    [-70, 30, 42, "tip"],
    [70, 30, 42, "tip"],
    [-47, 54, 70, "seg"],
    [47, 54, 70, "seg"],
    [-24, 64, 88, "seg"],
    [24, 64, 88, "seg"],
    [0, 74, 102, "seg"],
  ];
  const R = 190;
  let inner = shadow(0, 70, 240, 40, 0.45) + shadow(0, 74, 200, 14, 0.35, true);
  inner += `<g filter="url(#wobbleSoft)">`;
  inner += `<path d="M-205 70 C-170 -20 -90 -80 0 -82 C90 -80 170 -20 205 70 C140 40 60 50 0 60 C-60 50 -140 40 -205 70 Z" fill="#9a5520"/>`;
  for (const [a, w, h, g] of segs) {
    const rad = (a * Math.PI) / 180;
    const x = Math.sin(rad) * R;
    const y = -10 + (1 - Math.cos(rad)) * R * 0.6;
    const lens = `M0 ${-h} C${w * 1.3} ${-h * 0.75} ${w * 1.3} ${h * 0.75} 0 ${h} C${-w * 1.3} ${h * 0.75} ${-w * 1.3} ${-h * 0.75} 0 ${-h} Z`;
    inner += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(a * 0.85).toFixed(1)})">
      <path d="${lens}" fill="url(#${id}-${g})"/>
      <path d="M${-w * 0.35} ${-h * 0.85} C${-w * 0.6} ${-h * 0.2} ${-w * 0.55} ${h * 0.4} ${-w * 0.25} ${h * 0.88}" stroke="#7a3f12" stroke-width="2.5" fill="none" opacity="0.3"/>
      <path d="M${w * 0.35} ${-h * 0.85} C${w * 0.6} ${-h * 0.2} ${w * 0.55} ${h * 0.4} ${w * 0.25} ${h * 0.88}" stroke="#7a3f12" stroke-width="2.5" fill="none" opacity="0.3"/>
      <ellipse cx="${-w * 0.15}" cy="${-h * 0.45}" rx="${w * 0.35}" ry="${h * 0.3}" fill="#fff4d9" opacity="0.4" filter="url(#blur3)"/>
    </g>`;
  }
  if (opts.almond) {
    for (let i = 0; i < 22; i++) {
      const x = between(p.r, -170, 170);
      const y = between(p.r, -70, 40);
      inner += `<ellipse cx="${x}" cy="${y}" rx="11" ry="5" fill="#f1dfb8" stroke="#b98b50" stroke-width="1.5" transform="rotate(${between(p.r, 0, 180)} ${x} ${y})"/>`;
    }
    inner += `<ellipse cx="0" cy="-20" rx="230" ry="90" fill="#fff" filter="url(#flour)" opacity="0.95"/>`;
  }
  inner += `</g>`;
  return { defs, body: place(p, inner) };
}

/** Pain au chocolat: a laminated pillow with chocolate batons peeking out. */
export function painChoc(p: Placed): Art {
  const id = p.id;
  const defs = `${radial(`${id}-g`, [[0, "#f1bf6f"], [0.6, "#cd8a40"], [1, "#8a4c1a"]], 0.45, 0.35, 0.7)}`;
  let inner = shadow(0, 88, 240, 34, 0.45) + shadow(0, 92, 210, 12, 0.35, true);
  inner += `<g filter="url(#wobbleSoft)">`;
  inner += `<rect x="-238" y="-18" width="30" height="46" rx="12" fill="#3a1f10"/><rect x="208" y="-18" width="30" height="46" rx="12" fill="#3a1f10"/>`;
  inner += `<path d="M-215 -60 C-215 -100 -180 -110 -140 -110 L140 -110 C180 -110 215 -100 215 -60 L215 50 C215 88 180 96 140 96 L-140 96 C-180 96 -215 88 -215 50 Z" fill="url(#${id}-g)"/>`;
  for (const y of [-40, 10, 55]) inner += `<path d="M-205 ${y} C-100 ${y - 14} 100 ${y - 14} 205 ${y}" stroke="#7a3f12" stroke-width="3" fill="none" opacity="0.35"/>`;
  for (let i = 0; i < 12; i++) inner += `<path d="M-210 ${-80 + i * 14} l-6 4" stroke="#6b3712" stroke-width="2" opacity="0.4"/>`;
  inner += `<ellipse cx="-50" cy="-80" rx="140" ry="22" fill="#fff4d9" opacity="0.45" filter="url(#blur8)"/>`;
  inner += `</g>`;
  return { defs, body: place(p, inner) };
}

/** Cardamom knot, top-down, with pearl sugar. */
export function knot(p: Placed): Art {
  const id = p.id;
  const defs = `${radial(`${id}-g`, [[0, "#e9b265"], [0.7, "#c07d38"], [1, "#8a4b18"]], 0.45, 0.4, 0.6)}`;
  let inner = shadow(10, 20, 200, 190, 0.45);
  inner += `<g filter="url(#wobble)">`;
  inner += `<circle r="180" fill="url(#${id}-g)"/>`;
  const strands = [
    "M-120 -60 C-40 -170 120 -130 130 -20 C140 90 20 150 -60 110 C-140 70 -110 -40 -20 -40 C60 -40 70 50 10 60",
    "M-150 40 C-160 -80 -60 -150 40 -140 C150 -120 170 20 110 90",
    "M-40 150 C-150 130 -170 20 -120 -40",
  ];
  for (const s of strands) {
    inner += `<path d="${s}" stroke="#8b4c1a" stroke-width="30" fill="none" stroke-linecap="round" opacity="0.35"/>`;
    inner += `<path d="${s}" stroke="#f0c07a" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.5" transform="translate(-4 -6)"/>`;
  }
  inner += scatter(p.r, 55, -150, -150, 300, 300, "#fffaf0", [4, 7], [0.85, 1]);
  inner += scatter(p.r, 30, -140, -140, 280, 280, "#4a3522", [1.2, 2.2], [0.5, 0.8]);
  inner += `</g>`;
  return { defs, body: place(p, inner) };
}

/** Plum and custard danish, top-down. */
export function danish(p: Placed): Art {
  const id = p.id;
  const defs = `
    ${radial(`${id}-g`, [[0, "#f2c070"], [0.75, "#c9853a"], [1, "#8a4b18"]], 0.5, 0.45, 0.6)}
    ${radial(`${id}-c`, [[0, "#fbe7a4"], [1, "#e9bf5b"]], 0.45, 0.4, 0.6)}
    ${radial(`${id}-plum`, [[0, "#c8544f"], [0.55, "#8c2f47"], [1, "#4a1830"]], 0.4, 0.35, 0.7)}`;
  let inner = shadow(10, 20, 210, 200, 0.45);
  inner += `<g filter="url(#wobble)">`;
  inner += `<path d="M0 -200 C60 -150 120 -170 170 -150 C170 -90 200 -50 200 0 C160 40 180 110 150 160 C90 160 50 200 0 200 C-50 170 -110 180 -160 150 C-160 90 -200 50 -200 0 C-170 -50 -190 -110 -150 -160 C-90 -160 -50 -180 0 -200 Z" fill="url(#${id}-g)"/>`;
  for (let i = 0; i < 8; i++) inner += `<path d="M0 0 L${Math.cos((i * Math.PI) / 4) * 190} ${Math.sin((i * Math.PI) / 4) * 190}" stroke="#8a4b18" stroke-width="4" opacity="0.25"/>`;
  inner += `<circle r="112" fill="url(#${id}-c)"/>`;
  for (const [x, y, a] of [[-38, -30, -20], [42, -20, 25], [0, 45, 80]] as const) {
    inner += `<g transform="translate(${x} ${y}) rotate(${a})"><ellipse rx="52" ry="38" fill="url(#${id}-plum)"/><ellipse rx="44" ry="30" fill="none" stroke="#e7a07e" stroke-width="3" opacity="0.6"/><ellipse cx="-12" cy="-12" rx="16" ry="7" fill="#fff" opacity="0.35"/></g>`;
  }
  inner += `<ellipse cx="0" cy="0" rx="210" ry="210" fill="#fff" filter="url(#flour)" opacity="0.5"/>`;
  inner += `</g>`;
  return { defs, body: place(p, inner) };
}

/** A slice of loaf cake, three-quarter view. */
export function cakeSlice(p: Placed, kind: "banana" | "lemon"): Art {
  const id = p.id;
  const crumb = kind === "banana" ? ["#d19a5b", "#a86d33"] : ["#f6db86", "#e2b653"];
  const defs = `${linear(`${id}-face`, [[0, crumb[0]], [1, crumb[1]]])}`;
  let inner = shadow(0, 110, 240, 30, 0.45);
  inner += `<g filter="url(#wobbleSoft)">`;
  inner += `<path d="M-220 -40 L-140 -110 L230 -110 L150 -40 Z" fill="${kind === "banana" ? "#6b3b15" : "#d19a45"}"/>`;
  inner += `<path d="M150 -40 L230 -110 L230 40 L150 110 Z" fill="${kind === "banana" ? "#5a3011" : "#c08638"}"/>`;
  inner += `<path d="M-220 -40 L150 -40 L150 110 L-220 110 Z" fill="url(#${id}-face)"/>`;
  inner += `<path d="M-220 -40 L150 -40" stroke="${kind === "banana" ? "#4a2a10" : "#b47a30"}" stroke-width="12" stroke-linecap="round"/>`;
  inner += scatter(p.r, 90, -210, -30, 350, 130, kind === "banana" ? "#6b3b15" : "#fff4c8", [1.5, 3.5], [0.4, 0.8]);
  if (kind === "banana") {
    inner += `<ellipse cx="40" cy="-80" rx="60" ry="18" fill="#f0d27e" stroke="#b58a3a" stroke-width="3"/>`;
  } else {
    inner += `<path d="M-200 -46 C-150 -80 -80 -60 -40 -90 C0 -110 60 -80 120 -100 C160 -110 200 -100 225 -106" stroke="#fffaf0" stroke-width="12" fill="none" stroke-linecap="round" opacity="0.95"/>`;
    inner += `<path d="M-120 -44 l0 26 M40 -44 l0 34 M110 -44 l0 18" stroke="#fffaf0" stroke-width="9" stroke-linecap="round"/>`;
  }
  inner += `</g>`;
  return { defs, body: place(p, inner) };
}

/** Whole apple and cider cake, top-down. */
export function appleCake(p: Placed): Art {
  const id = p.id;
  const defs = `${radial(`${id}-g`, [[0, "#e7b66b"], [0.85, "#c58940"], [1, "#8f5520"]], 0.5, 0.45, 0.55)}`;
  let inner = shadow(10, 20, 290, 290, 0.4);
  inner += `<circle r="300" fill="#f4efe3"/><circle r="300" fill="none" stroke="#d9cfbb" stroke-width="10"/>`;
  inner += `<g filter="url(#wobbleSoft)"><circle r="240" fill="url(#${id}-g)"/>`;
  for (let ring = 0; ring < 2; ring++) {
    const n = ring === 0 ? 14 : 8;
    const rad = ring === 0 ? 165 : 80;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 360;
      inner += `<g transform="rotate(${a}) translate(${rad} 0) rotate(70)"><path d="M-46 0 C-40 -20 40 -20 46 0 C30 8 -30 8 -46 0 Z" fill="#f6e6b8" stroke="#b33a2a" stroke-width="4"/></g>`;
    }
  }
  inner += scatter(p.r, 90, -230, -230, 460, 460, "#9a5b22", [2, 4], [0.4, 0.8]);
  inner += `<circle r="240" fill="none" stroke="#7d4718" stroke-width="6" opacity="0.4"/></g>`;
  return { defs, body: place(p, inner) };
}

/** Choc chunk cookie, top-down. */
export function cookie(p: Placed, kind: "choc" | "flapjack" = "choc"): Art {
  const id = p.id;
  if (kind === "flapjack") {
    const defs = `${radial(`${id}-g`, [[0, "#dca75c"], [1, "#9c6428"]], 0.5, 0.4, 0.7)}`;
    let inner = shadow(10, 20, 230, 150, 0.45);
    inner += `<g filter="url(#wobble)"><rect x="-220" y="-140" width="440" height="280" rx="26" fill="url(#${id}-g)"/>`;
    inner += scatter(p.r, 180, -210, -130, 420, 260, "#f0d49a", [4, 9], [0.6, 0.95]);
    inner += scatter(p.r, 80, -210, -130, 420, 260, "#7a4a1c", [2, 5], [0.3, 0.6]);
    inner += scatter(p.r, 50, -210, -130, 420, 260, "#f6ebcf", [1.5, 2.5], [0.8, 1]);
    inner += `</g>`;
    return { defs, body: place(p, inner) };
  }
  const defs = `${radial(`${id}-g`, [[0, "#e2ad63"], [0.8, "#bf7f3c"], [1, "#8e5220"]], 0.48, 0.45, 0.55)}`;
  let inner = shadow(10, 20, 205, 195, 0.45);
  inner += `<g filter="url(#wobble)"><circle r="200" fill="url(#${id}-g)"/>`;
  for (let i = 0; i < 12; i++) {
    const x = between(p.r, -140, 140);
    const y = between(p.r, -140, 140);
    const s = between(p.r, 16, 30);
    inner += `<path d="M${x} ${y} l${s} ${-s * 0.3} l${s * 0.3} ${s} l${-s * 0.9} ${s * 0.4} Z" fill="#3a1e0f"/>`;
  }
  inner += scatter(p.r, 30, -170, -170, 340, 340, "#ffffff", [2, 4], [0.85, 1]);
  inner += `<path d="M-150 -60 C-100 -20 -40 -60 20 -30 C80 0 130 -30 160 10" stroke="#8e5220" stroke-width="4" fill="none" opacity="0.4"/>`;
  inner += `</g>`;
  return { defs, body: place(p, inner) };
}

/** A cup of coffee, top-down, on a saucer. */
export function cup(p: Placed, kind: "flat" | "oat" | "filter" | "chai"): Art {
  const id = p.id;
  const liquid =
    kind === "filter"
      ? [["#4a2b17", 0], ["#24140a", 1]]
      : kind === "chai"
        ? [["#d8ad7c", 0], ["#b07d4b", 1]]
        : [["#a8703f", 0], ["#6b3c1b", 1]];
  const defs = `
    ${radial(`${id}-liq`, [[0, liquid[0][0] as string], [1, liquid[1][0] as string]], 0.45, 0.4, 0.6)}
    ${radial(`${id}-cer`, [[0, "#fffdf7"], [0.8, "#f1ebde"], [1, "#d8cdb8"]], 0.4, 0.35, 0.65)}`;
  let inner = shadow(14, 24, 250, 250, 0.35);
  inner += `<circle r="250" fill="url(#${id}-cer)"/><circle r="200" fill="none" stroke="#d8cdb8" stroke-width="4"/>`;
  inner += shadow(10, 14, 170, 170, 0.35, true);
  inner += `<rect x="150" y="-26" width="110" height="52" rx="26" fill="url(#${id}-cer)" stroke="#d8cdb8" stroke-width="3"/>`;
  inner += `<circle r="165" fill="url(#${id}-cer)"/><circle r="140" fill="url(#${id}-liq)"/>`;
  if (kind === "flat" || kind === "oat") {
    inner += `<g filter="url(#wobbleSoft)" fill="#fbf1de" opacity="0.95">`;
    if (kind === "flat") {
      inner += `<path d="M0 70 C-40 30 -80 0 -70 -40 C-60 -75 -15 -75 0 -40 C15 -75 60 -75 70 -40 C80 0 40 30 0 70 Z"/>`;
      inner += `<path d="M0 70 L0 110" stroke="#fbf1de" stroke-width="6"/>`;
    } else {
      for (const [y, s] of [[-60, 0.7], [-10, 0.85], [45, 1]] as const)
        inner += `<path transform="translate(0 ${y}) scale(${s})" d="M-60 0 C-60 -30 60 -30 60 0 C40 -8 -40 -8 -60 0 Z"/>`;
      inner += `<path d="M0 -80 L0 100" stroke="#fbf1de" stroke-width="5"/>`;
    }
    inner += `</g>`;
    inner += `<circle r="140" fill="none" stroke="#c88b56" stroke-width="10" opacity="0.5"/>`;
  } else if (kind === "chai") {
    inner += scatter(p.r, 60, -90, -90, 180, 180, "#7a4a22", [1.2, 3], [0.5, 0.9]);
    inner += `<circle r="140" fill="none" stroke="#f3dfbf" stroke-width="12" opacity="0.6"/>`;
  } else {
    inner += `<ellipse cx="-40" cy="-50" rx="60" ry="22" fill="#fff" opacity="0.18" transform="rotate(-30 -40 -50)"/>`;
  }
  return { defs, body: place(p, inner) };
}

/** Orange juice in a bottle-glass, three-quarter view, with half an orange. */
export function juice(p: Placed): Art {
  const id = p.id;
  const defs = `
    ${linear(`${id}-j`, [[0, "#ffb640"], [1, "#e97a1c"]], 0, 0, 1, 0)}
    ${radial(`${id}-o`, [[0, "#ffd27a"], [0.8, "#f59a2a"], [1, "#d9731a"]], 0.5, 0.5, 0.55)}`;
  let inner = shadow(0, 190, 120, 26, 0.4) + shadow(190, 170, 110, 26, 0.4);
  inner += `<g filter="url(#wobbleSoft)">`;
  inner += `<path d="M-100 -200 L100 -200 L85 180 C84 192 70 200 55 200 L-55 200 C-70 200 -84 192 -85 180 Z" fill="#fff" opacity="0.35" stroke="#d8cdb8" stroke-width="4"/>`;
  inner += `<path d="M-94 -120 L94 -120 L85 180 C84 192 70 198 55 198 L-55 198 C-70 198 -84 192 -85 180 Z" fill="url(#${id}-j)"/>`;
  inner += `<ellipse cx="0" cy="-120" rx="94" ry="16" fill="#ffc861"/>`;
  inner += `<path d="M-70 -110 L-60 170" stroke="#fff" stroke-width="10" opacity="0.35" stroke-linecap="round"/>`;
  inner += `<ellipse cx="0" cy="-200" rx="100" ry="18" fill="none" stroke="#d8cdb8" stroke-width="4"/>`;
  inner += `<g transform="translate(200 120)"><ellipse rx="100" ry="70" fill="#e67d1d"/><ellipse cy="-8" rx="92" ry="58" fill="url(#${id}-o)"/>`;
  for (let i = 0; i < 10; i++) inner += `<path d="M0 -8 L${Math.cos((i * Math.PI) / 5) * 80} ${Math.sin((i * Math.PI) / 5) * 50 - 8}" stroke="#fff3cf" stroke-width="3" opacity="0.8"/>`;
  inner += `<ellipse cy="-8" rx="14" ry="10" fill="#fff3cf"/></g>`;
  inner += `</g>`;
  return { defs, body: place(p, inner) };
}

/** A wheat stalk for scattering around scenes. */
export function wheatStalk(p: Placed): Art {
  let inner = `<path d="M0 0 C4 -120 8 -240 14 -330" stroke="#c9a15e" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  for (let i = 0; i < 8; i++) {
    const y = -200 - i * 17;
    const x = 10 + i * 0.6;
    inner += `<ellipse cx="${x - 12}" cy="${y}" rx="8" ry="15" fill="#e0bd73" stroke="#a97f3d" stroke-width="2" transform="rotate(-28 ${x - 12} ${y})"/>`;
    inner += `<ellipse cx="${x + 12}" cy="${y - 6}" rx="8" ry="15" fill="#e7c67f" stroke="#a97f3d" stroke-width="2" transform="rotate(28 ${x + 12} ${y - 6})"/>`;
    inner += `<path d="M${x - 16} ${y - 12} l-18 -26 M${x + 16} ${y - 18} l18 -26" stroke="#c9a15e" stroke-width="1.5"/>`;
  }
  return { defs: "", body: place(p, `<g filter="url(#wobbleSoft)">${inner}</g>`) };
}
