import type { Metadata } from "next";
import Link from "next/link";
import { listTopBloggers } from "@/lib/blog";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { BlogSidebar } from "@/components/blog/BlogSidebar";
import { Footer } from "@/components/common/Footer";

export const metadata: Metadata = { title: "이달의 블로그 - DAYVER 블로그" };

export default async function MonthlyPage() {
  const bloggers = listTopBloggers(6);
  const month = new Date().getMonth() + 1;
  return (
    <>
      <a href="#content" className="dv-skip">본문 바로가기</a>
      <BlogHeader current="/blog/monthly" />
      <main id="content" className="dv-container flex gap-6 pt-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-[20px] font-bold border-b border-dv-text pb-3">{month}월 이달의 블로그</h1>
          <p className="text-[13px] text-dv-text-2 py-3">최근 글의 공감과 조회를 기준으로 선정한 블로거입니다.</p>
          <ul className="grid grid-cols-3 gap-4">
            {bloggers.map((b, i) => (
              <li key={b.id} className="dv-card p-5">
                <span className="text-[12px] text-dv-green font-bold">#{i + 1}</span>
                <Link href={`/blog/${b.username}`} className="flex items-center gap-3 mt-2">
                  <span className="w-12 h-12 rounded-full grid place-items-center text-white font-black" style={{ background: b.avatar_color }} aria-hidden>{b.nickname.slice(0, 1)}</span>
                  <span>
                    <b className="block">{b.nickname}</b>
                    <span className="text-[12px] text-dv-text-3">글 {b.post_count} · 공감 {b.total_likes}</span>
                  </span>
                </Link>
                <p className="mt-3 text-[13px] text-dv-text-2 dv-clamp-2">{b.bio || "소개가 없습니다."}</p>
              </li>
            ))}
          </ul>
        </div>
        <BlogSidebar next="/blog/monthly" />
      </main>
      <Footer compact />
    </>
  );
}
