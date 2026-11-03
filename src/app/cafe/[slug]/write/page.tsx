import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CafeSiteShell } from "@/components/cafe/CafeSiteShell";
import { PostForm } from "@/components/cafe/CafeForms";
import { loadCafeContext } from "@/components/cafe/context";
import { canManage } from "@/lib/cafe";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export const metadata: Metadata = { title: "글쓰기 - DAYVER 카페" };

export default async function WritePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const ctx = await loadCafeContext(slug);
  const { cafe, boards, role, user, pending } = ctx;
  if (!user) redirect(`/login?next=${encodeURIComponent(`/cafe/${slug}/write`)}`);
  const defaultBoardId = Number(sp.board) || undefined;
  return (
    <CafeSiteShell cafe={cafe} boards={boards} role={role} pendingRequest={pending} loggedIn currentBoardId={defaultBoardId}>
      <h2 className="text-[18px] font-bold mb-4">글쓰기</h2>
      {role ? (
        <PostForm slug={slug} boards={boards.map((b) => ({ id: b.id, name: b.name }))} canNotice={canManage(role)} defaultBoardId={defaultBoardId} />
      ) : (
        <p className="py-12 text-center text-dv-text-3">카페 회원만 글을 쓸 수 있어요. <Link href={`/cafe/${slug}`} className="text-dv-green font-bold">카페 가입하기</Link></p>
      )}
    </CafeSiteShell>
  );
}
