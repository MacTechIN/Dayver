import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { listNeighborPosts } from "@/lib/blog";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { PostCard } from "@/components/blog/PostCard";
import { BlogSidebar } from "@/components/blog/BlogSidebar";
import { Footer } from "@/components/common/Footer";

export const metadata: Metadata = { title: "이웃새글 - DAYVER 블로그" };

export default async function NeighborsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/blog/neighbors");
  const posts = listNeighborPosts(user.id, 30);
  return (
    <>
      <a href="#content" className="dv-skip">본문 바로가기</a>
      <BlogHeader />
      <main id="content" className="dv-container flex gap-6 pt-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-[20px] font-bold border-b border-dv-text pb-3">이웃새글</h1>
          {posts.length === 0 && <p className="py-16 text-center text-dv-text-2">이웃의 새 글이 없습니다. 블로거 홈에서 이웃추가를 눌러보세요.</p>}
          {posts.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
        <BlogSidebar next="/blog/neighbors" />
      </main>
      <Footer compact />
    </>
  );
}
