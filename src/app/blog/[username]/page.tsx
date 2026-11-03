import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { countNeighbors, getAuthorByUsername, isNeighbor, listPostsByUser, listUserCategoryCounts } from "@/lib/blog";
import { toggleNeighborAction } from "@/lib/actions/blog";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { PostRow } from "@/components/blog/PostCard";
import { Footer } from "@/components/common/Footer";

type Props = { params: Promise<{ username: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const author = getAuthorByUsername(username);
  return { title: `${author ? `${author.nickname}의 블로그` : "블로그"} - DAYVER 블로그` };
}

export default async function BlogUserPage({ params, searchParams }: Props) {
  const { username } = await params;
  const sp = await searchParams;
  const author = getAuthorByUsername(username);
  if (!author) notFound();
  const user = await getCurrentUser();
  const isOwner = user?.id === author.id;
  const category = typeof sp.category === "string" ? sp.category : undefined;
  const posts = listPostsByUser(author.id, isOwner, category);
  const cats = listUserCategoryCounts(author.id, isOwner);
  const total = cats.reduce((s, c) => s + c.c, 0);
  const neighbor = user && !isOwner ? isNeighbor(user.id, author.id) : false;
  const neighborCount = countNeighbors(author.id);
  return (
    <>
      <a href="#content" className="dv-skip">본문 바로가기</a>
      <BlogHeader />
      <div className="h-40" style={{ background: `linear-gradient(120deg, ${author.avatar_color}, #222)` }} aria-hidden />
      <main id="content" className="dv-container flex gap-6 -mt-16">
        <aside className="w-[260px] shrink-0">
          <section aria-label="블로거 프로필" className="dv-card p-6 text-center">
            <span className="w-24 h-24 rounded-full mx-auto grid place-items-center text-white text-3xl font-black border-4 border-white shadow" style={{ background: author.avatar_color }} aria-hidden>{author.nickname.slice(0, 1)}</span>
            <h1 className="mt-3 font-bold text-[18px]">{author.nickname}의 블로그</h1>
            <p className="text-[12px] text-dv-text-3">{author.username}@dayver.com</p>
            <p className="mt-3 text-[13px] text-dv-text-2">{author.bio || "소개가 없습니다."}</p>
            <p className="mt-2 text-[12px] text-dv-text-3">이웃 {neighborCount} · 글 {total}</p>
            {isOwner ? (
              <Link href="/blog/write" className="dv-btn-green block mt-4 py-2.5">글쓰기</Link>
            ) : (
              <form action={toggleNeighborAction} className="mt-4">
                <input type="hidden" name="username" value={author.username} />
                <button type="submit" className={`w-full py-2.5 rounded font-bold ${neighbor ? "border border-dv-border text-dv-text-2" : "dv-btn-green"}`}>
                  {neighbor ? "이웃끊기" : "+ 이웃추가"}
                </button>
              </form>
            )}
          </section>
          <nav aria-label="카테고리" className="dv-card p-5 mt-4">
            <h2 className="font-bold text-[14px] mb-2">카테고리</h2>
            <ul className="text-[13px] space-y-1.5">
              <li><Link href={`/blog/${author.username}`} className={!category ? "text-dv-green font-bold" : "text-dv-text-2"}>전체보기 ({total})</Link></li>
              {cats.map((c) => (
                <li key={c.category}>
                  <Link href={`/blog/${author.username}?category=${encodeURIComponent(c.category)}`} className={category === c.category ? "text-dv-green font-bold" : "text-dv-text-2"}>
                    {c.category} ({c.c})
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <section className="flex-1 min-w-0 dv-card p-6 mt-16" aria-label="글 목록">
          <h2 className="font-bold text-[16px] border-b border-dv-text pb-3">{category ?? "전체보기"} <span className="text-[13px] text-dv-text-3 font-normal">{posts.length}개의 글</span></h2>
          {posts.length === 0 && <p className="py-16 text-center text-dv-text-2">아직 작성한 글이 없습니다.</p>}
          <ul>
            {posts.map((p) => <PostRow key={p.id} post={p} href={`/blog/${author.username}/${p.id}`} />)}
          </ul>
        </section>
      </main>
      <Footer compact />
    </>
  );
}
