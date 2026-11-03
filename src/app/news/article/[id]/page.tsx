import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Footer } from "@/components/common/Footer";
import { NewsHeader } from "@/components/news/NewsHeader";
import { ArticleRow, SubscribeButton, Thumb } from "@/components/news/ArticleParts";
import { addCommentAction, deleteCommentAction } from "@/lib/actions/news";
import { getArticle, getPressArticles, incrementViews, listComments, listRelated, listSubscribedPressIds, fmtTime } from "@/lib/news";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const a = getArticle(Number(id));
  return { title: a ? `${a.title} - DAYVER 뉴스` : "DAYVER 뉴스" };
}

export default async function ArticlePage({ params }: Props) {
  const { id } = await params;
  const aid = Number(id);
  const article = Number.isInteger(aid) ? getArticle(aid) : undefined;
  if (!article) notFound();
  incrementViews(aid);
  const user = await getCurrentUser();
  const subscribed = user ? listSubscribedPressIds(user.id).includes(article.press_id) : false;
  const related = listRelated(article, 6);
  const more = getPressArticles(article.press_id, 6).filter((a) => a.id !== aid).slice(0, 5);
  const comments = listComments(aid);
  const path = `/news/article/${aid}`;

  return (
    <>
      <NewsHeader active={article.section} />
      <div className="bg-dv-bg-2">
        <main id="content" className="dv-container py-5 grid grid-cols-[1fr_340px] gap-5">
          <article className="dv-card p-8">
            <header className="border-b border-dv-border pb-4 mb-5">
              <div className="flex items-center justify-between mb-3">
                <Link href={`/news/press/${article.press_slug}`} className="flex items-center gap-2" data-clk="news_article.press">
                  <span className="w-7 h-7 rounded-full" style={{ background: article.press_color }} aria-hidden />
                  <b className="text-[16px]">{article.press_name}</b>
                </Link>
                <SubscribeButton pressId={article.press_id} subscribed={subscribed} back={path} />
              </div>
              <div className="text-[12px] text-dv-text-3 mb-2">
                <Link href={`/news/section/${encodeURIComponent(article.section)}`} className="text-dv-blue font-bold">{article.section}</Link>
                {article.is_headline ? <span className="ml-2 px-1.5 rounded bg-dv-red text-white">헤드라인</span> : null}
              </div>
              <h2 className="text-[28px] font-black leading-tight">{article.title}</h2>
              <div className="flex items-center gap-3 text-[12px] text-dv-text-3 mt-3">
                <span>입력 {fmtTime(article.created_at)}</span>
                <span>조회 {(article.views + 1).toLocaleString()}</span>
                <span className="ml-auto flex gap-1">
                  <button type="button" className="px-2 py-0.5 border border-dv-border rounded" aria-label="글자 크기">가</button>
                  <button type="button" className="px-2 py-0.5 border border-dv-border rounded" aria-label="공유">↗</button>
                </span>
              </div>
            </header>
            <Thumb color={article.image_color} label={`${article.press_name} 제공`} className="w-full h-72 mb-6" />
            <div className="text-[17px] leading-[1.8] space-y-5 text-dv-text">
              {article.content.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
            </div>
            <p className="mt-8 text-[13px] text-dv-text-3">{article.press_name} 편집부 · ⓓ {article.press_name}. 무단 전재 및 재배포 금지.</p>

            <section aria-label="댓글" className="mt-10 border-t border-dv-border pt-6">
              <h3 className="font-bold text-[16px] mb-3">댓글 <span className="text-dv-blue">{comments.length}</span></h3>
              {user ? (
                <form action={addCommentAction} className="flex gap-2 mb-5">
                  <input type="hidden" name="article_id" value={aid} />
                  <label className="sr-only" htmlFor="comment">댓글 내용</label>
                  <textarea id="comment" name="content" required maxLength={500} rows={2} placeholder="댓글을 남겨보세요" className="flex-1 border border-dv-border rounded p-3 text-[14px] outline-none focus:border-dv-blue" />
                  <button type="submit" className="px-5 rounded bg-dv-blue text-white font-bold">등록</button>
                </form>
              ) : (
                <p className="mb-5 p-4 bg-dv-bg-2 rounded text-[13px]">댓글을 쓰려면 <Link href={`/login?next=${encodeURIComponent(path)}`} className="text-dv-green font-bold">로그인</Link>이 필요합니다.</p>
              )}
              <ul className="divide-y divide-dv-border-2">
                {comments.length === 0 && <li className="py-6 text-center text-dv-text-3 text-[13px]">첫 댓글을 남겨보세요.</li>}
                {comments.map((c) => (
                  <li key={c.id} className="py-3 flex gap-3">
                    <span className="w-8 h-8 rounded-full grid place-items-center text-white font-bold shrink-0" style={{ background: c.avatar_color }} aria-hidden>{c.nickname.slice(0, 1)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] text-dv-text-3"><b className="text-dv-text">{c.nickname}</b> · {fmtTime(c.created_at)}</div>
                      <p className="text-[14px] whitespace-pre-wrap">{c.content}</p>
                    </div>
                    {user?.id === c.user_id && (
                      <form action={deleteCommentAction}>
                        <input type="hidden" name="comment_id" value={c.id} />
                        <input type="hidden" name="article_id" value={aid} />
                        <button type="submit" className="text-[12px] text-dv-text-3">삭제</button>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          </article>
          <aside className="space-y-4 self-start">
            <section aria-label={`${article.press_name} 주요뉴스`} className="dv-card p-4">
              <h2 className="font-bold text-[15px] mb-2">{article.press_name} 주요뉴스</h2>
              <ul className="divide-y divide-dv-border-2">{more.map((a) => <ArticleRow key={a.id} a={a} />)}</ul>
            </section>
            <section aria-label="관련 뉴스" className="dv-card p-4">
              <h2 className="font-bold text-[15px] mb-2">{article.section} 관련 뉴스</h2>
              <ul className="divide-y divide-dv-border-2">{related.map((a) => <ArticleRow key={a.id} a={a} />)}</ul>
            </section>
          </aside>
        </main>
      </div>
      <Footer compact />
    </>
  );
}
