import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SectionShell } from "@/components/cafe/SectionShell";
import { CafeCard } from "@/components/cafe/CafeCard";
import { PostRows } from "@/components/cafe/PostRows";
import { listMyCafes, listMyPosts } from "@/lib/cafe";

export const metadata: Metadata = { title: "내 카페 - DAYVER 카페" };

export default async function MyCafePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=" + encodeURIComponent("/cafe/my"));
  const cafes = listMyCafes(user.id);
  const posts = listMyPosts(user.id, 20);
  return (
    <SectionShell current="/cafe/my">
      <h1 className="text-[20px] font-bold mb-6">구독 · 내 카페</h1>
      <section aria-label="가입 카페" className="mb-10">
        <h2 className="flex items-center justify-between text-[16px] font-bold mb-2">
          <span>가입한 카페 <span className="text-dv-text-3 font-normal text-[13px]">{cafes.length}</span></span>
          <Link href="/cafe/create" className="text-[13px] font-normal text-dv-green">+ 카페 만들기</Link>
        </h2>
        <ul className="grid grid-cols-2 gap-x-6">
          {cafes.map((c) => (
            <li key={c.id} className="relative">
              <CafeCard cafe={c} clk="cafe_my.card" />
              <span className="absolute right-3 top-3 text-[11px] px-1.5 py-0.5 rounded bg-dv-bg-2 text-dv-text-2">{c.role === "owner" ? "매니저" : c.role === "staff" ? "스태프" : "멤버"}</span>
            </li>
          ))}
          {cafes.length === 0 && <li className="py-8 text-dv-text-3">가입한 카페가 없습니다. <Link href="/cafe" className="text-dv-green font-bold">카페 둘러보기</Link></li>}
        </ul>
      </section>
      <section aria-label="내가 쓴 글">
        <h2 className="text-[16px] font-bold mb-2">내가 쓴 글</h2>
        <PostRows posts={posts} clk="cafe_my.post" />
      </section>
    </SectionShell>
  );
}
