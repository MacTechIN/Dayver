import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { Footer } from "@/components/common/Footer";
import { NewsHeader } from "@/components/news/NewsHeader";
import { ArticleRow, PressEditionCard, PressLogo, SubscribeButton } from "@/components/news/ArticleParts";
import { FrontPageCarousel } from "@/components/news/FrontPageCarousel";
import { listHeadlines, listPress, listPressEditions, listRanking, listSubscribedPressIds, NEWS_SECTIONS, listArticlesBySection } from "@/lib/news";

export const metadata: Metadata = { title: "DAYVER 뉴스" };

function today() {
  const d = new Date();
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}(${days[d.getDay()]})`;
}

export default async function NewsHome() {
  const user = await getCurrentUser();
  const subs = user ? listSubscribedPressIds(user.id) : [];
  const major = listPress({ major: true, limit: 12 });
  const editions = listPressEditions(major, 4);
  const headlines = listHeadlines(12);
  const ranking = listRanking(10);
  const front = major.slice(0, 8).map((p) => {
    const a = editions.find((e) => e.press.id === p.id)?.articles[0];
    return a ? { pressName: p.name, pressSlug: p.slug, color: p.logo_color, title: a.title, articleId: a.id } : null;
  }).filter((x): x is NonNullable<typeof x> => x !== null);
  const issueNow = NEWS_SECTIONS.slice(0, 3).map((s) => ({ section: s, articles: listArticlesBySection(s, 3) }));
  const cols: Array<typeof editions> = [[], [], []];
  editions.forEach((e, i) => cols[i % 3].push(e));

  return (
    <>
      <NewsHeader active="home" />
      <div className="bg-dv-bg-2">
        <main id="content" className="dv-container py-5 grid grid-cols-[1fr_160px] gap-5">
          <div>
            <div className="flex items-center justify-between border-b border-dv-text pb-2 mb-4 text-[13px]">
              <b>{today()}</b>
              <ul className="flex gap-4 text-dv-text-2">
                <li><Link href="/news/my">전체 언론사</Link></li>
                <li><Link href="/newsstand">뉴스스탠드</Link></li>
                <li><Link href="/news/ranking">라이브러리</Link></li>
              </ul>
            </div>
            <h2 className="sr-only">콘텐츠</h2>
            <div className="grid grid-cols-3 gap-4 items-start">
              <div className="space-y-4">
                <section aria-label="언론사편집" className="dv-card px-4 py-3 flex items-center justify-between">
                  <h2 className="font-bold text-[16px]">언론사편집 <span className="text-dv-text-3 font-normal text-[13px]">· 구독한 언론사</span></h2>
                  <Link href="/news/my" className="text-[12px] text-dv-text-2 border border-dv-border px-2 py-0.5 rounded">내구독 ▾</Link>
                </section>
                {cols[0].map((e) => <PressEditionCard key={e.press.id} press={e.press} articles={e.articles} subscribed={subs.includes(e.press.id)} back="/news" />)}
                <section aria-label="이슈NOW" className="dv-card p-4">
                  <h2 className="font-bold text-[15px] mb-3 flex items-center gap-1">이슈NOW를 구독해보세요 <button type="button" aria-label="도움말" className="text-dv-text-3 text-[12px]">ⓘ</button></h2>
                  <ul className="space-y-3">
                    {issueNow.map((g) => (
                      <li key={g.section} className="border border-dv-border rounded p-3">
                        <div className="flex items-center justify-between mb-2">
                          <b className="text-[14px]">#{g.section} 이슈</b>
                          <Link href={`/news/section/${encodeURIComponent(g.section)}`} className="text-dv-blue text-[12px]">+ 더보기</Link>
                        </div>
                        <ul className="text-[13px] space-y-1.5">
                          {g.articles.map((a) => (
                            <li key={a.id} className="flex gap-2"><span className="text-dv-text-3 shrink-0">{a.created_at.slice(5, 16)}</span><Link href={`/news/article/${a.id}`} className="dv-ellipsis hover:underline">{a.title}</Link></li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                  <Link href="/news/my" className="block text-center text-[13px] text-dv-blue mt-3">구독 설정 ›</Link>
                </section>
              </div>
              <div className="space-y-4">
                <FrontPageCarousel pages={front} />
                {cols[1].map((e) => <PressEditionCard key={e.press.id} press={e.press} articles={e.articles} subscribed={subs.includes(e.press.id)} back="/news" />)}
                <section aria-label="헤드라인" className="dv-card p-4">
                  <h2 className="font-bold text-[15px] mb-2">주요 헤드라인</h2>
                  <ul className="divide-y divide-dv-border-2">
                    {headlines.slice(0, 8).map((a) => <ArticleRow key={a.id} a={a} />)}
                  </ul>
                </section>
              </div>
              <div className="space-y-4">
                {cols[2].map((e) => <PressEditionCard key={e.press.id} press={e.press} articles={e.articles} subscribed={subs.includes(e.press.id)} back="/news" />)}
                <section aria-label="많이 본 뉴스" className="dv-card p-4">
                  <h2 className="font-bold text-[15px] mb-2 flex items-center justify-between">많이 본 뉴스 <Link href="/news/ranking" className="text-[12px] text-dv-text-3 font-normal">전체 보기 ›</Link></h2>
                  <ol className="divide-y divide-dv-border-2">
                    {ranking.map((a, i) => <ArticleRow key={a.id} a={a} rank={i + 1} />)}
                  </ol>
                </section>
              </div>
            </div>
          </div>
          <aside aria-label="구독 언론사" className="dv-card p-3 self-start sticky top-4">
            <h2 className="text-[13px] font-bold mb-2 flex items-center justify-between">{user ? "내가 구독한 언론사" : "주요 언론사"} <button type="button" aria-label="새로고침" className="text-dv-text-3">↻</button></h2>
            <ul className="space-y-2">
              {major.slice(0, 10).map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-1">
                  <Link href={`/news/press/${p.slug}`} className="min-w-0 dv-ellipsis"><PressLogo press={p} size={16} /></Link>
                  <SubscribeButton pressId={p.id} subscribed={subs.includes(p.id)} back="/news" />
                </li>
              ))}
            </ul>
            <Link href="/news/my" className="block mt-3 text-[12px] text-dv-text-2">구독 설정 ›</Link>
          </aside>
        </main>
      </div>
      <Footer compact />
    </>
  );
}
