/**
 * Tiny toolkit for the painted placeholder "photos". Everything is SVG, rendered to WebP by sharp.
 * The look is gouache on paper: soft gradients, wobbly edges, a little grain.
 */

export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

export type Rand = ReturnType<typeof rng>;

export const between = (r: Rand, a: number, b: number) => a + (b - a) * r();

/** Shared filters and gradients. Include once per document. */
export function baseDefs(seed = 3) {
  return `
  <filter id="wobble" x="-10%" y="-10%" width="120%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="${seed}" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <filter id="wobbleSoft" x="-10%" y="-10%" width="120%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="${seed + 1}" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="18"/>
  </filter>
  <filter id="shadowTight" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="7"/>
  </filter>
  <filter id="blur3" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur stdDeviation="3"/>
  </filter>
  <filter id="blur8" x="-30%" y="-30%" width="160%" height="160%">
    <feGaussianBlur stdDeviation="8"/>
  </filter>
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
    <feGaussianBlur stdDeviation="40"/>
  </filter>
  <!-- Brushy texture multiplied into whatever it's applied to. -->
  <filter id="brush" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.012 0.05" numOctaves="4" seed="${seed + 2}" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.22  0 0 0 0 0.1  0 0 0 -1.4 1.05" result="t"/>
    <feComposite in="t" in2="SourceGraphic" operator="in" result="ti"/>
    <feBlend in="ti" in2="SourceGraphic" mode="multiply"/>
  </filter>
  <!-- Flour dusting: pale speckle clipped to the shape it's applied to. -->
  <filter id="flour" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="3" seed="${seed + 5}" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 0.98  0 0 0 0 0.94  0 0 0 5 -2.6" result="w"/>
    <feComposite in="w" in2="SourceGraphic" operator="in"/>
  </filter>
  <filter id="grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="${seed + 9}" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.24  0 0 0 0 0.17  0 0 0 0 0.11  0 0 0 0.55 0" />
  </filter>
  <radialGradient id="vignette" cx="50%" cy="46%" r="75%">
    <stop offset="55%" stop-color="#3e2c1c" stop-opacity="0"/>
    <stop offset="100%" stop-color="#3e2c1c" stop-opacity="0.32"/>
  </radialGradient>
  <radialGradient id="light" cx="30%" cy="20%" r="80%">
    <stop offset="0%" stop-color="#fff6dc" stop-opacity="0.55"/>
    <stop offset="60%" stop-color="#fff6dc" stop-opacity="0"/>
  </radialGradient>`;
}

export function doc(w: number, h: number, defs: string, body: string, seed = 3) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>${baseDefs(seed)}${defs}</defs>
  ${body}
  <rect width="${w}" height="${h}" fill="url(#light)"/>
  <rect width="${w}" height="${h}" fill="url(#vignette)"/>
  <rect width="${w}" height="${h}" filter="url(#grain)" opacity="0.5"/>
</svg>`;
}

export function linear(id: string, stops: [number, string, number?][], x1 = 0, y1 = 0, x2 = 0, y2 = 1) {
  return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops
    .map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ""}/>`)
    .join("")}</linearGradient>`;
}

export function radial(id: string, stops: [number, string, number?][], cx = 0.5, cy = 0.5, r = 0.5, fx?: number, fy?: number) {
  return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"${fx !== undefined ? ` fx="${fx}" fy="${fy}"` : ""}>${stops
    .map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ""}/>`)
    .join("")}</radialGradient>`;
}

/** A soft contact shadow under an object. */
export function shadow(cx: number, cy: number, rx: number, ry: number, opacity = 0.35, tight = false) {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#2a1b0e" opacity="${opacity}" filter="url(#${tight ? "shadowTight" : "shadow"})"/>`;
}

/** Wood planks running horizontally, with grain lines. */
export function woodPlanks(w: number, h: number, r: Rand, base = "#b98a5a", plank = 150) {
  let out = `<rect width="${w}" height="${h}" fill="${base}"/>`;
  for (let y = 0; y < h; y += plank) {
    const tone = between(r, -0.08, 0.08);
    out += `<rect x="0" y="${y}" width="${w}" height="${plank}" fill="${tone > 0 ? "#fff" : "#000"}" opacity="${Math.abs(tone)}"/>`;
    for (let i = 0; i < 9; i++) {
      const gy = y + between(r, 8, plank - 8);
      const amp = between(r, 2, 7);
      out += `<path d="M0 ${gy} C${w * 0.25} ${gy - amp} ${w * 0.5} ${gy + amp} ${w * 0.75} ${gy - amp * 0.5} S${w} ${gy + amp} ${w + 10} ${gy}" stroke="#6b4423" stroke-width="${between(r, 0.8, 2.2)}" fill="none" opacity="${between(r, 0.12, 0.3)}"/>`;
    }
    out += `<rect x="0" y="${y + plank - 3}" width="${w}" height="3" fill="#4a2e16" opacity="0.35"/>`;
  }
  return `<g filter="url(#brush)">${out}</g>`;
}

/** Linen cloth: a soft colour with a faint weave. */
export function linen(x: number, y: number, w: number, h: number, colour: string, id: string, rotate = 0) {
  return `<pattern id="${id}-weave" width="6" height="6" patternUnits="userSpaceOnUse">
      <rect width="6" height="6" fill="${colour}"/>
      <path d="M0 0.5 H6 M0.5 0 V6" stroke="#000" stroke-opacity="0.06" stroke-width="1"/>
    </pattern>
    <g transform="rotate(${rotate} ${x + w / 2} ${y + h / 2})" filter="url(#wobbleSoft)">
      ${shadow(x + w / 2, y + h / 2 + 10, w / 2, h / 2, 0.18)}
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="url(#${id}-weave)"/>
      <path d="M${x + 14} ${y} V${y + h} M${x + w - 14} ${y} V${y + h}" stroke="#fff" stroke-opacity="0.5" stroke-width="3" stroke-dasharray="2 5"/>
    </g>`;
}

/** Scatter of flour dust / crumbs. */
export function scatter(r: Rand, n: number, x: number, y: number, w: number, h: number, colour: string, size: [number, number], opacity: [number, number] = [0.5, 0.9]) {
  let out = "";
  for (let i = 0; i < n; i++) {
    out += `<ellipse cx="${(x + r() * w).toFixed(1)}" cy="${(y + r() * h).toFixed(1)}" rx="${between(r, size[0], size[1]).toFixed(1)}" ry="${between(r, size[0] * 0.6, size[1] * 0.8).toFixed(1)}" fill="${colour}" opacity="${between(r, opacity[0], opacity[1]).toFixed(2)}" transform="rotate(${Math.floor(r() * 180)} ${(x + w / 2).toFixed(0)} ${(y + h / 2).toFixed(0)})"/>`;
  }
  return out;
}

/** A dusty cloud of flour on a surface. */
export function flourCloud(cx: number, cy: number, rx: number, ry: number, id: string) {
  return `<radialGradient id="${id}"><stop offset="0" stop-color="#fbf7ee" stop-opacity="0.95"/><stop offset="0.6" stop-color="#fbf7ee" stop-opacity="0.5"/><stop offset="1" stop-color="#fbf7ee" stop-opacity="0"/></radialGradient>
  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${id})" filter="url(#wobble)"/>`;
}
