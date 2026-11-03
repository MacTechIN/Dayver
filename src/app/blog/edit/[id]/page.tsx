import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { BLOG_CATEGORIES, getPost } from "@/lib/blog";
import { deletePostAction, updatePostAction } from "@/lib/actions/blog";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { PostForm } from "@/components/blog/PostForm";
import { Footer } from "@/components/common/Footer";

export const metadata: Metadata = { title: "글 수정 - DAYVER 블로그" };

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/blog/edit/${id}`);
  const post = getPost(Number(id));
  if (!post) notFound();
  if (post.user_id !== user.id) redirect(`/blog/${post.username}/${post.id}`);
  return (
    <>
      <a href="#content" className="dv-skip">본문 바로가기</a>
      <BlogHeader />
      <main id="content" className="dv-container pt-6 max-w-[960px]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[20px] font-bold">글 수정</h1>
          <form action={deletePostAction}>
            <input type="hidden" name="id" value={post.id} />
            <button type="submit" className="text-[13px] text-dv-red px-3 py-1.5 border border-dv-border rounded">삭제</button>
          </form>
        </div>
        <PostForm action={updatePostAction} categories={BLOG_CATEGORIES} submitLabel="수정" initial={post} />
      </main>
      <Footer compact />
    </>
  );
}
