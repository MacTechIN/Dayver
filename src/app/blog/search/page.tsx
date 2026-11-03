import type { Metadata } from "next";
import { searchBlogPosts } from "@/lib/blog";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { PostCard } from "@/components/blog/PostCard";
import { BlogSidebar } from "@/components/blog/BlogSidebar";
import { Footer } from "@/components/common/Footer";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const q = typeof sp.query === "string" ? sp.query : "";
  return { title: `${q ? `'${q}' 검색결과` : "검색"} - DAYVER 블로그` };
}

export default async function BlogSearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = typeof sp.query === "string" ? sp.query.trim() : "";
  const posts = q ? searchBlogPosts(q, 30) : [];
  return (
    <>
      <a href="#content" className="dv-skip">본문 바로가기</a>
      <BlogHeader query={q} />
      <main id="content" className="dv-container flex gap-6 pt-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-[20px] font-bold border-b border-dv-text pb-3">
            {q ? <><span className="text-dv-green">&apos;{q}&apos;</span> 검색결과 <span className="text-[14px] text-dv-text-3 font-normal">{posts.length}건</span></> : "블로그 검색"}
          </h1>
          {q && posts.length === 0 && <p className="py-16 text-center text-dv-text-2">검색 결과가 없습니다. 다른 검색어를 입력해 보세요.</p>}
          {posts.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
        <BlogSidebar next={`/blog/search?query=${encodeURIComponent(q)}`} />
      </main>
      <Footer compact />
    </>
  );
}
