/** The 14 allergens that UK food information rules require us to declare. */
export const ALLERGENS = [
  { id: "gluten", label: "Cereals containing gluten" , short: "Gluten" },
  { id: "crustaceans", label: "Crustaceans", short: "Crustaceans" },
  { id: "eggs", label: "Eggs", short: "Eggs" },
  { id: "fish", label: "Fish", short: "Fish" },
  { id: "peanuts", label: "Peanuts", short: "Peanuts" },
  { id: "soya", label: "Soya", short: "Soya" },
  { id: "milk", label: "Milk", short: "Milk" },
  { id: "nuts", label: "Tree nuts", short: "Tree nuts" },
  { id: "celery", label: "Celery", short: "Celery" },
  { id: "mustard", label: "Mustard", short: "Mustard" },
  { id: "sesame", label: "Sesame", short: "Sesame" },
  { id: "sulphites", label: "Sulphur dioxide and sulphites", short: "Sulphites" },
  { id: "lupin", label: "Lupin", short: "Lupin" },
  { id: "molluscs", label: "Molluscs", short: "Molluscs" },
] as const;

export type AllergenId = (typeof ALLERGENS)[number]["id"];

/** An allergen a product contains, with the specific source where the law asks for it (e.g. which cereal). */
export type AllergenDeclaration = { id: AllergenId; detail?: string };

export function allergenLabel(id: AllergenId): string {
  return ALLERGENS.find((a) => a.id === id)?.short ?? id;
}

export function describeContains(list: AllergenDeclaration[]): string {
  if (list.length === 0) return "None of the 14 major allergens";
  return list.map((a) => (a.detail ? `${allergenLabel(a.id)} (${a.detail})` : allergenLabel(a.id))).join(", ");
}

/** True when a product is safe to show under an "exclude these allergens" filter. Treats "may contain" as unsafe. */
export function passesAllergenFilter(
  product: { contains: AllergenDeclaration[]; mayContain: AllergenId[] },
  excluded: readonly AllergenId[],
): boolean {
  if (excluded.length === 0) return true;
  return !excluded.some((id) => product.contains.some((a) => a.id === id) || product.mayContain.includes(id));
}
