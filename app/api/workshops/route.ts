import { handle, readJson } from "@/lib/server/http";
import { bookWorkshop, listSessions } from "@/lib/server/store";

export async function GET() {
  return handle(() => ({ sessions: listSessions() }));
}

export async function POST(req: Request) {
  return handle(async () => {
    const body = await readJson<{ sessionId: string; seats: number; name: string; email: string; voucher?: string }>(req);
    const { booking, session } = await bookWorkshop(body);
    return { booking, seatsLeft: session.seatsLeft };
  });
}
