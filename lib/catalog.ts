import type { AllergenDeclaration, AllergenId } from "./allergens";
import type { IllustrationName } from "@/components/illustrations/paths";

export const CATEGORIES = [
  { id: "breads", label: "Breads" },
  { id: "pastries", label: "Pastries" },
  { id: "cakes", label: "Cakes" },
  { id: "drinks", label: "Drinks for collection" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export type Product = {
  id: string;
  name: string;
  category: CategoryId;
  description: string;
  /** Price in pence. */
  price: number;
  illo: IllustrationName;
  contains: AllergenDeclaration[];
  mayContain: AllergenId[];
  /** Usual bake size per shop per day; the staff planner starts from this. */
  par: number;
  vegan?: boolean;
  /** Short handwritten note, e.g. "Baked at 5am!". Never essential information. */
  note?: string;
};

const wheat = { id: "gluten", detail: "wheat" } as const;

export const PRODUCTS: Product[] = [
  // Breads
  {
    id: "country-loaf",
    name: "Wildroot Country Loaf",
    category: "breads",
    description: "Our everyday sourdough. White, wholemeal and a little rye, fermented for 48 hours.",
    price: 520,
    illo: "loaf",
    contains: [{ id: "gluten", detail: "wheat, rye" }],
    mayContain: ["sesame"],
    par: 60,
    vegan: true,
    note: "Our bestseller",
  },
  {
    id: "seeded-rye",
    name: "Seeded Rye",
    category: "breads",
    description: "Dense, dark and tangy, packed with sunflower, pumpkin and sesame. Slices thin, keeps for a week.",
    price: 560,
    illo: "rye",
    contains: [{ id: "gluten", detail: "rye, wheat" }, { id: "sesame" }],
    mayContain: ["nuts"],
    par: 24,
    vegan: true,
  },
  {
    id: "baguette",
    name: "Sourdough Baguette",
    category: "breads",
    description: "Crackly crust, open crumb. Best eaten on the walk home.",
    price: 280,
    illo: "baguette",
    contains: [wheat],
    mayContain: ["sesame"],
    par: 40,
    vegan: true,
  },
  {
    id: "spelt-honey",
    name: "Spelt & Honey Batard",
    category: "breads",
    description: "Wholegrain spelt with local wildflower honey. Soft, nutty and slightly sweet.",
    price: 580,
    illo: "batard",
    contains: [{ id: "gluten", detail: "spelt, wheat" }],
    mayContain: ["sesame"],
    par: 18,
  },
  {
    id: "fig-walnut",
    name: "Fig & Walnut",
    category: "breads",
    description: "Dried figs and toasted walnuts in a wholemeal dough. Made for cheese.",
    price: 620,
    illo: "batard",
    contains: [{ id: "gluten", detail: "wheat" }, { id: "nuts", detail: "walnuts" }],
    mayContain: ["sesame"],
    par: 14,
    vegan: true,
  },
  {
    id: "focaccia",
    name: "Potato & Rosemary Focaccia",
    category: "breads",
    description: "A generous slab, dimpled with olive oil, sea salt and garden rosemary.",
    price: 400,
    illo: "focaccia",
    contains: [wheat],
    mayContain: ["sesame"],
    par: 16,
    vegan: true,
  },
  // Pastries
  {
    id: "croissant",
    name: "Butter Croissant",
    category: "pastries",
    description: "Three days in the making, 27 layers of cultured butter.",
    price: 260,
    illo: "croissant",
    contains: [wheat, { id: "milk" }, { id: "eggs" }],
    mayContain: ["nuts", "sesame"],
    par: 48,
    note: "Baked at 5am!",
  },
  {
    id: "pain-au-chocolat",
    name: "Pain au Chocolat",
    category: "pastries",
    description: "Croissant dough wrapped around two batons of 70% dark chocolate.",
    price: 290,
    illo: "painChoc",
    contains: [wheat, { id: "milk" }, { id: "eggs" }, { id: "soya" }],
    mayContain: ["nuts", "sesame"],
    par: 36,
  },
  {
    id: "cardamom-bun",
    name: "Cardamom Knot",
    category: "pastries",
    description: "Swedish-style knot with freshly ground cardamom and pearl sugar.",
    price: 320,
    illo: "bun",
    contains: [wheat, { id: "milk" }, { id: "eggs" }],
    mayContain: ["nuts", "sesame"],
    par: 36,
    note: "Weekend favourite",
  },
  {
    id: "almond-croissant",
    name: "Almond Croissant",
    category: "pastries",
    description: "Yesterday's croissant, twice baked with frangipane and toasted almonds.",
    price: 340,
    illo: "croissant",
    contains: [wheat, { id: "milk" }, { id: "eggs" }, { id: "nuts", detail: "almonds" }],
    mayContain: ["sesame"],
    par: 18,
  },
  {
    id: "plum-danish",
    name: "Plum & Custard Danish",
    category: "pastries",
    description: "Roasted Victoria plums on vanilla custard. Autumn only.",
    price: 330,
    illo: "danish",
    contains: [wheat, { id: "milk" }, { id: "eggs" }],
    mayContain: ["nuts", "sesame"],
    par: 20,
  },
  // Cakes
  {
    id: "banana-bread",
    name: "Banana Bread (slice)",
    category: "cakes",
    description: "Brown butter, dark muscovado and very ripe bananas.",
    price: 300,
    illo: "cake",
    contains: [wheat, { id: "milk" }, { id: "eggs" }],
    mayContain: ["nuts", "peanuts"],
    par: 20,
  },
  {
    id: "choc-cookie",
    name: "Brown Butter Choc Chunk Cookie",
    category: "cakes",
    description: "Crisp edges, fudgy middle, flaky salt on top.",
    price: 240,
    illo: "cookie",
    contains: [wheat, { id: "milk" }, { id: "eggs" }, { id: "soya" }],
    mayContain: ["nuts", "peanuts"],
    par: 30,
  },
  {
    id: "olive-oil-cake",
    name: "Lemon Olive Oil Cake (slice)",
    category: "cakes",
    description: "Light and fragrant with a sharp lemon drizzle. Dairy-free.",
    price: 340,
    illo: "cake",
    contains: [wheat, { id: "eggs" }],
    mayContain: ["nuts"],
    par: 16,
  },
  {
    id: "apple-cider-cake",
    name: "Apple & Cider Cake (whole)",
    category: "cakes",
    description: "Serves eight. Bramley apples, local cider and a crunchy demerara top. Order two days ahead if you can.",
    price: 2200,
    illo: "cake",
    contains: [wheat, { id: "milk" }, { id: "eggs" }, { id: "sulphites", detail: "cider" }],
    mayContain: ["nuts"],
    par: 4,
  },
  {
    id: "tahini-flapjack",
    name: "Oat & Tahini Flapjack",
    category: "cakes",
    description: "Chewy oats, date syrup and tahini. Vegan.",
    price: 260,
    illo: "cookie",
    contains: [{ id: "gluten", detail: "oats" }, { id: "sesame" }],
    mayContain: ["nuts", "peanuts"],
    par: 20,
    vegan: true,
  },
  // Drinks
  {
    id: "flat-white",
    name: "Flat White",
    category: "drinks",
    description: "Double shot of our house espresso. Made fresh when you arrive.",
    price: 330,
    illo: "cup",
    contains: [{ id: "milk" }],
    mayContain: [],
    par: 60,
  },
  {
    id: "oat-flat-white",
    name: "Oat Flat White",
    category: "drinks",
    description: "As above, with oat milk. Made fresh when you arrive.",
    price: 350,
    illo: "cup",
    contains: [{ id: "gluten", detail: "oats" }],
    mayContain: ["milk"],
    par: 40,
    vegan: true,
  },
  {
    id: "filter-coffee",
    name: "Batch Brew Filter",
    category: "drinks",
    description: "Seasonal single origin from our roaster down the road.",
    price: 280,
    illo: "cup",
    contains: [],
    mayContain: [],
    par: 60,
    vegan: true,
  },
  {
    id: "chai",
    name: "Spiced Chai Latte",
    category: "drinks",
    description: "House chai syrup with cinnamon, clove and ginger. Made fresh when you arrive.",
    price: 340,
    illo: "cup",
    contains: [{ id: "milk" }],
    mayContain: [],
    par: 30,
  },
  {
    id: "orange-juice",
    name: "Fresh Orange Juice",
    category: "drinks",
    description: "Squeezed that morning. 330ml bottle.",
    price: 320,
    illo: "juice",
    contains: [],
    mayContain: [],
    par: 20,
    vegan: true,
  },
];

/** The six most popular items, in order, for "Tomorrow's bake" on the home page. */
export const POPULAR = ["country-loaf", "croissant", "seeded-rye", "cardamom-bun", "baguette", "pain-au-chocolat"];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function productImage(id: string): string {
  return `/photos/products/${id}.webp`;
}
