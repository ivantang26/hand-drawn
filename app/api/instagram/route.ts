import { NextResponse } from "next/server";

/** Stand-in for the Instagram Basic Display feed: the latest six posts. */
const POSTS = [
  { id: "p1", image: "/photos/insta/crumb.webp", alt: "A halved country loaf showing an open, glossy crumb", caption: "That crumb, though." },
  { id: "p2", image: "/photos/insta/tray.webp", alt: "A baking tray of six golden croissants", caption: "5am tray, still warm" },
  { id: "p3", image: "/photos/insta/scoring.webp", alt: "Floured dough in a proving basket with a blade ready to score it", caption: "One confident slash" },
  { id: "p4", image: "/photos/insta/coffee.webp", alt: "A flat white with a heart in the foam next to a cardamom knot", caption: "Saturday, sorted" },
  { id: "p5", image: "/photos/insta/field.webp", alt: "Wheat stalks against a pale morning sky", caption: "Visiting the farm in Upcott" },
  { id: "p6", image: "/photos/insta/starter.webp", alt: "A jar of bubbly sourdough starter with a band marking how far it has risen", caption: "Doris, 11 years old" },
];

export function GET() {
  return NextResponse.json({ posts: POSTS }, { headers: { "Cache-Control": "public, max-age=600" } });
}
