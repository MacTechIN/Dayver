import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CafeSiteShell } from "@/components/cafe/CafeSiteShell";
import { PostForm } from "@/components/cafe/CafeForms";
import { loadCafeContext } from "@/components/cafe/context";
import { canManage, getPost } from "@/lib/cafe";

type Props = { params: Promise<{ slug: string; id: string }> };

export const metadata: Metadata = { title: "글 수정 - DAYVER 카페" };

export default async function EditPostPage({ params }: Props) {
  const { slug, id } = await params;
  const path = `/cafe/${slug}/post/${id}/edit`;
  const ctx = await loadCafeContext(slug);
  const { cafe, boards, role, user, pending } = ctx;
  if (!user) redirect(`/login?next=${encodeURIComponent(path)}`);
  const post = getPost(Number(id));
  if (!post || post.cafe_slug !== slug) notFound();
  if (post.user_id !== user.id && !canManage(role)) redirect(`/cafe/${slug}/post/${id}`);
  return (
    <CafeSiteShell cafe={cafe} boards={boards} role={role} pendingRequest={pending} loggedIn currentBoardId={post.board_id}>
      <h2 className="text-[18px] font-bold mb-4">글 수정</h2>
      <PostForm slug={slug} boards={boards.map((b) => ({ id: b.id, name: b.name }))} canNotice={canManage(role)} post={{ id: post.id, title: post.title, content: post.content, board_id: post.board_id }} />
    </CafeSiteShell>
  );
}
