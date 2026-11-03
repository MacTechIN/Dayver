import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { searchContacts } from "@/lib/mail";

/** 받는사람 자동완성: Dayver 사용자 검색 (로그인 필요). */
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ items: [] }, { status: 401 });
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ items: [] });
  const items = searchContacts(q).map((u) => ({ ...u, address: `${u.username}@dayver.com` }));
  return NextResponse.json({ items });
}
