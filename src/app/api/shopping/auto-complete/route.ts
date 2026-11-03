import { NextResponse } from "next/server";
import { autoComplete } from "@/lib/shopping";

/** GET /api/shopping/auto-complete?keyword=노트북&personalizeYn=n&vertical= → {result:{keywordList:[{keywordName,keywordTag}]}} */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const keyword = u.searchParams.get("keyword") ?? "";
  return NextResponse.json({ result: { keywordList: autoComplete(keyword) } });
}
