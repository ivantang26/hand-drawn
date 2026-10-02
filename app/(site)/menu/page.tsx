import type { Metadata } from "next";
import { MenuBrowser } from "@/components/menu/MenuBrowser";
import { PageHeader } from "@/components/PageHeader";
import "../../pages.css";

export const metadata: Metadata = {
  title: "Menu & allergens",
  description: "Everything we bake, with prices and full allergen information for all 14 UK allergens.",
};

export default function MenuPage() {
  return (
    <>
      <PageHeader
        kicker="Baked every morning from 4am"
        title="The menu"
        intro="Breads, pastries, cakes and coffee to collect. Every item lists the allergens it contains, and anything that may contain traces."
        illo="croissant"
        blob="a"
        blobColor="var(--sage-tint)"
      />
      <div className="container">
        <MenuBrowser />
      </div>
    </>
  );
}
