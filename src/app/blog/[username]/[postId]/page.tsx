import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAdjacentPosts, getPost, hasLiked, incrementViews, isNeighbor, listComments, timeAgo } from "@/lib/blog";
import { addCommentAction, deleteCommentAction, toggleLikeAction, toggleNeighborAction } from "@/lib/actions/blog";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { PostBody } from "@/components/blog/PostBody";
import { Footer } from "@/components/common/Footer";

type Props = { params: Promise<{ username: string; postId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postId } = await params;
  const post = getPost(Number(postId));
  return { title: `${post?.title ?? "글"} - DAYVER 블로그` };
}

export default async function BlogPostPage({ params }: Props) {
  const { username, postId } = await params;
  const post = getPost(Number(postId));
  if (!post || post.username !== username) notFound();
  const user = await getCurrentUser();
  const isOwner = user?.id === post.user_id;
  if (!post.is_public && !isOwner) notFound();
  incrementViews(post.id);
  const comments = listComments(post.id);
  const liked = user ? hasLiked(post.id, user.id) : false;
  const neighbor = user && !isOwner ? isNeighbor(user.id, post.user_id) : false;
  const { prev, next } = getAdjacentPosts(post, isOwner);
  const path = `/blog/${username}/${post.id}`;
  return (
    <>
      <a href="#content" className="dv-skip">본문 바로가기</a>
      <BlogHeader />
      <main id="content" className="dv-container max-w-[960px] pt-8">
        <article className="dv-card p-10">
          <header>
            <p className="text-[13px] text-dv-green font-bold">
              <Link href={`/blog/${username}?category=${encodeURIComponent(post.category)}`}>{post.category}</Link>
            </p>
            <h1 className="text-[30px] font-bold leading-tight mt-2">{post.title}</h1>
            <div className="flex items-center gap-3 mt-4 text-[13px] text-dv-text-3">
              <Link href={`/blog/${username}`} className="flex items-center gap-2 text-dv-text">
                <span className="w-8 h-8 rounded-full grid place-items-center text-white font-bold" style={{ background: post.avatar_color }} aria-hidden>{post.nickname.slice(0, 1)}</span>
                <b>{post.nickname}</b>
              </Link>
              <time dateTime={post.created_at}>{post.created_at.slice(0, 16)}</time>
              <span>조회 {post.views + 1}</span>
              {!isOwner && user && (
                <form action={toggleNeighborAction}>
                  <input type="hidden" name="username" value={username} />
                  <button type="submit" className="px-2 py-0.5 border border-dv-border rounded text-[12px] text-dv-text-2">{neighbor ? "이웃끊기" : "+ 이웃추가"}</button>
                </form>
              )}
              {isOwner && (
                <Link href={`/blog/edit/${post.id}`} className="ml-auto px-3 py-1 border border-dv-border rounded text-[12px] text-dv-text-2">수정</Link>
              )}
            </div>
          </header>
          <div className="my-8 h-[280px] rounded dv-thumb text-[18px]" style={{ background: post.image_color ?? "#999" }} aria-hidden>{post.category}</div>
          <PostBody content={post.content} />
          {post.tags && (
            <ul className="flex flex-wrap gap-2 mt-8 text-[13px]">
              {post.tags.split(",").filter(Boolean).map((t) => (
                <li key={t}><Link href={`/blog/search?query=${encodeURIComponent(t)}`} className="px-2.5 py-1 rounded-full bg-dv-bg-2 text-dv-text-2">#{t}</Link></li>
              ))}
            </ul>
          )}
          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-dv-border-2">
            <form action={toggleLikeAction}>
              <input type="hidden" name="id" value={post.id} />
              <input type="hidden" name="username" value={username} />
              <button type="submit" aria-pressed={liked} className={`px-4 py-2 rounded-full border font-bold text-[14px] ${liked ? "border-dv-red text-dv-red" : "border-dv-border text-dv-text-2"}`}>
                ♥ 공감 {post.likes}
              </button>
            </form>
            <span className="text-[13px] text-dv-text-3">댓글 {comments.length}</span>
          </div>
        </article>

        <section aria-label="댓글" className="dv-card p-8 mt-4">
          <h2 className="font-bold text-[16px]">댓글 {comments.length}</h2>
          <ul className="mt-4 divide-y divide-dv-border-2">
            {comments.map((c) => (
              <li key={c.id} className="py-4 flex gap-3">
                <span className="w-8 h-8 rounded-full grid place-items-center text-white text-[12px] font-bold shrink-0" style={{ background: c.avatar_color }} aria-hidden>{c.nickname.slice(0, 1)}</span>
                <div className="flex-1">
                  <div className="text-[13px]"><b>{c.nickname}</b> <span className="text-dv-text-3 ml-2">{timeAgo(c.created_at)}</span></div>
                  <p className="text-[14px] mt-1 whitespace-pre-line">{c.content}</p>
                </div>
                {user?.id === c.user_id && (
                  <form action={deleteCommentAction}>
                    <input type="hidden" name="comment_id" value={c.id} />
                    <input type="hidden" name="path" value={path} />
                    <button type="submit" className="text-[12px] text-dv-text-3">삭제</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
          {user ? (
            <form action={addCommentAction} className="mt-4 flex gap-2">
              <input type="hidden" name="id" value={post.id} />
              <input type="hidden" name="username" value={username} />
              <label htmlFor="comment" className="sr-only">댓글 내용</label>
              <textarea id="comment" name="content" rows={2} required placeholder="댓글을 남겨보세요" className="flex-1 border border-dv-border rounded p-3 text-[14px] outline-none focus:border-dv-green" />
              <button type="submit" className="dv-btn-green px-5">등록</button>
            </form>
          ) : (
            <p className="mt-4 text-[13px] text-dv-text-2"><Link href={`/login?next=${encodeURIComponent(path)}`} className="text-dv-green font-bold">로그인</Link> 후 댓글을 남길 수 있습니다.</p>
          )}
        </section>

        <nav aria-label="이전/다음 글" className="dv-card mt-4 divide-y divide-dv-border-2 text-[14px]">
          <div className="p-4 flex gap-3"><span className="text-dv-text-3 w-12">다음글</span>{next ? <Link href={`/blog/${username}/${next.id}`} className="dv-ellipsis hover:underline">{next.title}</Link> : <span className="text-dv-text-3">다음 글이 없습니다.</span>}</div>
          <div className="p-4 flex gap-3"><span className="text-dv-text-3 w-12">이전글</span>{prev ? <Link href={`/blog/${username}/${prev.id}`} className="dv-ellipsis hover:underline">{prev.title}</Link> : <span className="text-dv-text-3">이전 글이 없습니다.</span>}</div>
        </nav>
        <p className="py-6 text-center"><Link href={`/blog/${username}`} className="text-[13px] text-dv-text-2 underline underline-offset-4">{post.nickname}의 블로그 홈으로</Link></p>
      </main>
      <Footer compact />
    </>
  );
}
