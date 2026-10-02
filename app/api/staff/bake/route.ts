import { isShopId } from "@/lib/shops";
import { handle, readJson } from "@/lib/server/http";
import { StoreError, bakePlan, resetBakeToPar, updateBake } from "@/lib/server/store";

function target(shop: unknown, date: unknown) {
  if (!isShopId(shop)) throw new StoreError("Unknown shop", 404);
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new StoreError("Choose a date");
  return { shop, date };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  return handle(() => {
    const { shop, date } = target(url.searchParams.get("shop"), url.searchParams.get("date"));
    return { rows: bakePlan(shop, date) };
  });
}

export async function PATCH(req: Request) {
  return handle(async () => {
    const body = await readJson<{ shop: string; date: string; productId: string; planned?: number; soldOut?: boolean }>(req);
    const { shop, date } = target(body.shop, body.date);
    return { row: await updateBake(shop, date, body.productId, { planned: body.planned, soldOut: body.soldOut }) };
  });
}

/** Reset every product to its usual quantity. */
export async function POST(req: Request) {
  return handle(async () => {
    const body = await readJson<{ shop: string; date: string }>(req);
    const { shop, date } = target(body.shop, body.date);
    return { rows: await resetBakeToPar(shop, date) };
  });
}
