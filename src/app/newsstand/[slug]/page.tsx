import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { NewsstandHeader } from "@/components/news/NewsstandHeader";
import { SubscribeButton, Thumb } from "@/components/news/ArticleParts";
import { getPress, getPressArticles, listSubscribedPressIds, fmtTime } from "@/lib/news";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${getPress(slug)?.name ?? "언론사"} : DAYVER 뉴스스탠드` };
}

/** 언론사 한 곳의 뉴스스탠드 지면 */
export default async function NewsstandPressPage({ params }: Props) {
  const { slug } = await params;
  const press = getPress(slug);
  if (!press) notFound();
  const user = await getCurrentUser();
  const subscribed = user ? listSubscribedPressIds(user.id).includes(press.id) : false;
  const articles = getPressArticles(press.id, 12);
  const [lead, ...rest] = articles;
  return (
    <div className="min-h-screen bg-[#e9e3d6]">
      <NewsstandHeader mode="all" category={press.category} />
      <main id="content" className="dv-container py-8">
        <section aria-label={`${press.name} 지면`} className="w-[890px] mx-auto bg-white border border-dv-border shadow-lg p-6">
          <header className="flex items-center justify-between border-b-2 border-dv-text pb-3 mb-4">
            <h2 className="text-[26px] font-black" style={{ color: press.logo_color }}>{press.name}</h2>
            <div className="flex items-center gap-2 text-[12px]">
              {lead && <time className="text-dv-text-3">{fmtTime(lead.created_at)}</time>}
              <SubscribeButton pressId={press.id} subscribed={subscribed} back={`/newsstand/${slug}`} />
            </div>
          </header>
          {lead && (
            <div className="grid grid-cols-[1.2fr_1fr] gap-5">
              <Link href={`/news/article/${lead.id}`} className="block">
                <Thumb color={lead.image_color} label={`${press.name} 1면`} className="w-full h-56 mb-3" />
                <strong className="text-[18px] leading-snug dv-clamp-2">{lead.title}</strong>
                <p className="text-[13px] text-dv-text-2 dv-clamp-2 mt-1">{lead.summary}</p>
              </Link>
              <ul className="divide-y divide-dv-border-2">
                {rest.map((a) => <li key={a.id} className="py-2.5"><Link href={`/news/article/${a.id}`} className="dv-clamp-2 text-[14px] hover:underline">{a.title}</Link></li>)}
              </ul>
            </div>
          )}
          <footer className="flex justify-between mt-5 text-[12px]">
            <Link href="/newsstand" className="text-dv-text-2">‹ 전체언론사</Link>
            <Link href={`/news/press/${press.slug}`} className="text-dv-blue">{press.name} 사이트 바로가기 ›</Link>
          </footer>
        </section>
      </main>
      <footer role="contentinfo" className="bg-[#2b2b2b] text-white/70 text-[12px] text-center py-5">Copyright ⓓ DAYVER Corp. All Rights Reserved.</footer>
    </div>
  );
}
