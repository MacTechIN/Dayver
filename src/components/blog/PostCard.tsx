import Link from "next/link";
import type { BlogPost } from "@/lib/blog";
import { excerpt, timeAgo } from "@/lib/blog";

/** 블로그 홈 글 카드: 블로거 썸네일 + 닉네임 + 시간, 제목, 3줄 요약, 공감 수, 우측 썸네일 색 블록 */
export function PostCard({ post }: { post: BlogPost }) {
  const href = `/blog/${post.username}/${post.id}`;
  return (
    <article className="flex gap-6 py-7 border-b border-dv-border-2">
      <div className="flex-1 min-w-0">
        <Link href={`/blog/${post.username}`} data-clk="blog_home.post.blogger" className="inline-flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-full grid place-items-center text-white font-bold" style={{ background: post.avatar_color }} aria-label="블로거 썸네일">
            {post.nickname.slice(0, 1)}
          </span>
          <span>
            <b className="block text-[14px]">{post.nickname}</b>
            <time className="block text-[12px] text-dv-text-3" dateTime={post.created_at}>{timeAgo(post.created_at)}</time>
          </span>
        </Link>
        <h3 className="mt-3 text-[17px] font-bold leading-snug">
          <Link href={href} data-clk="blog_home.post.title" className="hover:underline">{post.title}</Link>
        </h3>
        <p className="mt-2 text-[14px] text-dv-text-2 dv-clamp-3 leading-relaxed">
          <Link href={href} data-clk="blog_home.post.body">{excerpt(post.content, 220)}</Link>
        </p>
        <div className="mt-3 text-[12px] text-dv-text-3 flex gap-3">
          <span>공감 {post.likes}</span>
          <span>댓글 {post.comment_count}</span>
          <span className="text-dv-green">{post.category}</span>
        </div>
      </div>
      <div className="relative w-[166px] h-[166px] shrink-0">
        <Link href={href} className="dv-thumb w-full h-full rounded-sm text-[13px]" style={{ background: post.image_color ?? "#999" }} aria-label={`${post.title} 섬네일`}>
          {post.category}
        </Link>
        <button type="button" aria-label="글 섬네일 펼치기" className="absolute right-0 bottom-0 w-7 h-7 bg-black/60 text-white text-lg leading-none grid place-items-center">+</button>
      </div>
    </article>
  );
}

/** 블로그 홈(개인) 글 목록용 간단 행 */
export function PostRow({ post, href }: { post: BlogPost; href: string }) {
  return (
    <li className="flex items-center gap-4 py-4 border-b border-dv-border-2">
      <span className="w-14 h-14 dv-thumb rounded text-[11px] shrink-0" style={{ background: post.image_color ?? "#999" }} aria-hidden>
        {post.category.slice(0, 2)}
      </span>
      <div className="flex-1 min-w-0">
        <Link href={href} className="font-bold text-[15px] dv-ellipsis block hover:underline">
          {post.is_public ? "" : <span className="text-[11px] text-dv-text-3 mr-1">[비공개]</span>}
          {post.title}
        </Link>
        <p className="text-[13px] text-dv-text-2 dv-ellipsis">{excerpt(post.content, 120)}</p>
        <p className="text-[12px] text-dv-text-3 mt-1">{post.category} · {timeAgo(post.created_at)} · 공감 {post.likes} · 댓글 {post.comment_count}</p>
      </div>
    </li>
  );
}
