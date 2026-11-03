import "server-only";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCafeBySlug, getMembership, getPendingRequest, listBoards } from "@/lib/cafe";

/** 개별 카페 페이지 공통 컨텍스트: 카페, 게시판, 현재 사용자, 역할, 가입 신청 상태 */
export async function loadCafeContext(slug: string) {
  const cafe = getCafeBySlug(slug);
  if (!cafe) notFound();
  const user = await getCurrentUser();
  const role = user ? getMembership(cafe.id, user.id)?.role : undefined;
  const pending = user && !role ? !!getPendingRequest(cafe.id, user.id) : false;
  const boards = listBoards(cafe.id);
  return { cafe, boards, user, role, pending };
}
