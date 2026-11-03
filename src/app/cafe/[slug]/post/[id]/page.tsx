import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CafeSiteShell } from "@/components/cafe/CafeSiteShell";
import { loadCafeContext } from "@/components/cafe/context";
import { canManage, getPost, hasLiked, listCafePosts, listComments } from "@/lib/cafe";
import { run } from "@/lib/db";
import { addCommentAction, deleteCommentAction, deletePostAction, toggleLikeAction } from "@/lib/actions/cafe";
import { BoardTable } from "@/components/cafe/PostRows";

type Props = { params: Promise<{ slug: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = getPost(Number(id));
  return { title: `${post?.title ?? "글"} - ${post?.cafe_name ?? "카페"} - DAYVER 카페` };
}

export default async function PostPage({ params }: Props) {
  const { slug, id } = await params;
  const ctx = await loadCafeContext(slug);
  const { cafe, boards, role, user, pending } = ctx;
  const post = getPost(Number(id));
  if (!post || post.cafe_slug !== slug) notFound();
  const board = boards.find((b) => b.id === post.board_id);
  const locked = !!board?.members_only && !role;
  if (!locked) run("UPDATE cafe_posts SET views = views + 1 WHERE id = ?", post.id);
  const comments = locked ? [] : listComments(post.id);
  const liked = user ? hasLiked(post.id, user.id) : false;
  const canEdit = !!user && (post.user_id === user.id || canManage(role));
  const siblings = listCafePosts(cafe.id, { boardId: post.board_id, size: 5 }).posts;
  const postPath = `/cafe/${slug}/post/${post.id}`;
  return (
    <CafeSiteShell cafe={cafe} boards={boards} role={role} pendingRequest={pending} loggedIn={!!user} currentBoardId={post.board_id}>
      {locked ? (
        <p className="py-12 text-center text-dv-text-3">🔒 멤버 전용 글입니다. 카페에 가입하면 볼 수 있어요.</p>
      ) : (
        <article aria-labelledby="post-title">
          <p className="text-[13px] text-dv-text-3"><Link href={`/cafe/${slug}/board/${post.board_id}`}>{post.board_name}</Link></p>
          <h2 id="post-title" className="text-[24px] font-bold mt-1">{post.is_notice ? <span className="text-dv-red mr-2">[공지]</span> : null}{post.title}</h2>
          <div className="flex items-center gap-3 mt-3 pb-4 border-b border-dv-border text-[13px]">
            <span className="w-9 h-9 rounded-full text-white grid place-items-center font-bold" style={{ background: post.author_color }} aria-hidden>{post.author.slice(0, 1)}</span>
            <div>
              <b>{post.author}</b>
              <p className="text-dv-text-3 text-[12px]">{post.created_at.slice(0, 16)} · 조회 {post.views + 1}</p>
            </div>
            {canEdit && (
              <div className="ml-auto flex items-center gap-2 text-[12px]">
                <Link href={`${postPath}/edit`} className="px-2.5 py-1 border border-dv-border rounded">수정</Link>
                <form action={deletePostAction}>
                  <input type="hidden" name="slug" value={slug} />
                  <input type="hidden" name="post_id" value={post.id} />
                  <button type="submit" className="px-2.5 py-1 border border-dv-border rounded text-dv-red">삭제</button>
                </form>
              </div>
            )}
          </div>
          <div className="py-8 text-[15px] leading-7 whitespace-pre-wrap min-h-[200px]">{post.content}</div>
          <div className="flex items-center justify-center gap-3 py-4 border-y border-dv-border">
            {user ? (
              <form action={toggleLikeAction}>
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="post_id" value={post.id} />
                <button type="submit" aria-pressed={liked} className={`px-5 py-2 rounded-full border text-[14px] ${liked ? "border-dv-red text-dv-red bg-red-50" : "border-dv-border"}`} data-clk="cafe_post.like">
                  {liked ? "♥" : "♡"} 좋아요 {post.likes}
                </button>
              </form>
            ) : (
              <Link href={`/login?next=${encodeURIComponent(postPath)}`} className="px-5 py-2 rounded-full border border-dv-border text-[14px]">♡ 좋아요 {post.likes}</Link>
            )}
            <span className="text-[14px] text-dv-text-2">💬 댓글 {comments.length}</span>
          </div>

          <section aria-label="댓글" className="mt-6">
            <h3 className="font-bold text-[15px] mb-3">댓글 {comments.length}</h3>
            <ul className="divide-y divide-dv-border-2">
              {comments.map((c) => (
                <li key={c.id} className="py-3 flex gap-3 text-[14px]">
                  <span className="w-8 h-8 rounded-full text-white grid place-items-center text-[12px] font-bold shrink-0" style={{ background: c.author_color }} aria-hidden>{c.author.slice(0, 1)}</span>
                  <div className="flex-1 min-w-0">
                    <p><b>{c.author}</b> <time className="text-[12px] text-dv-text-3 ml-2">{c.created_at.slice(0, 16)}</time></p>
                    <p className="whitespace-pre-wrap mt-0.5">{c.content}</p>
                  </div>
                  {user && (c.user_id === user.id || canManage(role)) && (
                    <form action={deleteCommentAction}>
                      <input type="hidden" name="slug" value={slug} />
                      <input type="hidden" name="comment_id" value={c.id} />
                      <button type="submit" className="text-[12px] text-dv-text-3">삭제</button>
                    </form>
                  )}
                </li>
              ))}
              {comments.length === 0 && <li className="py-6 text-center text-dv-text-3 text-[13px]">첫 댓글을 남겨보세요.</li>}
            </ul>
            {user ? (
              <form action={addCommentAction} className="mt-4 flex gap-2">
                <input type="hidden" name="slug" value={slug} />
                <input type="hidden" name="post_id" value={post.id} />
                <textarea name="content" rows={2} required placeholder="댓글을 남겨보세요" aria-label="댓글 내용" className="flex-1 px-3 py-2 border border-dv-border rounded-md outline-none focus:border-dv-green" />
                <button type="submit" className="dv-btn-green px-5">등록</button>
              </form>
            ) : (
              <p className="mt-4 text-[13px] text-dv-text-3"><Link href={`/login?next=${encodeURIComponent(postPath)}`} className="text-dv-green font-bold">로그인</Link> 후 댓글을 남길 수 있어요.</p>
            )}
          </section>
        </article>
      )}
      <section aria-label={`${post.board_name} 다른 글`} className="mt-10">
        <h3 className="font-bold text-[15px] mb-2">{post.board_name}의 다른 글</h3>
        <BoardTable posts={siblings} slug={slug} clk="cafe_post.siblings" />
        <div className="text-right mt-2"><Link href={`/cafe/${slug}/board/${post.board_id}`} className="text-[13px] text-dv-text-2">목록 ›</Link></div>
      </section>
    </CafeSiteShell>
  );
}
