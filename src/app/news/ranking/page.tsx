import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/common/Footer";
import { NewsHeader } from "@/components/news/NewsHeader";
import { Thumb } from "@/components/news/ArticleParts";
import { listRanking, NEWS_SECTIONS, listPress, getPressArticles } from "@/lib/news";

export const metadata: Metadata = { title: "랭킹 - DAYVER 뉴스" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function RankingPage({ searchParams }: Props) {
  const sp = await searchParams;
  const tab = typeof sp.tab === "string" && sp.tab === "press" ? "press" : "views";
  const section = typeof sp.section === "string" && (NEWS_SECTIONS as readonly string[]).includes(sp.section) ? sp.section : undefined;
  const ranking = listRanking(30, section);
  const press = listPress({ major: true, limit: 12 });
  return (
    <>
      <NewsHeader active="ranking" />
      <div className="bg-dv-bg-2">
        <main id="content" className="dv-container py-5">
          <div className="dv-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[22px] font-black">랭킹 뉴스</h2>
              <div role="tablist" aria-label="랭킹 종류" className="flex border border-dv-border rounded overflow-hidden text-[13px]">
                <Link role="tab" aria-selected={tab === "views"} href="/news/ranking" className={`px-4 py-1.5 ${tab === "views" ? "bg-dv-text text-white" : ""}`}>많이 본 뉴스</Link>
                <Link role="tab" aria-selected={tab === "press"} href="/news/ranking?tab=press" className={`px-4 py-1.5 ${tab === "press" ? "bg-dv-text text-white" : ""}`}>언론사별</Link>
              </div>
            </div>
            {tab === "views" ? (
              <>
                <ul className="flex gap-2 mb-4 text-[13px]">
                  <li><Link href="/news/ranking" className={`px-3 py-1 rounded-full border ${!section ? "bg-dv-blue text-white border-dv-blue" : "border-dv-border"}`}>전체</Link></li>
                  {NEWS_SECTIONS.map((s) => (
                    <li key={s}><Link href={`/news/ranking?section=${encodeURIComponent(s)}`} className={`px-3 py-1 rounded-full border ${section === s ? "bg-dv-blue text-white border-dv-blue" : "border-dv-border"}`}>{s}</Link></li>
                  ))}
                </ul>
                <ol className="grid grid-cols-3 gap-x-6">
                  {ranking.map((a, i) => (
                    <li key={a.id} className="flex items-center gap-3 py-3 border-b border-dv-border-2">
                      <b className={`w-7 text-[18px] ${i < 3 ? "text-dv-blue" : "text-dv-text-3"}`}>{i + 1}</b>
                      <Thumb color={a.image_color} label="" className="w-16 h-12" />
                      <div className="min-w-0">
                        <Link href={`/news/article/${a.id}`} className="dv-clamp-2 text-[14px] hover:underline" data-clk="news_ranking.title">{a.title}</Link>
                        <div className="text-[12px] text-dv-text-3">{a.press_name} · 조회 {a.views.toLocaleString()}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {press.map((p) => {
                  const top = [...getPressArticles(p.id, 10)].sort((x, y) => y.views - x.views).slice(0, 5);
                  return (
                    <section key={p.id} aria-label={`${p.name} 랭킹`} className="border border-dv-border rounded p-3">
                      <h3 className="font-bold mb-2 flex items-center gap-2"><span className="w-4 h-4 rounded-full" style={{ background: p.logo_color }} aria-hidden />{p.name}</h3>
                      <ol className="text-[13px] space-y-1.5">
                        {top.map((a, i) => <li key={a.id} className="flex gap-2"><b className="text-dv-blue w-3">{i + 1}</b><Link href={`/news/article/${a.id}`} className="dv-ellipsis hover:underline">{a.title}</Link></li>)}
                      </ol>
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer compact />
    </>
  );
}
