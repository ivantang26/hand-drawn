import { handle, readJson } from "@/lib/server/http";
import { StoreError, buyVoucher, checkVoucher } from "@/lib/server/store";

export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get("code") ?? "";
  return handle(() => {
    const v = checkVoucher(code);
    if (!v) throw new StoreError("We don't recognise that voucher code.", 404, "voucher");
    return { code: v.code, balance: v.balance };
  });
}

export async function POST(req: Request) {
  return handle(async () => {
    const body = await readJson<{ amount: number; recipient: string; from: string; message?: string; email: string }>(req);
    const v = buyVoucher(body);
    return { code: v.code, amount: v.amount, recipient: v.recipient, from: v.from, message: v.message };
  });
}
