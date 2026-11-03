import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/common/Footer";
import { NewsHeader, SLUG_SECTION } from "@/components/news/NewsHeader";
import { ArticleCard, ArticleRow } from "@/components/news/ArticleParts";
import { listArticlesBySection, listRanking, NEWS_SECTIONS } from "@/lib/news";

type Props = { params: Promise<{ section: string }> };

function resolve(raw: string): string | null {
  const dec = decodeURIComponent(raw);
  const s = SLUG_SECTION[dec] ?? dec;
  return (NEWS_SECTIONS as readonly string[]).includes(s) ? s : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { section } = await params;
  const s = resolve(section);
  return { title: `${s ?? "섹션"} - DAYVER 뉴스` };
}

export default async function SectionPage({ params }: Props) {
  const { section } = await params;
  const s = resolve(section);
  if (!s) notFound();
  const articles = listArticlesBySection(s, 40);
  const ranking = listRanking(10, s);
  const [lead, ...rest] = articles;
  return (
    <>
      <NewsHeader active={s} />
      <div className="bg-dv-bg-2">
        <main id="content" className="dv-container py-5 grid grid-cols-[1fr_340px] gap-5">
          <section aria-label={`${s} 뉴스`} className="dv-card p-5">
            <h2 className="text-[22px] font-black mb-4">{s}</h2>
            {lead && (
              <Link href={`/news/article/${lead.id}`} className="grid grid-cols-[320px_1fr] gap-5 mb-4 pb-4 border-b border-dv-border" data-clk="news_section.headline">
                <div className="dv-thumb rounded-md h-52" style={{ background: lead.image_color }}>{lead.press_name}</div>
                <div>
                  <strong className="text-[22px] leading-snug dv-clamp-2">{lead.title}</strong>
                  <p className="text-[14px] text-dv-text-2 mt-3 dv-clamp-3">{lead.summary}</p>
                  <div className="text-[12px] text-dv-text-3 mt-3">{lead.press_name} · {lead.created_at.slice(5, 16)}</div>
                </div>
              </Link>
            )}
            <ul>{rest.map((a) => <ArticleCard key={a.id} a={a} />)}</ul>
          </section>
          <aside className="space-y-4 self-start">
            <section aria-label={`${s} 많이 본 뉴스`} className="dv-card p-4">
              <h2 className="font-bold text-[15px] mb-2">{s} 많이 본 뉴스</h2>
              <ol className="divide-y divide-dv-border-2">{ranking.map((a, i) => <ArticleRow key={a.id} a={a} rank={i + 1} />)}</ol>
            </section>
            <section aria-label="다른 섹션" className="dv-card p-4">
              <h2 className="font-bold text-[15px] mb-2">다른 섹션</h2>
              <ul className="flex flex-wrap gap-2 text-[13px]">
                {NEWS_SECTIONS.filter((x) => x !== s).map((x) => (
                  <li key={x}><Link href={`/news/section/${encodeURIComponent(x)}`} className="px-2 py-1 border border-dv-border rounded-full">{x}</Link></li>
                ))}
              </ul>
            </section>
          </aside>
        </main>
      </div>
      <Footer compact />
    </>
  );
}
