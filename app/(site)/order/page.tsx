import type { Metadata } from "next";
import { connection } from "next/server";
import { OrderFlow } from "@/components/order/OrderFlow";
import { PageHeader } from "@/components/PageHeader";
import { isShopId } from "@/lib/shops";
import { orderOptions } from "@/lib/server/options";
import "../../order.css";

export const metadata: Metadata = {
  title: "Order for collection",
  description: "Reserve tomorrow's bread, pastries and coffee and collect from Mill Lane or Harbour Street from 7:30am.",
};

type SearchParams = Promise<{ shop?: string; date?: string; add?: string }>;

export default async function OrderPage({ searchParams }: { searchParams: SearchParams }) {
  await connection();
  const { shop, date, add } = await searchParams;
  const initial = orderOptions(isShopId(shop) ? shop : "mill-lane", date ?? null);

  return (
    <>
      <PageHeader
        kicker="Order by 8pm, collect from 7:30am"
        title="Order for collection"
        intro="Pick a shop, a day and a time, then fill your basket. We'll have it bagged and waiting with your name on."
        illo="bag"
        blob="d"
      />
      <div className="container">
        <OrderFlow initial={initial} add={add} />
      </div>
    </>
  );
}
