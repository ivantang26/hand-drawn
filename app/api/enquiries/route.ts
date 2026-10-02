import { handle, readJson } from "@/lib/server/http";
import { StoreError, addEnquiry } from "@/lib/server/store";

const REQUIRED = {
  wholesale: ["business", "volume", "area", "name", "email"],
  contact: ["name", "email", "message"],
} as const;

export async function POST(req: Request) {
  return handle(async () => {
    const body = await readJson<{ kind: "wholesale" | "contact"; fields: Record<string, string> }>(req);
    if (body.kind !== "wholesale" && body.kind !== "contact") throw new StoreError("Unknown form");
    const fields: Record<string, string> = {};
    for (const [k, v] of Object.entries(body.fields ?? {})) fields[k] = String(v ?? "").trim().slice(0, 1000);
    for (const f of REQUIRED[body.kind]) {
      if (!fields[f]) throw new StoreError("Please fill in this field.", 400, f);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) throw new StoreError("Check the email address.", 400, "email");
    const e = addEnquiry(body.kind, fields);
    return { id: e.id };
  });
}
