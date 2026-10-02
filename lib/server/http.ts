import { NextResponse } from "next/server";
import { StoreError } from "./store";

/** Turn thrown StoreErrors into tidy JSON responses. */
export async function handle<T>(fn: () => T | Promise<T>): Promise<NextResponse> {
  try {
    const data = await fn();
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    if (err instanceof StoreError) {
      return NextResponse.json(
        { error: err.message, field: err.field, shortages: err.shortages },
        { status: err.status },
      );
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong on our side. Please try again." }, { status: 500 });
  }
}

export async function readJson<T = Record<string, unknown>>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new StoreError("Couldn't read that request.");
  }
}
