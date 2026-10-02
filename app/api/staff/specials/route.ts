import type { Special } from "@/lib/types";
import { handle, readJson } from "@/lib/server/http";
import { saveSpecials } from "@/lib/server/store";

export async function PUT(req: Request) {
  return handle(async () => {
    const body = await readJson<{ specials: Special[] }>(req);
    return { specials: saveSpecials(Array.isArray(body.specials) ? body.specials : []) };
  });
}
