/** Larger painted scenes: hero bench, the two shops, the workshop, the oven and Instagram tiles. */
import { between, doc, flourCloud, linear, linen, radial, rng, scatter, shadow, woodPlanks, type Rand } from "./lib";
import * as O from "./objects";

type Scene = { file: string; width: number; quality?: number; svg: () => string };

const join = (parts: { defs: string; body: string }[]) => ({
  defs: parts.map((p) => p.defs).join(""),
  body: parts.map((p) => p.body).join(""),
});

/** A cut loaf face showing an open crumb. */
function crumbFace(x: number, y: number, s: number, r: Rand, id: string) {
  const defs = `${radial(`${id}-c`, [[0, "#f6e6c4"], [1, "#e2c38f"]], 0.5, 0.45, 0.6)}`;
  let body = shadow(x + 10, y + 20, 300 * s, 210 * s, 0.4);
  body += `<g transform="translate(${x} ${y}) scale(${s})" filter="url(#wobbleSoft)">`;
  body += `<path d="M-300 40 C-300 -110 -160 -200 0 -200 C160 -200 300 -110 300 40 C300 130 160 190 0 190 C-160 190 -300 130 -300 40 Z" fill="#6e3d17"/>`;
  body += `<path d="M-272 40 C-272 -95 -145 -175 0 -175 C145 -175 272 -95 272 40 C272 115 145 166 0 166 C-145 166 -272 115 -272 40 Z" fill="url(#${id}-c)"/>`;
  for (let i = 0; i < 70; i++) {
    const hx = between(r, -240, 240);
    const hy = between(r, -150, 140);
    if ((hx / 260) ** 2 + ((hy - 10) / 170) ** 2 > 0.9) continue;
    const rx = between(r, 4, 22);
    body += `<ellipse cx="${hx}" cy="${hy}" rx="${rx}" ry="${rx * between(r, 0.5, 0.9)}" fill="#c9a26a" opacity="0.8" transform="rotate(${between(r, -30, 30)} ${hx} ${hy})"/>`;
    body += `<ellipse cx="${hx}" cy="${hy - 2}" rx="${rx * 0.8}" ry="${rx * 0.4}" fill="#a57c45" opacity="0.5"/>`;
  }
  body += `</g>`;
  return { defs, body };
}

function bowl(x: number, y: number, s: number, fill: string, id: string) {
  const defs = `${radial(`${id}-b`, [[0, "#fbf6ea"], [0.85, "#efe6d2"], [1, "#cdbf9f"]], 0.45, 0.4, 0.6)}`;
  let body = shadow(x + 10, y + 16, 150 * s, 150 * s, 0.35);
  body += `<g transform="translate(${x} ${y}) scale(${s})"><circle r="150" fill="url(#${id}-b)"/><circle r="118" fill="${fill}"/>`;
  body += `<circle r="118" fill="#fff" filter="url(#flour)" opacity="0.6"/><circle r="150" fill="none" stroke="#bfae8b" stroke-width="4"/></g>`;
  return { defs, body };
}

