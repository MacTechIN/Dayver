import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { get } from "@/lib/db";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { BlogSidebar } from "@/components/blog/BlogSidebar";
import { Footer } from "@/components/common/Footer";

export const metadata: Metadata = { title: "챌린지 프로그램 - DAYVER 블로그" };

export default async function ChallengePage() {
  const user = await getCurrentUser();
  const mine = user ? get<{ c: number }>("SELECT COUNT(*) c FROM blog_posts WHERE user_id = ? AND created_at >= date('now','localtime','start of month')", user.id)?.c ?? 0 : 0;
  return (
    <>
      <a href="#content" className="dv-skip">본문 바로가기</a>
      <BlogHeader current="/blog/challenge" />
      <main id="content" className="dv-container flex gap-6 pt-6">
        <div className="flex-1 min-w-0">
          <section className="rounded-lg p-10 text-white" style={{ background: "linear-gradient(120deg,#0068c3,#5e3bee)" }}>
            <h1 className="text-[28px] font-black">2026 가을 기록 챌린지</h1>
            <p className="mt-2 text-[15px] opacity-90">이번 달에 글을 10개 이상 쓰면 챌린지 배지와 멤버십 포인트를 드립니다.</p>
          </section>
          <section aria-label="내 진행 상황" className="dv-card p-6 mt-4">
            <h2 className="font-bold">내 진행 상황</h2>
            {user ? (
              <>
                <p className="mt-2 text-[14px]">이번 달 작성한 글 <b className="text-dv-green">{mine}</b> / 10</p>
                <div className="h-2 bg-dv-bg-2 rounded mt-2 overflow-hidden"><div className="h-full bg-dv-green" style={{ width: `${Math.min(100, mine * 10)}%` }} /></div>
                <Link href="/blog/write" className="dv-btn-green inline-block mt-4 px-5 py-2">지금 글쓰기</Link>
              </>
            ) : (
              <p className="mt-2 text-[14px] text-dv-text-2"><Link href="/login?next=/blog/challenge" className="text-dv-green font-bold">로그인</Link>하고 챌린지에 참여하세요.</p>
            )}
          </section>
        </div>
        <BlogSidebar next="/blog/challenge" />
      </main>
      <Footer compact />
    </>
  );
}
