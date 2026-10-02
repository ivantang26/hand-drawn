import type { Metadata } from "next";
import { connection } from "next/server";
import { CollectionList } from "@/components/staff/CollectionList";
import { londonNow } from "@/lib/dates";
import { ordersFor } from "@/lib/server/store";

export const metadata: Metadata = { title: "Collections" };

export default async function CollectionsPage() {
  await connection();
  const now = londonNow();
  return <CollectionList today={now.date} initial={ordersFor("mill-lane", now.date)} />;
}
