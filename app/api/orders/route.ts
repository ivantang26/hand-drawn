import type { PlaceOrderInput } from "@/lib/types";
import { handle, readJson } from "@/lib/server/http";
import { placeOrder } from "@/lib/server/store";

export async function POST(req: Request) {
  return handle(async () => {
    const body = await readJson<PlaceOrderInput>(req);
    const order = await placeOrder(body);
    return { order: { id: order.id } };
  });
}
