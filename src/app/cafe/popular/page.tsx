import type { Metadata } from "next";
import { SectionShell } from "@/components/cafe/SectionShell";
import { PostCards, PostRows } from "@/components/cafe/PostRows";
import { listPopularPosts } from "@/lib/cafe";

export const metadata: Metadata = { title: "인기글 - DAYVER 카페" };

export default function PopularPage() {
  const posts = listPopularPosts(40);
  return (
    <SectionShell current="/cafe/popular">
      <h1 className="text-[20px] font-bold mb-1">🔥 인기글</h1>
      <p className="text-[13px] text-dv-text-3 mb-6">전체 카페에서 좋아요·댓글·조회가 많은 글을 모았어요.</p>
      <PostCards posts={posts.slice(0, 3)} clk="cafe_popular" />
      <div className="mt-4">
        <PostRows posts={posts.slice(3)} clk="cafe_popular" />
      </div>
    </SectionShell>
  );
}