function hand(x: number, y: number, s: number, rot: number, flip: boolean, id: string) {
  const skin = linear(`${id}-skin`, [[0, "#c98f66"], [1, "#a8704b"]], 0, 0, 0, 1);
  const sleeve = linear(`${id}-sl`, [[0, "#6f8a9a"], [1, "#4d6675"]], 0, 0, 1, 0);
  const sx = flip ? -1 : 1;
  let body = `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s * sx} ${s})" filter="url(#wobbleSoft)">`;
  body += shadow(20, 30, 120, 170, 0.3);
  body += `<path d="M-70 420 L-60 140 C-58 110 58 110 60 140 L70 420 Z" fill="url(#${id}-skin)"/>`;
  body += `<path d="M-95 460 L-78 250 C-74 225 74 225 78 250 L95 460 Z" fill="url(#${id}-sl)"/>`;
  body += `<path d="M-80 262 C-30 248 30 248 80 262" stroke="#3d5260" stroke-width="10" fill="none"/>`;
  body += `<path d="M-72 150 C-100 60 -90 -60 -40 -110 C-10 -140 40 -135 62 -100 C90 -55 88 60 70 150 Z" fill="url(#${id}-skin)"/>`;
  for (let i = 0; i < 4; i++) {
    const fx = -48 + i * 30;
    body += `<path d="M${fx} -60 C${fx - 4} -120 ${fx + 22} -140 ${fx + 24} -80" stroke="#8f5a38" stroke-width="3" fill="none" opacity="0.5"/>`;
  }
  body += `<path d="M-72 40 C-120 10 -130 -50 -100 -70 C-80 -84 -60 -60 -58 -20" fill="url(#${id}-skin)" stroke="#8f5a38" stroke-width="3" stroke-opacity="0.4"/>`;
  body += `<ellipse cx="-10" cy="-40" rx="40" ry="60" fill="#fff" opacity="0.08"/>`;
  body += `<ellipse cx="0" cy="-60" rx="80" ry="90" fill="#fff" filter="url(#flour)" opacity="0.45"/>`;
  body += `</g>`;
  return { defs: skin + sleeve, body };
}

