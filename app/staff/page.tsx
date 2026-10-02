import type { Metadata } from "next";
import { connection } from "next/server";
import { BakePlanner } from "@/components/staff/BakePlanner";
import { addDays, londonNow } from "@/lib/dates";
import { bakePlan } from "@/lib/server/store";

export const metadata: Metadata = { title: "Bake plan" };

export default async function StaffHome() {
  await connection();
  const now = londonNow();
  const tomorrow = addDays(now.date, 1);
  return <BakePlanner today={now.date} tomorrow={tomorrow} initial={bakePlan("mill-lane", tomorrow)} />;
}
