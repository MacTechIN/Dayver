import { NextResponse } from "next/server";
import { getHistory, listIndices } from "@/lib/stock";

export async function GET() {
  const items = listIndices().map((i) => ({ ...i, history: getHistory(i.code, 30) }));
  return NextResponse.json({ items, serverTimestamp: Date.now() }, { headers: { "Cache-Control": "no-store" } });
}
