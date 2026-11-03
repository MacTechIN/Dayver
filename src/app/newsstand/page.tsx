import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { NewsstandHeader } from "@/components/news/NewsstandHeader";
import { NewsstandViewer, type StandPress } from "@/components/news/NewsstandViewer";
import { getPressArticles, listPress, listSubscribedPress, listSubscribedPressIds, PRESS_CATEGORIES } from "@/lib/news";

export const metadata: Metadata = { title: "주요언론사 : DAYVER 뉴스스탠드" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function NewsstandPage({ searchParams }: Props) {
  const sp = await searchParams;
  const mode = sp.mode === "my" ? "my" : "all";
  const category = typeof sp.category === "string" && (PRESS_CATEGORIES as readonly string[]).includes(sp.category) ? sp.category : "주요언론사";
  const user = await getCurrentUser();
  const subs = user ? listSubscribedPressIds(user.id) : [];
  let press = mode === "my" && user ? listSubscribedPress(user.id) : listPress({ major: category === "주요언론사", category, limit: 40 });
  if (mode === "my" && user && category !== "주요언론사") press = press.filter((p) => p.category === category);
  const presses: StandPress[] = press.map((p) => ({
    id: p.id, name: p.name, slug: p.slug, color: p.logo_color, subscribed: subs.includes(p.id),
    articles: getPressArticles(p.id, 6).map((a) => ({ id: a.id, title: a.title, summary: a.summary, image_color: a.image_color, created_at: a.created_at })),
  }));
  return (
    <div className="min-h-screen bg-[#e9e3d6]" style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(0,0,0,0.02) 0 2px, transparent 2px 14px)" }}>
      <NewsstandHeader mode={mode} category={category} />
      <main id="content" className="dv-container">
        <h2 className="sr-only">뉴스스탠드 옵션메뉴, {category} 선택됨</h2>
        {mode === "my" && !user ? (
          <div className="py-24 text-center">
            <p className="mb-4 text-dv-text-2">MY뉴스는 로그인 후 구독한 언론사로 구성됩니다.</p>
            <Link href="/login?next=/newsstand?mode=my" className="dv-btn-green inline-block px-8 py-3">DAYVER 로그인</Link>
          </div>
        ) : mode === "my" && presses.length === 0 ? (
          <div className="py-24 text-center text-dv-text-2">구독한 언론사가 없습니다. <Link href="/news/my" className="text-dv-blue font-bold">구독 설정 ›</Link></div>
        ) : (
          <NewsstandViewer presses={presses} />
        )}
      </main>
      <footer role="contentinfo" className="bg-[#2b2b2b] text-white/70 text-[12px] text-center py-5 mt-8">
        <p>각 언론사가 직접 편집한 뉴스스탠드 기사는 데이버의 편집 방향과 다를 수 있습니다.</p>
        <p className="mt-1">Copyright ⓓ DAYVER Corp. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
