import Link from "next/link";
import type { Article, Press } from "@/lib/news";
import { fmtTime } from "@/lib/news";
import { toggleSubscribeAction } from "@/lib/actions/news";

export function PressLogo({ press, size = 20 }: { press: Pick<Press, "name" | "logo_color">; size?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden className="rounded-full inline-block" style={{ width: size, height: size, background: press.logo_color }} />
      <span className="font-bold text-[13px]">{press.name}</span>
    </span>
  );
}

/** "+구독" / "구독중" 버튼 (서버 액션) */
export function SubscribeButton({ pressId, subscribed, back }: { pressId: number; subscribed: boolean; back: string }) {
  return (
    <form action={toggleSubscribeAction}>
      <input type="hidden" name="press_id" value={pressId} />
      <input type="hidden" name="back" value={back} />
      <button
        type="submit"
        aria-pressed={subscribed}
        className={`text-[12px] px-2.5 py-0.5 rounded-full border font-bold ${subscribed ? "bg-dv-blue border-dv-blue text-white" : "border-dv-blue text-dv-blue hover:bg-blue-50"}`}
        data-clk="news.subscribe"
      >
        {subscribed ? "구독중" : "+구독"}
      </button>
    </form>
  );
}

export function Thumb({ color, label, className = "" }: { color: string; label?: string; className?: string }) {
  return (
    <div className={`dv-thumb rounded-md shrink-0 ${className}`} style={{ background: color }} aria-hidden>
      <span className="text-[11px] opacity-80">{label ?? "NEWS"}</span>
    </div>
  );
}

/** 언론사편집 카드: 언론사명 · 시각 · +구독, 대표기사(썸네일+제목), 추가 제목 3개 */
export function PressEditionCard({ press, articles, subscribed, back }: { press: Press; articles: Article[]; subscribed: boolean; back: string }) {
  const [lead, ...rest] = articles;
  return (
    <article className="dv-card p-4" aria-label={`${press.name} 언론사편집`}>
      <header className="flex items-center justify-between mb-3">
        <Link href={`/news/press/${press.slug}`} className="flex items-center gap-2" data-clk="news_press.name">
          <PressLogo press={press} />
          {lead && <time className="text-[12px] text-dv-text-3">· {fmtTime(lead.created_at)}</time>}
        </Link>
        <SubscribeButton pressId={press.id} subscribed={subscribed} back={back} />
      </header>
      {lead && (
        <Link href={`/news/article/${lead.id}`} className="flex gap-3 mb-3" data-clk="news_press.lead">
          <Thumb color={lead.image_color} label={press.name} className="w-20 h-14" />
          <strong className="dv-clamp-2 text-[15px] leading-snug">{lead.title}</strong>
        </Link>
      )}
      <ul className="divide-y divide-dv-border-2">
        {rest.map((a) => (
          <li key={a.id} className="py-2 text-[14px]">
            <Link href={`/news/article/${a.id}`} className="dv-ellipsis block hover:underline" data-clk="news_press.title">{a.title}</Link>
          </li>
        ))}
      </ul>
    </article>
  );
}

export function ArticleRow({ a, rank }: { a: Article; rank?: number }) {
  return (
    <li className="flex items-center gap-3 py-2.5">
      {rank !== undefined && <b className={`w-6 text-center text-[15px] ${rank <= 3 ? "text-dv-blue" : "text-dv-text-3"}`}>{rank}</b>}
      <Link href={`/news/article/${a.id}`} className="flex-1 min-w-0 dv-ellipsis hover:underline" data-clk="news.list.title">{a.title}</Link>
      <span className="text-[12px] text-dv-text-3 whitespace-nowrap">{a.press_name}</span>
    </li>
  );
}

export function ArticleCard({ a }: { a: Article }) {
  return (
    <li>
      <Link href={`/news/article/${a.id}`} className="flex gap-3 py-3 border-b border-dv-border-2" data-clk="news.section.card">
        <Thumb color={a.image_color} label={a.press_name} className="w-28 h-20" />
        <div className="min-w-0">
          <strong className="dv-clamp-2 text-[15px] leading-snug">{a.title}</strong>
          <p className="dv-clamp-2 text-[13px] text-dv-text-2 mt-1">{a.summary}</p>
          <div className="text-[12px] text-dv-text-3 mt-1">{a.press_name} · {fmtTime(a.created_at)}</div>
        </div>
      </Link>
    </li>
  );
}
