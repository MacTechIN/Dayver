import Link from "next/link";
import type { BlogPost } from "@/lib/blog";

export const HOT_TOPICS = ["일출", "실내 데이트", "클라이밍", "빵지순례", "클래스"];

/** 핫토픽: 좌측 3개 큰 영상형 카드 + 주제 탭, 우측 1/2/3 프로모션 탭 박스 */
export function HotTopics({ posts, topic }: { posts: BlogPost[]; topic: string }) {
  return (
    <section aria-label="핫토픽" className="dv-container pt-5 pb-6 border-b border-dv-border">
      <div className="flex gap-6">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px]">
              <Link href="/blog" className="text-dv-green font-bold">핫토픽</Link>
              <span className="mx-2 text-dv-text-3" aria-hidden>›</span>
              <span className="font-bold">{topic}</span>
            </h2>
            <div role="tablist" aria-label="핫토픽 페이지" className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} role="tab" aria-selected={n === 1} className={`w-6 h-5 text-[12px] rounded-sm ${n === 1 ? "bg-dv-text text-white" : "bg-dv-bg-2 text-dv-text-3"}`}>{n}</button>
              ))}
            </div>
          </div>
          <ul className="grid grid-cols-3 gap-3">
            {posts.map((p) => (
              <li key={p.id}>
                <Link href={`/blog/${p.username}/${p.id}`} data-clk="blog_home.hottopic.card" className="relative block h-[240px] rounded-sm overflow-hidden group" style={{ background: p.image_color ?? "#666" }}>
                  <span className="absolute left-3 top-3 w-7 h-7 rounded-full bg-black/50 text-white grid place-items-center text-[11px]" aria-label="동영상">▶</span>
                  <span className="absolute inset-x-0 bottom-0 bg-black/55 text-white text-[15px] font-bold text-center px-4 py-3 dv-clamp-2">{p.title}</span>
                </Link>
              </li>
            ))}
          </ul>
          <ul role="tablist" aria-label="핫토픽 주제" className="flex gap-2 mt-3">
            {HOT_TOPICS.map((t) => (
              <li key={t} role="presentation">
                <Link role="tab" aria-selected={t === topic} href={`/blog?topic=${encodeURIComponent(t)}`} className={`inline-block px-3 py-1 rounded-full text-[13px] border ${t === topic ? "bg-dv-text text-white border-dv-text" : "border-dv-border text-dv-text-2"}`}>{t}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-[280px] shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-bold">광고</h2>
            <div role="tablist" className="flex gap-1">
              {[1, 2, 3].map((n) => (
                <button key={n} role="tab" aria-selected={n === 3} className={`w-6 h-5 text-[12px] rounded-sm ${n === 3 ? "bg-dv-text text-white" : "bg-dv-bg-2 text-dv-text-3"}`}>{n}</button>
              ))}
            </div>
          </div>
          <Link href="/blog/challenge" className="block h-[240px] rounded-sm p-5 text-white" style={{ background: "linear-gradient(135deg,#0068c3,#5e3bee)" }}>
            <span className="text-[13px] opacity-80">블로그 응원 챌린지</span>
            <b className="block text-[24px] leading-tight mt-2">2026 가을 기록<br />매일 쓰면<br />선물이 와요!</b>
          </Link>
        </div>
      </div>
    </section>
  );
}
