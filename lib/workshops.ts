import type { ShopId } from "./shops";
import type { IllustrationName } from "@/components/illustrations/paths";

export type WorkshopType = {
  id: string;
  title: string;
  summary: string;
  details: string[];
  /** Price per seat in pence. */
  price: number;
  seats: number;
  duration: string;
  shop: ShopId;
  illo: IllustrationName;
};

export const WORKSHOP_TYPES: WorkshopType[] = [
  {
    id: "sourdough-basics",
    title: "Sourdough Basics",
    summary: "From starter to crackly crust. You'll mix, shape and score your own loaf, and take home a jar of our 11-year-old starter.",
    details: ["4 hours, 10am–2pm", "Lunch and coffee included", "Take home a loaf, dough and starter", "No experience needed"],
    price: 8500,
    seats: 8,
    duration: "4 hours",
    shop: "mill-lane",
    illo: "loaf",
  },
  {
    id: "croissants-at-home",
    title: "Croissants at Home",
    summary: "Lamination without the fear. Butter blocks, folds and shaping, with a tray of croissants and pains au chocolat to take away.",
    details: ["5 hours, 9:30am–2:30pm", "Lunch and coffee included", "Take home 12 pastries to bake", "Some baking experience helps"],
    price: 11000,
    seats: 6,
    duration: "5 hours",
    shop: "mill-lane",
    illo: "croissant",
  },
  {
    id: "rye-and-wild-grains",
    title: "Rye & Wild Grains",
    summary: "Dense, dark, delicious. Scandi rye, spelt and einkorn, and how heritage grains behave differently in the dough.",
    details: ["3½ hours, 2pm–5:30pm", "Tasting board with local cheese", "Take home a seeded rye", "Suits curious beginners"],
    price: 8000,
    seats: 8,
    duration: "3½ hours",
    shop: "harbour-street",
    illo: "wheat",
  },
];

export function getWorkshopType(id: string): WorkshopType | undefined {
  return WORKSHOP_TYPES.find((w) => w.id === id);
}

export const VOUCHER_AMOUNTS = [2500, 5000, 8500, 11000];
