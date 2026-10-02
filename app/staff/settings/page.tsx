import type { Metadata } from "next";
import { connection } from "next/server";
import { StaffSettings } from "@/components/staff/StaffSettings";
import { londonNow } from "@/lib/dates";
import { getClosures, getSpecials } from "@/lib/server/store";

export const metadata: Metadata = { title: "Specials & hours" };

export default async function SettingsPage() {
  await connection();
  return <StaffSettings today={londonNow().date} specials={getSpecials()} closures={getClosures()} />;
}
