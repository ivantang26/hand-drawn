import { isShopId } from "@/lib/shops";
import { handle, readJson } from "@/lib/server/http";
import { StoreError, ordersFor, setCollected } from "@/lib/server/store";

export async function GET(req: Request) {
  const url = new URL(req.url);
  return handle(() => {
    const shop = url.searchParams.get("shop");
    const date = url.searchParams.get("date") ?? "";
    if (!isShopId(shop)) throw new StoreError("Unknown shop", 404);
    return { orders: ordersFor(shop, date) };
  });
}

export async function PATCH(req: Request) {
  return handle(async () => {
    const body = await readJson<{ id: string; collected: boolean }>(req);
    const o = setCollected(body.id, Boolean(body.collected));
    return { id: o.id, status: o.status };
  });
}
