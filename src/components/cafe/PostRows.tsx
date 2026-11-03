import Link from "next/link";
import type { CafePost } from "@/lib/cafe";
import { formatDate } from "@/lib/cafe";

function excerpt(s: string, n = 90) {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length > n ? t.slice(0, n) + "…" : t;
}

/** 인기글 3장 이미지 카드 (색 블록 썸네일) */
export function PostCards({ posts, clk = "cafe_home.popular" }: { posts: CafePost[]; clk?: string }) {
  return (
    <ul className="grid grid-cols-3 gap-4">
      {posts.map((p) => (
        <li key={p.id}>
          <Link href={`/cafe/${p.cafe_slug}/post/${p.id}`} data-clk={`${clk}.card`} className="block group">
            <div className="dv-thumb h-[116px] rounded-lg text-[13px]" style={{ background: `linear-gradient(135deg, ${p.cafe_color}, #222)` }}>{p.board_name}</div>
            <p className="mt-2 font-bold text-[14px] dv-clamp-2 group-hover:underline">{p.title}</p>
            <p className="text-[12px] text-dv-text-3 dv-ellipsis">{p.cafe_name}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** 글 목록 행: 제목, 카페명, 좋아요/댓글, 우측 썸네일 */
export function PostRows({ posts, showCafe = true, clk = "cafe_home.popular", withThumb = true }: { posts: CafePost[]; showCafe?: boolean; clk?: string; withThumb?: boolean }) {
  if (posts.length === 0) return <p className="py-10 text-center text-dv-text-3">글이 없습니다.</p>;
  return (
    <ul className="divide-y divide-dv-border-2">
      {posts.map((p) => (
        <li key={p.id} className="py-3.5 flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <Link href={`/cafe/${p.cafe_slug}/post/${p.id}`} data-clk={`${clk}.title`} className="block font-bold text-[15px] dv-ellipsis hover:underline">
              {p.is_notice ? <span className="text-dv-red mr-1">[공지]</span> : null}{p.title}
            </Link>
            <p className="text-[12px] text-dv-text-3 mt-1 flex items-center gap-2 min-w-0">
              {showCafe ? <Link href={`/cafe/${p.cafe_slug}`} className="dv-ellipsis max-w-[260px]">{p.cafe_name}</Link> : <span>{p.author}</span>}
              <span>♡ {p.likes}</span>
              <span>💬 {p.comment_count}</span>
              <time>{formatDate(p.created_at)}</time>
            </p>
          </div>
          {withThumb && (
            <div className="dv-thumb w-[70px] h-[52px] rounded-md text-[11px] shrink-0" style={{ background: p.cafe_color }}>{excerpt(p.board_name, 6)}</div>
          )}
        </li>
      ))}
    </ul>
  );
}

/** 게시판 테이블형 목록 (카페 내부) */
export function BoardTable({ posts, slug, clk = "cafe_board.list" }: { posts: CafePost[]; slug: string; clk?: string }) {
  if (posts.length === 0) return <p className="py-12 text-center text-dv-text-3">등록된 글이 없습니다.</p>;
  return (
    <table className="w-full text-[13px]">
      <thead className="bg-dv-bg-3 text-dv-text-2 border-y border-dv-border">
        <tr>
          <th className="py-2 text-left pl-3 font-normal">제목</th>
          <th className="w-[110px] font-normal">작성자</th>
          <th className="w-[70px] font-normal">작성일</th>
          <th className="w-[60px] font-normal">조회</th>
          <th className="w-[60px] font-normal">좋아요</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-dv-border-2">
        {posts.map((p) => (
          <tr key={p.id} className={p.is_notice ? "bg-dv-bg-3" : ""}>
            <td className="py-2.5 pl-3 min-w-0">
              <Link href={`/cafe/${slug}/post/${p.id}`} data-clk={`${clk}.title`} className="hover:underline">
                {p.is_notice ? <b className="text-dv-red mr-1">공지</b> : <span className="text-dv-text-3 mr-1">{p.board_name}</span>}
                {p.title}
                {p.comment_count > 0 && <span className="text-dv-red ml-1">[{p.comment_count}]</span>}
              </Link>
            </td>
            <td className="text-center text-dv-text-2">{p.author}</td>
            <td className="text-center text-dv-text-3">{formatDate(p.created_at)}</td>
            <td className="text-center text-dv-text-3">{p.views}</td>
            <td className="text-center text-dv-text-3">{p.likes}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
