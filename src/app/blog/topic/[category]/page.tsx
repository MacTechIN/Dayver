import type { Metadata } from "next";
import Link from "next/link";
import { countPostsByCategory, listPostsByCategory, BLOG_CATEGORIES } from "@/lib/blog";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { CategoryTabs } from "@/components/blog/CategoryTabs";
import { PostCard } from "@/components/blog/PostCard";
import { BlogSidebar } from "@/components/blog/BlogSidebar";
import { Footer } from "@/components/common/Footer";

type Props = { params: Promise<{ category: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  return { title: `${decodeURIComponent(category)} - DAYVER 블로그` };
}

export default async function TopicPage({ params, searchParams }: Props) {
  const { category: raw } = await params;
  const sp = await searchParams;
  const category = decodeURIComponent(raw);
  const valid = category === "전체" || (BLOG_CATEGORIES as readonly string[]).includes(category);
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const posts = valid ? listPostsByCategory(category, 10, (page - 1) * 10) : [];
  const total = valid ? countPostsByCategory(category) : 0;
  const base = `/blog/topic/${encodeURIComponent(category)}`;
  return (
    <>
      <a href="#content" className="dv-skip">본문 바로가기</a>
      <BlogHeader current="/blog/topic/전체" />
      <main id="content" className="dv-container flex gap-6 pt-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-[20px] font-bold mb-4">주제별 보기 <span className="text-dv-text-3 text-[14px] font-normal ml-2">{category} · {total}개의 글</span></h1>
          <CategoryTabs current={category} />
          {!valid && <p className="py-16 text-center text-dv-text-2">존재하지 않는 주제입니다.</p>}
          {posts.map((p) => <PostCard key={p.id} post={p} />)}
          <nav aria-label="페이지" className="flex justify-center gap-2 py-8 text-[13px]">
            {page > 1 && <Link href={`${base}?page=${page - 1}`} className="px-3 py-1.5 border border-dv-border rounded">이전</Link>}
            <span className="px-3 py-1.5">{page}</span>
            {page * 10 < total && <Link href={`${base}?page=${page + 1}`} className="px-3 py-1.5 border border-dv-border rounded">다음</Link>}
          </nav>
        </div>
        <BlogSidebar next={base} />
      </main>
      <Footer compact />
    </>
  );
}
