import type { Closure } from "@/lib/shops";
import { handle, readJson } from "@/lib/server/http";
import { addClosure, getClosures, ordersAffectedBy, removeClosure } from "@/lib/server/store";

export async function GET() {
  return handle(() => ({ closures: getClosures() }));
}

export async function POST(req: Request) {
  return handle(async () => {
    const body = await readJson<Omit<Closure, "id">>(req);
    const closure = addClosure(body);
    return { closure, affected: ordersAffectedBy(closure).map((o) => ({ id: o.id, name: o.customer.name, date: o.date })) };
  });
}

export async function DELETE(req: Request) {
  const id = new URL(req.url).searchParams.get("id") ?? "";
  return handle(() => {
    removeClosure(id);
    return { ok: true };
  });
}