export const scenes: Scene[] = [
  {
    file: "hero-loaves.webp",
    width: 1400,
    quality: 80,
    svg: () => {
      const W = 1400;
      const H = 1200;
      const r = rng(7);
      const parts = join([
        O.wheatStalk({ x: 250, y: 420, s: 1.2, rot: 38, id: "w1", r }),
        O.wheatStalk({ x: 290, y: 440, s: 1.1, rot: 52, id: "w2", r }),
        bowl(1150, 250, 0.95, "#f4ecdc", "bw"),
        O.baguette({ x: 820, y: 960, s: 1.15, rot: -14, id: "bg", r }),
        O.batard({ x: 1020, y: 590, s: 1.25, rot: 16, id: "bt", r }, "spelt"),
        O.boule({ x: 560, y: 610, s: 1.75, rot: -6, id: "bl", r }, "golden"),
      ]);
      const body =
        woodPlanks(W, H, r, "#bf8f5f", 190) +
        linen(-120, 640, 620, 700, "#e9dfca", "cloth", 18) +
        flourCloud(420, 330, 360, 150, "f1") +
        flourCloud(980, 820, 300, 110, "f2") +
        scatter(r, 220, 100, 180, 1200, 900, "#fbf6ea", [1.2, 3.5], [0.5, 0.95]) +
        parts.body +
        scatter(r, 40, 300, 780, 700, 300, "#9a5f28", [2, 5], [0.6, 0.9]);
      return doc(W, H, parts.defs, body, 17);
    },
  },
  {
    file: "shop-mill-lane.webp",
    width: 1200,
    svg: () => {
      const W = 1200;
      const H = 900;
      const r = rng(21);
      const defs = `
        ${linear("sky", [[0, "#f6e8cb"], [1, "#f0dbb6"]])}
        ${linear("glass", [[0, "#f8d98f"], [1, "#e9b865"]])}
        ${linear("green", [[0, "#48644f"], [1, "#344a3a"]])}
        <pattern id="bricks" width="60" height="30" patternUnits="userSpaceOnUse"><rect width="60" height="30" fill="#b86d4c"/><path d="M0 0.5 H60 M0 15.5 H60 M30 0 V15 M0 15 V30 M60 15 V30" stroke="#8f4f33" stroke-width="2"/></pattern>
        <pattern id="awning" width="80" height="10" patternUnits="userSpaceOnUse"><rect width="40" height="10" fill="#8fa37e"/><rect x="40" width="40" height="10" fill="#f3eadb"/></pattern>`;
      let b = `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
      b += `<g filter="url(#wobbleSoft)"><rect x="60" y="0" width="1080" height="780" fill="url(#bricks)"/>`;
      b += `<rect x="330" y="40" width="540" height="160" rx="6" fill="#e9dcc2" stroke="#fff" stroke-width="14"/><path d="M600 40 V200 M330 120 H870" stroke="#fff" stroke-width="10"/>`;
      b += `<rect x="90" y="260" width="1020" height="520" fill="url(#green)"/>`;
      b += `<rect x="130" y="280" width="940" height="80" rx="6" fill="#2d3f32"/>`;
      b += `<g transform="translate(600 320)" stroke="#e8c677" stroke-width="5" fill="none" stroke-linecap="round"><path d="M-8 30 C-6 0 -2 -20 4 -34"/><path d="M-4 0 C-24 -4 -30 -20 -26 -30 C-12 -26 -4 -14 -4 0"/><path d="M-2 -16 C18 -20 24 -34 20 -44 C8 -38 0 -28 -2 -16"/><path d="M-60 0 H-160 M60 0 H160"/></g>`;
      b += `<path d="M110 370 L1090 370 L1130 450 L70 450 Z" fill="url(#awning)" transform="rotate(0)"/>`;
      b += `<path d="M70 450 Q100 470 130 450 T190 450 T250 450 T310 450 T370 450 T430 450 T490 450 T550 450 T610 450 T670 450 T730 450 T790 450 T850 450 T910 450 T970 450 T1030 450 T1090 450 T1130 450" fill="#8fa37e" stroke="#6f845f" stroke-width="3"/>`;
      b += `<rect x="140" y="480" width="620" height="280" fill="url(#glass)"/>`;
      for (const y of [560, 650, 735]) {
        b += `<rect x="150" y="${y}" width="600" height="8" fill="#8b5a2b"/>`;
        for (let x = 175; x < 740; x += between(r, 60, 90)) {
          const w = between(r, 40, 70);
          b += `<ellipse cx="${x}" cy="${y - 16}" rx="${w / 2}" ry="${between(r, 14, 22)}" fill="${r() > 0.5 ? "#b8773a" : "#8f5427"}"/><path d="M${x - w / 4} ${y - 22} q${w / 4} -8 ${w / 2} 0" stroke="#f1d7a4" stroke-width="3" fill="none"/>`;
        }
      }
      b += `<rect x="140" y="480" width="620" height="280" fill="#fff" opacity="0.08"/><path d="M180 500 L300 740 M240 500 L360 740" stroke="#fff" stroke-width="16" opacity="0.18"/>`;
      b += `<rect x="130" y="470" width="640" height="300" fill="none" stroke="#2d3f32" stroke-width="18"/><path d="M450 470 V770" stroke="#2d3f32" stroke-width="12"/>`;
      b += `<rect x="830" y="480" width="220" height="300" fill="#2d3f32"/><rect x="860" y="505" width="160" height="150" fill="url(#glass)" opacity="0.9"/><circle cx="1005" cy="690" r="8" fill="#e8c677"/>`;
      b += `</g>`;
      b += `<rect x="0" y="780" width="${W}" height="${H - 780}" fill="#cfc3aa"/>` + scatter(r, 80, 0, 790, W, 110, "#b2a488", [2, 6], [0.3, 0.6]);
      b += `<path d="M0 790 H1200" stroke="#9c8f74" stroke-width="6"/>`;
      b += `<g transform="translate(880 830)" filter="url(#wobbleSoft)">${shadow(0, 60, 110, 20, 0.35)}<path d="M-90 60 L-60 -150 L60 -150 L90 60" fill="#7a5230"/><rect x="-66" y="-140" width="132" height="170" rx="6" fill="#232b26"/><path d="M-40 -110 C-20 -118 20 -112 40 -116 M-44 -80 C-10 -84 20 -78 44 -82 M-30 -50 C0 -54 20 -48 36 -52 M-40 -16 C-10 -20 20 -14 40 -18" stroke="#f3eedf" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.85"/></g>`;
      b += `<g transform="translate(120 800)" filter="url(#wobble)">${shadow(0, 40, 90, 18, 0.35)}<path d="M-50 40 L-40 -20 L40 -20 L50 40 Z" fill="#b8683f"/><circle cx="-20" cy="-60" r="50" fill="#6f845f"/><circle cx="30" cy="-80" r="55" fill="#8fa37e"/><circle cx="0" cy="-120" r="40" fill="#7c9269"/></g>`;
      return doc(W, H, defs, b, 23);
    },
  },
  {
    file: "shop-harbour-street.webp",
    width: 1200,
    svg: () => {
      const W = 1200;
      const H = 900;
      const r = rng(33);
      const defs = `
        ${linear("wall", [[0, "#f1e4ca"], [1, "#e6d4b2"]])}
        ${linear("sea", [[0, "#cfe1dc"], [0.45, "#a9c9c8"], [1, "#7fa9ad"]])}
        ${linear("table", [[0, "#b27d4b"], [1, "#8a5a31"]])}
        ${radial("lamp", [[0, "#ffe7a8", 0.9], [1, "#ffe7a8", 0]], 0.5, 0.5, 0.5)}`;
      let b = `<rect width="${W}" height="${H}" fill="url(#wall)"/>`;
      b += `<g filter="url(#wobbleSoft)">`;
      b += `<rect x="70" y="120" width="480" height="420" rx="10" fill="url(#sea)"/>`;
      b += `<path d="M70 330 C160 320 240 336 330 328 C420 320 480 334 550 326 L550 540 L70 540 Z" fill="#6c989d" opacity="0.6"/>`;
      b += `<path d="M130 300 l40 -8 l40 8 Z M380 290 l26 -6 l26 6 Z" fill="#fff" opacity="0.8"/><path d="M170 292 V250 L200 285 Z" fill="#f3eedf"/>`;
      b += `<rect x="70" y="120" width="480" height="420" rx="10" fill="none" stroke="#f7f1e5" stroke-width="22"/><path d="M310 120 V540 M70 330 H550" stroke="#f7f1e5" stroke-width="14"/>`;
      b += `<rect x="640" y="140" width="500" height="420" fill="#d7c29d" opacity="0.5"/>`;
      for (const y of [240, 360, 480]) {
        b += `<rect x="640" y="${y}" width="500" height="12" fill="#8b5a2b"/>`;
        for (let x = 670; x < 1120; x += between(r, 70, 100)) {
          const w = between(r, 50, 80);
          b += `<ellipse cx="${x}" cy="${y - 22}" rx="${w / 2}" ry="${between(r, 18, 26)}" fill="${r() > 0.5 ? "#b8773a" : "#8f5427"}"/><path d="M${x - w / 4} ${y - 30} q${w / 4} -10 ${w / 2} 0" stroke="#f1d7a4" stroke-width="3" fill="none"/>`;
        }
      }
      for (const x of [300, 640, 960]) {
        b += `<path d="M${x} 0 V90" stroke="#3e2c1c" stroke-width="3"/><path d="M${x - 60} 150 C${x - 60} 110 ${x - 30} 90 ${x} 90 C${x + 30} 90 ${x + 60} 110 ${x + 60} 150 Z" fill="#3e4a40"/><ellipse cx="${x}" cy="160" rx="200" ry="140" fill="url(#lamp)"/>`;
      }
      b += `<path d="M0 620 L1200 620 L1200 900 L0 900 Z" fill="#9c7a55"/>`;
      b += `<path d="M120 640 L1080 640 L1200 820 L0 820 Z" fill="url(#table)"/><path d="M0 820 L1200 820 L1200 850 L0 850 Z" fill="#6b4423"/>`;
      for (let i = 0; i < 6; i++) b += `<path d="M${140 + i * 10} ${660 + i * 30} L${1060 - i * 10} ${660 + i * 30}" stroke="#6b4423" stroke-width="2" opacity="0.25"/>`;
      b += `</g>`;
      const parts = join([
        O.cup({ x: 330, y: 720, s: 0.28, id: "c1", r }, "flat"),
        O.cup({ x: 820, y: 700, s: 0.26, id: "c2", r }, "filter"),
        O.croissant({ x: 560, y: 730, s: 0.35, rot: -8, id: "cr", r }),
      ]);
      b += parts.body;
      return doc(W, H, defs + parts.defs, b, 31);
    },
  },
  {
    file: "workshop-hands.webp",
    width: 1200,
    svg: () => {
      const W = 1200;
      const H = 900;
      const r = rng(44);
      const defs = `${radial("dough", [[0, "#fbf0da"], [0.7, "#efdcb6"], [1, "#d9bf8f"]], 0.42, 0.38, 0.6)}`;
      const hands = [hand(470, 560, 0.85, -22, false, "hl"), hand(730, 560, 0.85, 22, true, "hr")];
      let b = woodPlanks(W, H, r, "#d1a676", 180);
      b += flourCloud(600, 460, 480, 300, "fl1") + flourCloud(250, 200, 200, 100, "fl2");
      b += scatter(r, 300, 60, 60, 1080, 780, "#fbf6ea", [1, 3.5], [0.5, 0.95]);
      b += `<g transform="translate(1000 180) rotate(20)" filter="url(#wobbleSoft)">${shadow(0, 20, 110, 80, 0.3)}<rect x="-100" y="-70" width="200" height="140" rx="16" fill="#c9ced1"/><rect x="-100" y="-70" width="200" height="40" rx="12" fill="#8b5a2b"/></g>`;
      b += bowl(200, 720, 0.9, "#f4ecdc", "bw").body;
      b += `${shadow(600, 470, 300, 200, 0.4)}<path d="M330 450 C320 330 450 250 600 250 C760 250 880 330 870 450 C860 560 740 630 600 630 C450 630 340 560 330 450 Z" fill="url(#dough)" filter="url(#wobble)"/>`;
      b += `<path d="M420 360 C480 320 560 310 640 320" stroke="#fff" stroke-width="16" opacity="0.4" fill="none" stroke-linecap="round" filter="url(#blur3)"/>`;
      b += hands.map((h) => h.body).join("");
      return doc(W, H, defs + bowl(0, 0, 1, "", "bw").defs + hands.map((h) => h.defs).join(""), b, 41);
    },
  },
  {
    file: "story-oven.webp",
    width: 1200,
    svg: () => {
      const W = 1200;
      const H = 1000;
      const r = rng(55);
      const defs = `
        ${radial("fire", [[0, "#fff1b8"], [0.35, "#ffb347"], [0.7, "#d9602b"], [1, "#6b2413"]], 0.5, 0.75, 0.6)}
        ${linear("wall2", [[0, "#e9d8b8"], [1, "#d9c29a"]])}
        <pattern id="brick2" width="70" height="34" patternUnits="userSpaceOnUse"><rect width="70" height="34" fill="#b5613f"/><path d="M0 0.5 H70 M0 17.5 H70 M35 0 V17 M0 17 V34 M70 17 V34" stroke="#7d3c25" stroke-width="3"/></pattern>`;
      let b = `<rect width="${W}" height="${H}" fill="url(#wall2)"/>`;
      b += `<g filter="url(#wobbleSoft)"><path d="M150 760 C150 380 350 170 600 170 C850 170 1050 380 1050 760 Z" fill="url(#brick2)"/>`;
      b += `<path d="M150 760 C150 380 350 170 600 170 C850 170 1050 380 1050 760" fill="none" stroke="#7d3c25" stroke-width="16"/>`;
      b += `<ellipse cx="600" cy="600" rx="420" ry="260" fill="#ffb347" opacity="0.25" filter="url(#glow)"/>`;
      b += `<path d="M390 760 C390 560 480 460 600 460 C720 460 810 560 810 760 Z" fill="url(#fire)"/>`;
      b += `<path d="M390 760 C390 560 480 460 600 460 C720 460 810 560 810 760" fill="none" stroke="#5e2d1a" stroke-width="20"/>`;
      for (let i = 0; i < 9; i++) {
        const a = Math.PI + (i / 8) * Math.PI;
        b += `<path d="M${600 + Math.cos(a) * 230} ${760 + Math.sin(a) * 320} L${600 + Math.cos(a) * 270} ${760 + Math.sin(a) * 360}" stroke="#7d3c25" stroke-width="6"/>`;
      }
      b += `<path d="M500 760 C520 700 560 690 560 640 C590 680 600 660 610 620 C650 680 690 700 700 760 Z" fill="#ffe08a" opacity="0.9"/>`;
      b += `<rect x="0" y="760" width="${W}" height="240" fill="#8b5a2b"/><rect x="0" y="760" width="${W}" height="18" fill="#6b4423"/></g>`;
      b += scatter(r, 60, 0, 780, W, 200, "#5e3a1c", [2, 6], [0.2, 0.4]);
      const loaves = join([
        O.boule({ x: 900, y: 880, s: 0.55, id: "l1", r }, "dark"),
        O.boule({ x: 1080, y: 900, s: 0.45, id: "l2", r }, "golden"),
        O.batard({ x: 250, y: 890, s: 0.55, rot: -6, id: "l3", r }, "spelt"),
      ]);
      const onPeel = O.boule({ x: 600, y: 700, s: 0.42, id: "l4", r }, "golden");
      b += `<g filter="url(#wobbleSoft)"><path d="M660 770 L1010 1010" stroke="#9a6a38" stroke-width="30" stroke-linecap="round"/><ellipse cx="600" cy="752" rx="170" ry="40" fill="#c89a62"/><ellipse cx="600" cy="746" rx="160" ry="32" fill="#d8ae78"/></g>`;
      b += onPeel.body + loaves.body;
      return doc(W, H, defs + loaves.defs + onPeel.defs, b, 51);
    },
  },
  // Instagram tiles
  {
    file: "insta/crumb.webp",
    width: 600,
    svg: () => {
      const r = rng(61);
      const c = crumbFace(420, 430, 1.05, r, "cf");
      const body = woodPlanks(800, 800, r, "#b98a5a", 200) + flourCloud(200, 200, 200, 100, "ff") + c.body;
      return doc(800, 800, c.defs, body, 61);
    },
  },
  {
    file: "insta/tray.webp",
    width: 600,
    svg: () => {
      const r = rng(62);
      const items = [] as { defs: string; body: string }[];
      let k = 0;
      for (let row = 0; row < 3; row++)
        for (let col = 0; col < 2; col++)
          items.push(O.croissant({ x: 230 + col * 340 + (row % 2) * 40, y: 170 + row * 230, s: 0.55, rot: between(r, -10, 10), id: `t${k++}`, r }));
      const j = join(items);
      const body = `<rect width="800" height="800" fill="#6d7074"/><rect x="30" y="30" width="740" height="740" rx="20" fill="#8a8e92"/>${scatter(r, 90, 40, 40, 720, 720, "#b0b4b8", [2, 8], [0.2, 0.4])}` + j.body;
      return doc(800, 800, j.defs, body, 62);
    },
  },
  {
    file: "insta/scoring.webp",
    width: 600,
    svg: () => {
      const r = rng(63);
      const defs = `${radial("dg", [[0, "#fbf1dc"], [1, "#e8d2a8"]], 0.45, 0.4, 0.6)}`;
      let body = woodPlanks(800, 800, r, "#c49468", 180) + flourCloud(400, 420, 380, 300, "fq");
      body += shadow(400, 420, 300, 300, 0.4);
      body += `<circle cx="400" cy="410" r="300" fill="#c9a36e"/>`;
      for (let i = 0; i < 6; i++) body += `<circle cx="400" cy="410" r="${290 - i * 40}" fill="none" stroke="#9a7442" stroke-width="10" opacity="0.6"/>`;
      body += `<circle cx="400" cy="410" r="235" fill="url(#dg)" filter="url(#wobbleSoft)"/><circle cx="400" cy="410" r="235" fill="#fff" filter="url(#flour)" opacity="0.9"/>`;
      body += `<path d="M260 470 C330 360 460 330 560 360" stroke="#b58b55" stroke-width="7" fill="none" stroke-linecap="round"/>`;
      body += `<g transform="translate(590 330) rotate(-35)"><rect x="-10" y="-8" width="200" height="16" rx="8" fill="#8b5a2b"/><rect x="-60" y="-12" width="60" height="24" rx="3" fill="#d4d8da"/></g>`;
      return doc(800, 800, defs, body, 63);
    },
  },
  {
    file: "insta/coffee.webp",
    width: 600,
    svg: () => {
      const r = rng(64);
      const j = join([O.cup({ x: 300, y: 330, s: 0.95, id: "c", r }, "flat"), O.knot({ x: 590, y: 580, s: 0.85, id: "k", r })]);
      const body = `<rect width="800" height="800" fill="#e3d3b4"/>${scatter(r, 160, 0, 0, 800, 800, "#c9b48f", [1, 3], [0.3, 0.6])}` + j.body;
      return doc(800, 800, j.defs, body, 64);
    },
  },
  {
    file: "insta/field.webp",
    width: 600,
    svg: () => {
      const r = rng(65);
      const defs = `${linear("sk", [[0, "#f6c98a"], [0.6, "#f7e2b4"], [1, "#f2d58a"]])}`;
      let body = `<rect width="800" height="800" fill="url(#sk)"/><circle cx="560" cy="360" r="90" fill="#fff4d4" opacity="0.9" filter="url(#blur8)"/>`;
      body += `<path d="M0 520 C200 480 400 540 800 490 L800 800 L0 800 Z" fill="#d7b06a" filter="url(#wobbleSoft)"/>`;
      body += `<path d="M0 600 C220 570 480 620 800 580 L800 800 L0 800 Z" fill="#c69a53" filter="url(#wobbleSoft)"/>`;
      const stalks = [] as { defs: string; body: string }[];
      for (let i = 0; i < 14; i++) stalks.push(O.wheatStalk({ x: 30 + i * 58 + between(r, -15, 15), y: 820, s: between(r, 1.1, 1.6), rot: between(r, -8, 8), id: `s${i}`, r }));
      body += join(stalks).body;
      return doc(800, 800, defs, body, 65);
    },
  },
  {
    file: "insta/starter.webp",
    width: 600,
    svg: () => {
      const r = rng(66);
      const defs = `${linear("jar", [[0, "#ffffff", 0.5], [1, "#e9e2d2", 0.4]], 0, 0, 1, 0)}${linear("st", [[0, "#f3e6c9"], [1, "#e3cfa6"]])}`;
      let body = woodPlanks(800, 800, r, "#c49468", 200);
      body += `<rect x="0" y="0" width="800" height="330" fill="#efe3cb"/>`;
      body += shadow(400, 700, 200, 30, 0.45);
      body += `<g filter="url(#wobbleSoft)"><path d="M250 250 L550 250 L560 690 C560 710 540 720 520 720 L280 720 C260 720 240 710 240 690 Z" fill="url(#jar)" stroke="#cfc6b2" stroke-width="5"/>`;
      body += `<path d="M246 380 C300 350 360 390 420 360 C480 340 520 370 554 350 L560 690 C560 710 540 718 520 718 L280 718 C260 718 242 710 242 690 Z" fill="url(#st)"/>`;
      for (let i = 0; i < 40; i++) {
        const x = between(r, 270, 530);
        const y = between(r, 400, 690);
        const rr = between(r, 3, 12);
        body += `<circle cx="${x}" cy="${y}" r="${rr}" fill="#d4bb8a" stroke="#b89a64" stroke-width="1.5"/>`;
      }
      body += `<path d="M240 470 H560" stroke="#c9694a" stroke-width="10"/><rect x="236" y="200" width="328" height="56" rx="10" fill="#b0b5b8"/>`;
      body += `<path d="M280 280 L290 680" stroke="#fff" stroke-width="12" opacity="0.4" stroke-linecap="round"/></g>`;
      return doc(800, 800, defs, body, 66);
    },
  },
];
