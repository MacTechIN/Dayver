import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { listHotPosts, listNeighborPosts, listRecentPosts } from "@/lib/blog";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { HotTopics, HOT_TOPICS } from "@/components/blog/HotTopics";
import { CategoryTabs } from "@/components/blog/CategoryTabs";
import { PostCard } from "@/components/blog/PostCard";
import { BlogSidebar } from "@/components/blog/BlogSidebar";
import { Footer } from "@/components/common/Footer";

export const metadata: Metadata = { title: "블로그 홈 - DAYVER 블로그" };

export default async function BlogHomePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const topic = typeof sp.topic === "string" && HOT_TOPICS.includes(sp.topic) ? sp.topic : HOT_TOPICS[0];
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const user = await getCurrentUser();
  const hot = listHotPosts(3);
  const posts = listRecentPosts(10, (page - 1) * 10);
  const neighborPosts = user ? listNeighborPosts(user.id, 5) : [];
  return (
    <>
      <a href="#content" className="dv-skip">본문 바로가기</a>
      <BlogHeader current="/blog" />
      <HotTopics posts={hot} topic={topic} />
      <main id="content" className="dv-container flex gap-6 pt-6">
        <div className="flex-1 min-w-0">
          <h1 className="sr-only">블로그 홈</h1>
          {user ? (
            <section aria-label="이웃새글" className="mb-8">
              <h2 className="font-bold text-[16px] mb-2 flex items-center justify-between">
                이웃새글
                <Link href="/blog/neighbors" className="text-[12px] text-dv-text-3 font-normal">더보기 ›</Link>
              </h2>
              {neighborPosts.length === 0 ? (
                <p className="py-8 text-center text-dv-text-2 text-[14px] bg-dv-bg-3 rounded">아직 이웃이 없습니다. 마음에 드는 블로거를 이웃으로 추가해 보세요.</p>
              ) : (
                <ul className="grid grid-cols-5 gap-3">
                  {neighborPosts.map((p) => (
                    <li key={p.id}>
                      <Link href={`/blog/${p.username}/${p.id}`} className="block">
                        <span className="block h-24 rounded dv-thumb text-[12px]" style={{ background: p.image_color ?? "#999" }}>{p.category}</span>
                        <b className="block text-[13px] mt-2 dv-clamp-2">{p.title}</b>
                        <span className="text-[12px] text-dv-text-3">{p.nickname}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ) : (
            <section aria-label="이웃새글" className="relative py-10 text-center text-[15px] text-dv-text-2 mb-6">
              <p>로그아웃 상태입니다.</p>
              <p className="mt-1">
                <Link href="/login?next=/blog" className="font-bold text-dv-text underline underline-offset-4">로그인</Link>하여 이웃새글을 확인해보세요.
              </p>
              <span className="absolute right-20 top-2 w-24 h-16 rounded-xl grid place-items-center text-white text-[12px] font-bold" style={{ background: "#ffb703" }} aria-hidden>남는 기록을<br />블로그로!</span>
            </section>
          )}
          <CategoryTabs current="전체" />
          <div>
            {posts.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
          <nav aria-label="페이지" className="flex justify-center gap-2 py-8 text-[13px]">
            {page > 1 && <Link href={`/blog?page=${page - 1}`} className="px-3 py-1.5 border border-dv-border rounded">이전</Link>}
            <span className="px-3 py-1.5">{page}</span>
            {posts.length === 10 && <Link href={`/blog?page=${page + 1}`} className="px-3 py-1.5 border border-dv-border rounded">다음</Link>}
          </nav>
        </div>
        <BlogSidebar next="/blog" />
      </main>
      <Footer compact />
    </>
  );
}
