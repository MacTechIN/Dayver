import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SectionShell } from "@/components/cafe/SectionShell";
import { CafeInfoForm } from "@/components/cafe/CafeForms";

export const metadata: Metadata = { title: "카페 만들기 - DAYVER 카페" };

export default async function CreateCafePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=" + encodeURIComponent("/cafe/create"));
  return (
    <SectionShell current="/cafe/create" promo={false}>
      <h1 className="text-[20px] font-bold mb-1">카페 만들기</h1>
      <p className="text-[13px] text-dv-text-3 mb-6">카페를 만들면 매니저가 되며 기본 게시판(공지사항, 자유게시판, 질문답변, 정보공유, 가입인사)이 함께 생성됩니다.</p>
      <div className="dv-card p-6 max-w-[640px]">
        <CafeInfoForm />
      </div>
    </SectionShell>
  );
}
