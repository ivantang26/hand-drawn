import { isShopId } from "@/lib/shops";
import { handle } from "@/lib/server/http";
import { orderOptions } from "@/lib/server/options";
import { StoreError } from "@/lib/server/store";

export async function GET(req: Request) {
  const url = new URL(req.url);
  return handle(() => {
    const shop = url.searchParams.get("shop");
    if (!isShopId(shop)) throw new StoreError("Unknown shop", 404, "shop");
    return orderOptions(shop, url.searchParams.get("date"));
  });
}
