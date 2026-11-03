import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { BLOG_CATEGORIES } from "@/lib/blog";
import { createPostAction } from "@/lib/actions/blog";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { PostForm } from "@/components/blog/PostForm";
import { Footer } from "@/components/common/Footer";

export const metadata: Metadata = { title: "글쓰기 - DAYVER 블로그" };

export default async function WritePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/blog/write");
  return (
    <>
      <a href="#content" className="dv-skip">본문 바로가기</a>
      <BlogHeader />
      <main id="content" className="dv-container pt-6 max-w-[960px]">
        <h1 className="text-[20px] font-bold mb-4">글쓰기 <span className="text-[13px] text-dv-text-3 font-normal ml-2">{user.nickname}의 블로그</span></h1>
        <PostForm action={createPostAction} categories={BLOG_CATEGORIES} />
      </main>
      <Footer compact />
    </>
  );
}
