import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Footer } from "@/components/common/Footer";
import { NewsHeader } from "@/components/news/NewsHeader";
import { ArticleCard, SubscribeButton } from "@/components/news/ArticleParts";
import { getPress, getPressArticles, listPress, listSubscribedPressIds } from "@/lib/news";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = getPress(slug);
  return { title: `${p?.name ?? "언론사"} - DAYVER 뉴스` };
}

export default async function PressPage({ params }: Props) {
  const { slug } = await params;
  const press = getPress(slug);
  if (!press) notFound();
  const user = await getCurrentUser();
  const subscribed = user ? listSubscribedPressIds(user.id).includes(press.id) : false;
  const articles = getPressArticles(press.id, 30);
  const others = listPress({ category: press.category, limit: 12 }).filter((p) => p.id !== press.id);
  const path = `/news/press/${slug}`;
  return (
    <>
      <NewsHeader />
      <div className="bg-dv-bg-2">
        <main id="content" className="dv-container py-5 grid grid-cols-[1fr_340px] gap-5">
          <section aria-label={`${press.name} 기사`} className="dv-card p-5">
            <header className="flex items-center gap-4 border-b border-dv-border pb-4 mb-2">
              <span className="w-14 h-14 rounded-full" style={{ background: press.logo_color }} aria-hidden />
              <div>
                <h2 className="text-[22px] font-black">{press.name}</h2>
                <p className="text-[12px] text-dv-text-3">{press.category}{press.is_major ? " · 주요언론사" : ""}</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Link href={`/newsstand/${press.slug}`} className="text-[12px] px-2.5 py-0.5 border border-dv-border rounded-full">뉴스스탠드</Link>
                <SubscribeButton pressId={press.id} subscribed={subscribed} back={path} />
              </div>
            </header>
            <ul>{articles.map((a) => <ArticleCard key={a.id} a={a} />)}</ul>
          </section>
          <aside className="dv-card p-4 self-start">
            <h2 className="font-bold text-[15px] mb-2">{press.category} 언론사</h2>
            <ul className="space-y-2 text-[13px]">
              {others.map((p) => (
                <li key={p.id}><Link href={`/news/press/${p.slug}`} className="flex items-center gap-2"><span className="w-4 h-4 rounded-full" style={{ background: p.logo_color }} aria-hidden />{p.name}</Link></li>
              ))}
            </ul>
          </aside>
        </main>
      </div>
      <Footer compact />
    </>
  );
}
